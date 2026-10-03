package com.iips.pms.controller;

import com.iips.pms.dto.WikiRequest;
import com.iips.pms.entity.WikiPage;
import com.iips.pms.service.WikiService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/wiki")
public class WikiController {

    private final WikiService wikiService;

    public WikiController(WikiService wikiService) {
        this.wikiService = wikiService;
    }

    @GetMapping
    public ResponseEntity<List<WikiPage>> list(@PathVariable Long projectId,
                                               Authentication auth) {
        return ResponseEntity.ok(wikiService.list(projectId, auth.getName()));
    }

    @PutMapping
    public ResponseEntity<WikiPage> save(@PathVariable Long projectId,
                                         Authentication auth,
                                         @Valid @RequestBody WikiRequest req) {
        return ResponseEntity.ok(wikiService.save(projectId, auth.getName(), req));
    }

    @DeleteMapping("/{pageId}")
    public ResponseEntity<Void> delete(@PathVariable Long projectId,
                                       @PathVariable Long pageId,
                                       Authentication auth) {
        wikiService.delete(projectId, auth.getName(), pageId);
        return ResponseEntity.ok().build();
    }
}
