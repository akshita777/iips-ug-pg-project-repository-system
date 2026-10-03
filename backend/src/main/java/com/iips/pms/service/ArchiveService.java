package com.iips.pms.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iips.pms.entity.Project;
import com.iips.pms.entity.SubmissionVersion;
import com.iips.pms.entity.User;
import com.iips.pms.exception.ResourceNotFoundException;
import com.iips.pms.repository.EvaluationRepository;
import com.iips.pms.repository.GuideAllocationRepository;
import com.iips.pms.repository.ProjectRepository;
import com.iips.pms.repository.SubmissionVersionRepository;
import com.iips.pms.repository.UserRepository;
import com.iips.pms.storage.FileStorage;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.InputStream;
import java.io.OutputStream;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class ArchiveService {

    private final ProjectRepository projectRepository;
    private final SubmissionVersionRepository versionRepository;
    private final EvaluationRepository evaluationRepository;
    private final GuideAllocationRepository allocationRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final FileStorage fileStorage;

    public ArchiveService(ProjectRepository projectRepository,
                          SubmissionVersionRepository versionRepository,
                          EvaluationRepository evaluationRepository,
                          GuideAllocationRepository allocationRepository,
                          UserRepository userRepository,
                          ObjectMapper objectMapper,
                          FileStorage fileStorage) {
        this.projectRepository = projectRepository;
        this.versionRepository = versionRepository;
        this.evaluationRepository = evaluationRepository;
        this.allocationRepository = allocationRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
        this.fileStorage = fileStorage;
    }

    public StreamingResponseBody exportZip(Long projectId, String callerEmail) {
        Project project = projectRepository.findById(projectId).orElseThrow(
                () -> new ResourceNotFoundException("Project not found: " + projectId));
        User caller = userRepository.findByEmail(callerEmail).orElseThrow(
                () -> new ResourceNotFoundException("User not found: " + callerEmail));
        boolean owner = project.getStudent().getEmail().equals(callerEmail);
        boolean guide = allocationRepository.findByProjectId(projectId).stream()
                .anyMatch(a -> a.getFaculty().getEmail().equals(callerEmail));
        boolean staff = "COORDINATOR".equals(caller.getRole()) || "ADMIN".equals(caller.getRole());
        if (!owner && !guide && !staff) {
            throw new IllegalStateException("You do not have access to export this project");
        }
        return (OutputStream output) -> {
            try (ZipOutputStream zip = new ZipOutputStream(output)) {
                Map<String, Object> manifest = new LinkedHashMap<>();
                manifest.put("title", project.getTitle());
                manifest.put("abstract", project.getAbstractText());
                manifest.put("techStack", project.getTechStack());
                manifest.put("status", project.getStatus().name());
                manifest.put("student", project.getStudent().getEmail());
                manifest.put("versions", versionRepository
                        .findByProjectIdOrderByVersionNumberDesc(projectId).stream()
                        .map(v -> Map.of("number", v.getVersionNumber(),
                                "uploadedAt", String.valueOf(v.getUploadedAt()),
                                "comments", String.valueOf(v.getComments()))).toList());
                manifest.put("evaluations", evaluationRepository.findByProjectId(projectId).stream()
                        .map(e -> Map.of("marks", String.valueOf(e.getTotalMarks()),
                                "feedback", String.valueOf(e.getFeedback()))).toList());
                zip.putNextEntry(new ZipEntry("manifest.json"));
                zip.write(objectMapper.writeValueAsBytes(manifest));
                zip.closeEntry();
                for (SubmissionVersion version
                        : versionRepository.findByProjectIdOrderByVersionNumberDesc(projectId)) {
                    String location = version.getFilePath();
                    if (!fileStorage.exists(location)) {
                        continue;
                    }
                    String name = location.contains("/")
                            ? location.substring(location.lastIndexOf('/') + 1)
                            : location;
                    zip.putNextEntry(new ZipEntry("v" + version.getVersionNumber() + "_" + name));
                    try (InputStream in = fileStorage.load(location)) {
                        in.transferTo(zip);
                    }
                    zip.closeEntry();
                }
            }
        };
    }
}
