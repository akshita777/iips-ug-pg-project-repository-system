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
    private final SynopsisService synopsisService;
    private final DeadlineService deadlineService;

    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository,
                          GuideAllocationRepository allocationRepository,
                          ApplicationEventPublisher events,
                          SynopsisService synopsisService,
                          DeadlineService deadlineService) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.allocationRepository = allocationRepository;
        this.events = events;
        this.synopsisService = synopsisService;
        this.deadlineService = deadlineService;
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
        Project.ProjectType type;
        try {
            type = req.type() == null ? Project.ProjectType.MINOR
                    : Project.ProjectType.valueOf(req.type().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Project type must be MINOR or MAJOR");
        }
        if (type == Project.ProjectType.MINOR
                && (student.getSemester() == null || student.getSemester() != 6)) {
            throw new IllegalStateException("Minor projects belong to semester 6");
        }
        if (type == Project.ProjectType.MAJOR
                && (student.getSemester() == null || student.getSemester() != 10)) {
            throw new IllegalStateException("Major projects belong to semester 10");
        }
        if (!synopsisService.hasApproved(student)) {
            throw new IllegalStateException("An approved synopsis is required before creating a project");
        }
        Project project = new Project();
        project.setStudent(student);
        project.setTitle(req.title());
        project.setAbstractText(req.abstractText());
        project.setTechStack(req.techStack());
        project.setType(type);
        project.setStatus(Project.ProjectStatus.DRAFT);
        return projectRepository.save(project);
    }

    @Transactional
    public Project submit(Long id) {
        Project project = findById(id);
        if (project.getStatus() != Project.ProjectStatus.DRAFT
                && project.getStatus() != Project.ProjectStatus.REJECTED
                && project.getStatus() != Project.ProjectStatus.EVALUATED) {
            throw new IllegalStateException("Only DRAFT, REJECTED, or returned projects can be submitted");
        }
        deadlineService.checkOpen(project.getStudent(), project.getType());
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
