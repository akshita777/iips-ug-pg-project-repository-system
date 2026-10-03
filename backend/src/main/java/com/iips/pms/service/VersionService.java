package com.iips.pms.service;

import com.iips.pms.exception.ResourceNotFoundException;
import com.iips.pms.storage.FileStorage;
import com.iips.pms.entity.Project;
import com.iips.pms.entity.SubmissionVersion;
import com.iips.pms.entity.User;
import com.iips.pms.repository.GuideAllocationRepository;
import com.iips.pms.repository.ProjectRepository;
import com.iips.pms.repository.SubmissionVersionRepository;
import com.iips.pms.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class VersionService {

    private final ProjectRepository projectRepository;
    private final SubmissionVersionRepository versionRepository;
    private final GuideAllocationRepository allocationRepository;
    private final UserRepository userRepository;
    private final DeadlineService deadlineService;
    private final FileStorage fileStorage;

    public VersionService(ProjectRepository projectRepository,
                          SubmissionVersionRepository versionRepository,
                          GuideAllocationRepository allocationRepository,
                          UserRepository userRepository,
                          DeadlineService deadlineService,
                          FileStorage fileStorage) {
        this.projectRepository = projectRepository;
        this.versionRepository = versionRepository;
        this.allocationRepository = allocationRepository;
        this.userRepository = userRepository;
        this.deadlineService = deadlineService;
        this.fileStorage = fileStorage;
    }

    public List<SubmissionVersion> list(Long projectId, String callerEmail) {
        Project project = findProject(projectId);
        checkAccess(project, callerEmail);
        return versionRepository.findByProjectIdOrderByVersionNumberDesc(projectId);
    }

    @Transactional
    public SubmissionVersion upload(Long projectId, String callerEmail,
                                    MultipartFile file, String comments) throws IOException {
        Project project = findProject(projectId);
        User caller = userRepository.findByEmail(callerEmail).orElseThrow(() -> new ResourceNotFoundException("Record not found"));
        if (!(caller instanceof com.iips.pms.entity.Student)
                || !project.getStudent().getId().equals(caller.getId())) {
            throw new IllegalStateException("Only the owning student can upload versions");
        }
        deadlineService.checkOpen(project.getStudent(), project.getType());
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }

        List<SubmissionVersion> existing =
                versionRepository.findByProjectIdOrderByVersionNumberDesc(projectId);
        int next = existing.isEmpty() ? 1 : existing.get(0).getVersionNumber() + 1;

        String storedAt = fileStorage.store(projectId, next,
                file.getOriginalFilename(), file.getBytes());

        SubmissionVersion version = new SubmissionVersion();
        version.setProject(project);
        version.setVersionNumber(next);
        version.setFilePath(storedAt);
        version.setComments(comments);
        return versionRepository.save(version);
    }

    private Project findProject(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + id));
    }

    private void checkAccess(Project project, String callerEmail) {
        User caller = userRepository.findByEmail(callerEmail).orElseThrow(() -> new ResourceNotFoundException("Record not found"));
        if (project.getStudent().getEmail().equals(callerEmail)) {
            return;
        }
        boolean isGuide = allocationRepository.findByProjectId(project.getId()).stream()
                .anyMatch(a -> a.getFaculty().getEmail().equals(callerEmail));
        boolean isStaff = "COORDINATOR".equals(caller.getRole()) || "ADMIN".equals(caller.getRole());
        if (!isGuide && !isStaff) {
            throw new IllegalStateException("You do not have access to this project");
        }
    }
}
