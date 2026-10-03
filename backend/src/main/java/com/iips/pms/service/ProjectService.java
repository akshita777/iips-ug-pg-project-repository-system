package com.iips.pms.service;

import com.iips.pms.dto.ProjectRequest;
import com.iips.pms.entity.Project;
import com.iips.pms.entity.Student;
import com.iips.pms.event.ProjectStatusEvent;
import com.iips.pms.exception.ResourceNotFoundException;
import com.iips.pms.repository.GuideAllocationRepository;
import com.iips.pms.repository.ProjectRepository;
import com.iips.pms.repository.UserRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final GuideAllocationRepository allocationRepository;
    private final ApplicationEventPublisher events;

    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository,
                          GuideAllocationRepository allocationRepository,
                          ApplicationEventPublisher events) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.allocationRepository = allocationRepository;
        this.events = events;
    }

    public List<Project> findAll() {
        return projectRepository.findAll();
    }

    public Project findById(Long id) {
        return projectRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Project not found: " + id));
    }

    @Transactional
    public Project create(String studentEmail, ProjectRequest req) {
        var user = userRepository.findByEmail(studentEmail).orElseThrow(
                () -> new ResourceNotFoundException("User not found: " + studentEmail));
        if (!(user instanceof Student student)) {
            throw new IllegalStateException("Only students can create projects");
        }
        Project project = new Project();
        project.setStudent(student);
        project.setTitle(req.title());
        project.setAbstractText(req.abstractText());
        project.setTechStack(req.techStack());
        project.setStatus(Project.ProjectStatus.DRAFT);
        return projectRepository.save(project);
    }

    @Transactional
    public Project submit(Long id) {
        Project project = findById(id);
        if (project.getStatus() != Project.ProjectStatus.DRAFT
                && project.getStatus() != Project.ProjectStatus.REJECTED) {
            throw new IllegalStateException("Only DRAFT or REJECTED projects can be submitted");
        }
        return moveTo(project, Project.ProjectStatus.SUBMITTED);
    }

    @Transactional
    public Project startReview(Long id, String guideEmail) {
        Project project = findById(id);
        checkAllocatedGuide(project, guideEmail);
        if (project.getStatus() != Project.ProjectStatus.SUBMITTED) {
            throw new IllegalStateException("Only SUBMITTED projects can move to review");
        }
        return moveTo(project, Project.ProjectStatus.UNDER_REVIEW);
    }

    @Transactional
    public Project approve(Long id, String guideEmail) {
        Project project = findById(id);
        checkAllocatedGuide(project, guideEmail);
        if (project.getStatus() != Project.ProjectStatus.UNDER_REVIEW) {
            throw new IllegalStateException("Only projects UNDER_REVIEW can be approved");
        }
        return moveTo(project, Project.ProjectStatus.APPROVED);
    }

    @Transactional
    public Project reject(Long id, String guideEmail) {
        Project project = findById(id);
        checkAllocatedGuide(project, guideEmail);
        if (project.getStatus() != Project.ProjectStatus.UNDER_REVIEW) {
            throw new IllegalStateException("Only projects UNDER_REVIEW can be returned");
        }
        return moveTo(project, Project.ProjectStatus.REJECTED);
    }

    private void checkAllocatedGuide(Project project, String guideEmail) {
        boolean allocated = allocationRepository.findByProjectId(project.getId()).stream()
                .anyMatch(a -> a.getFaculty().getEmail().equals(guideEmail));
        if (!allocated) {
            throw new IllegalStateException("Only the allocated guide can review this project");
        }
    }

    private Project moveTo(Project project, Project.ProjectStatus next) {
        Project.ProjectStatus current = project.getStatus();
        project.setStatus(next);
        Project saved = projectRepository.save(project);
        events.publishEvent(new ProjectStatusEvent(project.getId(), current, next));
        return saved;
    }
}
