package com.iips.pms.controller;

import com.iips.pms.dto.ProjectRequest;
import com.iips.pms.entity.Project;
import com.iips.pms.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
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
}
