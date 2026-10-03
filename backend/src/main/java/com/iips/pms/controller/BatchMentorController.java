package com.iips.pms.controller;

import com.iips.pms.dto.BatchMentorRequest;
import com.iips.pms.entity.BatchMentor;
import com.iips.pms.service.BatchMentorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/batch-mentors")
@PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
public class BatchMentorController {

    private final BatchMentorService batchMentorService;

    public BatchMentorController(BatchMentorService batchMentorService) {
        this.batchMentorService = batchMentorService;
    }

    @GetMapping
    public ResponseEntity<List<BatchMentor>> list() {
        return ResponseEntity.ok(batchMentorService.listAll());
    }

    @PostMapping
    public ResponseEntity<BatchMentor> assign(@Valid @RequestBody BatchMentorRequest req) {
        return ResponseEntity.ok(batchMentorService.assign(req));
    }
}
