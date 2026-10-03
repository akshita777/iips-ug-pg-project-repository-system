package com.iips.pms.controller;

import com.iips.pms.dto.ProjectRequest;
import com.iips.pms.entity.Project;
import com.iips.pms.entity.SubmissionVersion;
import com.iips.pms.service.ArchiveService;
import com.iips.pms.service.ProjectService;
import com.iips.pms.service.VersionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
public class ProjectController {

    private final ProjectService projectService;
    private final VersionService versionService;
    private final ArchiveService archiveService;

    public ProjectController(ProjectService projectService, VersionService versionService,
                             ArchiveService archiveService) {
        this.projectService = projectService;
        this.versionService = versionService;
        this.archiveService = archiveService;
    }

    @GetMapping
    public ResponseEntity<List<Project>> getAll() {
        return ResponseEntity.ok(projectService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Project> create(Authentication auth,
                                          @Valid @RequestBody ProjectRequest req) {
        return ResponseEntity.ok(projectService.create(auth.getName(), req));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<Project> submit(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.submit(id));
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<Project> startReview(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(projectService.startReview(id, auth.getName()));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Project> approve(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(projectService.approve(id, auth.getName()));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<Project> reject(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(projectService.reject(id, auth.getName()));
    }

    @GetMapping("/{id}/versions")
    public ResponseEntity<List<SubmissionVersion>> versions(@PathVariable Long id,
                                                            Authentication auth) {
        return ResponseEntity.ok(versionService.list(id, auth.getName()));
    }

    @PostMapping("/{id}/versions")
    public ResponseEntity<SubmissionVersion> uploadVersion(@PathVariable Long id,
                                                           Authentication auth,
                                                           @RequestParam("file") MultipartFile file,
                                                           @RequestParam(value = "comments", required = false)
                                                           String comments) throws IOException {
        return ResponseEntity.ok(versionService.upload(id, auth.getName(), file, comments));
    }

    @GetMapping("/{id}/export")
    public ResponseEntity<StreamingResponseBody> export(@PathVariable Long id,
                                                        Authentication auth) {
        StreamingResponseBody body = archiveService.exportZip(id, auth.getName());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"project-" + id + ".zip\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(body);
    }
}
