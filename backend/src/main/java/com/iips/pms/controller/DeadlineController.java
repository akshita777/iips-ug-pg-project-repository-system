package com.iips.pms.controller;

import com.iips.pms.dto.DeadlineRequest;
import com.iips.pms.entity.DeadlineWindow;
import com.iips.pms.service.DeadlineService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/deadlines")
public class DeadlineController {

    private final DeadlineService deadlineService;

    public DeadlineController(DeadlineService deadlineService) {
        this.deadlineService = deadlineService;
    }

    @GetMapping
    public ResponseEntity<List<DeadlineWindow>> list(Authentication auth) {
        return ResponseEntity.ok(deadlineService.listForCaller(auth.getName()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public ResponseEntity<DeadlineWindow> set(Authentication auth,
                                               @Valid @RequestBody DeadlineRequest req) {
        return ResponseEntity.ok(deadlineService.set(auth.getName(), req));
    }
}
