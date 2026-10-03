package com.iips.pms.controller;

import com.iips.pms.dto.ReviewRequest;
import com.iips.pms.entity.CodeReview;
import com.iips.pms.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    public ResponseEntity<List<CodeReview>> list(@PathVariable Long projectId) {
        return ResponseEntity.ok(reviewService.list(projectId));
    }

    @PostMapping
    public ResponseEntity<CodeReview> create(@PathVariable Long projectId,
                                             Authentication auth,
                                             @Valid @RequestBody ReviewRequest req) {
        return ResponseEntity.ok(reviewService.create(projectId, auth.getName(), req));
    }
}
