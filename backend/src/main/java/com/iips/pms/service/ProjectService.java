package com.iips.pms.service;

import com.iips.pms.dto.ProjectRequest;
import com.iips.pms.entity.Project;
import com.iips.pms.entity.Student;
import com.iips.pms.repository.ProjectRepository;
import com.iips.pms.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public List<Project> findAll() {
        return projectRepository.findAll();
    }

    public Project findById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + id));
    }

    @Transactional
    public Project create(String studentEmail, ProjectRequest req) {
        var user = userRepository.findByEmail(studentEmail).orElseThrow();
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
        project.setStatus(Project.ProjectStatus.SUBMITTED);
        return projectRepository.save(project);
    }
}
