package com.iips.pms.controller;

import com.iips.pms.dto.LinkRepoRequest;
import com.iips.pms.entity.CommitRecord;
import com.iips.pms.entity.LinkedRepository;
import com.iips.pms.service.RepositoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/repository")
public class RepositoryController {

    private final RepositoryService repositoryService;

    public RepositoryController(RepositoryService repositoryService) {
        this.repositoryService = repositoryService;
    }

    @GetMapping
    public ResponseEntity<LinkedRepository> get(@PathVariable Long projectId) {
        return ResponseEntity.ok(repositoryService.getLink(projectId));
    }

    @PostMapping("/link")
    public ResponseEntity<LinkedRepository> link(@PathVariable Long projectId,
                                                  Authentication auth,
                                                  @Valid @RequestBody LinkRepoRequest req) {
        return ResponseEntity.ok(repositoryService.link(projectId, auth.getName(), req.repoUrl()));
    }

    @PostMapping("/sync")
    public ResponseEntity<List<CommitRecord>> sync(@PathVariable Long projectId,
                                                    Authentication auth) {
        return ResponseEntity.ok(repositoryService.syncCommits(projectId, auth.getName()));
    }

    @GetMapping("/commits")
    public ResponseEntity<List<CommitRecord>> commits(@PathVariable Long projectId) {
        return ResponseEntity.ok(repositoryService.commits(projectId));
    }

    @GetMapping("/branches")
    public ResponseEntity<List<java.util.Map<String, String>>> branches(
            @PathVariable Long projectId) {
        return ResponseEntity.ok(repositoryService.branches(projectId));
    }
}
