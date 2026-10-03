package com.iips.pms.controller;

import com.iips.pms.dto.SynopsisRequest;
import com.iips.pms.entity.Synopsis;
import com.iips.pms.service.SynopsisService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/synopses")
public class SynopsisController {

    private final SynopsisService synopsisService;

    public SynopsisController(SynopsisService synopsisService) {
        this.synopsisService = synopsisService;
    }

    @GetMapping("/mine")
    public ResponseEntity<List<Synopsis>> mine(Authentication auth) {
        return ResponseEntity.ok(synopsisService.mySynopses(auth.getName()));
    }

    @PostMapping
    public ResponseEntity<Synopsis> create(Authentication auth,
                                           @Valid @RequestBody SynopsisRequest req) {
        return ResponseEntity.ok(synopsisService.create(auth.getName(), req));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<Synopsis> submit(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(synopsisService.submit(id, auth.getName()));
    }

    @PostMapping("/{id}/decision")
    public ResponseEntity<Synopsis> decide(@PathVariable Long id,
                                           Authentication auth,
                                           @RequestBody Map<String, Boolean> body) {
        Boolean approved = body.get("approved");
        if (approved == null) {
            throw new IllegalArgumentException("approved must be true or false");
        }
        return ResponseEntity.ok(synopsisService.decide(id, auth.getName(), approved));
    }
}
