package com.iips.pms.service;

import com.iips.pms.dto.WikiRequest;
import com.iips.pms.entity.Project;
import com.iips.pms.entity.User;
import com.iips.pms.entity.WikiPage;
import com.iips.pms.exception.ResourceNotFoundException;
import com.iips.pms.repository.GuideAllocationRepository;
import com.iips.pms.repository.ProjectRepository;
import com.iips.pms.repository.UserRepository;
import com.iips.pms.repository.WikiPageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WikiService {

    private final WikiPageRepository wikiRepository;
    private final ProjectRepository projectRepository;
    private final GuideAllocationRepository allocationRepository;
    private final UserRepository userRepository;

    public WikiService(WikiPageRepository wikiRepository,
                       ProjectRepository projectRepository,
                       GuideAllocationRepository allocationRepository,
                       UserRepository userRepository) {
        this.wikiRepository = wikiRepository;
        this.projectRepository = projectRepository;
        this.allocationRepository = allocationRepository;
        this.userRepository = userRepository;
    }

    public List<WikiPage> list(Long projectId, String callerEmail) {
        findProject(projectId);
        checkReader(projectId, callerEmail);
        return wikiRepository.findByProjectIdOrderByTitleAsc(projectId);
    }

    @Transactional
    public WikiPage save(Long projectId, String callerEmail, WikiRequest req) {
        Project project = findProject(projectId);
        checkWriter(project, callerEmail);
        WikiPage page = wikiRepository.findByProjectIdAndTitle(projectId, req.title())
                .orElseGet(() -> {
                    WikiPage created = new WikiPage();
                    created.setProject(project);
                    created.setTitle(req.title());
                    return created;
                });
        page.setBody(req.body() == null ? "" : req.body());
        return wikiRepository.save(page);
    }

    @Transactional
    public void delete(Long projectId, String callerEmail, Long pageId) {
        Project project = findProject(projectId);
        checkWriter(project, callerEmail);
        WikiPage page = wikiRepository.findById(pageId).orElseThrow(
                () -> new ResourceNotFoundException("Wiki page not found: " + pageId));
        if (!page.getProject().getId().equals(projectId)) {
            throw new IllegalArgumentException("Wiki page does not belong to this project");
        }
        wikiRepository.delete(page);
    }

    private Project findProject(Long id) {
        return projectRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Project not found: " + id));
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email).orElseThrow(
                () -> new ResourceNotFoundException("User not found: " + email));
    }

    private void checkReader(Long projectId, String callerEmail) {
        User caller = findUser(callerEmail);
        Project project = findProject(projectId);
        boolean owner = project.getStudent().getEmail().equals(callerEmail);
        boolean guide = allocationRepository.findByProjectId(projectId).stream()
                .anyMatch(a -> a.getFaculty().getEmail().equals(callerEmail));
        boolean staff = "COORDINATOR".equals(caller.getRole()) || "ADMIN".equals(caller.getRole())
                || "EVALUATOR".equals(caller.getRole());
        if (!owner && !guide && !staff) {
            throw new IllegalStateException("You do not have access to this project");
        }
    }

    private void checkWriter(Project project, String callerEmail) {
        User caller = findUser(callerEmail);
        boolean owner = project.getStudent().getEmail().equals(callerEmail);
        boolean guide = allocationRepository.findByProjectId(project.getId()).stream()
                .anyMatch(a -> a.getFaculty().getEmail().equals(callerEmail));
        boolean staff = "COORDINATOR".equals(caller.getRole()) || "ADMIN".equals(caller.getRole());
        if (!owner && !guide && !staff) {
            throw new IllegalStateException("Only the team, guide, or coordinator can edit documentation");
        }
    }
}
