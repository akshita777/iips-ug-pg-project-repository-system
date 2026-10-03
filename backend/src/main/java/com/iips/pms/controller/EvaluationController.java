package com.iips.pms.controller;

import com.iips.pms.dto.EvaluationRequest;
import com.iips.pms.entity.Evaluation;
import com.iips.pms.entity.Rubric;
import com.iips.pms.service.EvaluationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/evaluations")
public class EvaluationController {

    private final EvaluationService evaluationService;

    public EvaluationController(EvaluationService evaluationService) {
        this.evaluationService = evaluationService;
    }

    @GetMapping("/assigned")
    public ResponseEntity<List<Evaluation>> assigned(Authentication auth) {
        return ResponseEntity.ok(evaluationService.assignedTo(auth.getName()));
    }

    @PostMapping
    public ResponseEntity<Evaluation> submit(Authentication auth,
                                             @Valid @RequestBody EvaluationRequest req) {
        return ResponseEntity.ok(evaluationService.submit(auth.getName(), req));
    }

    @GetMapping("/rubrics")
    public ResponseEntity<List<Rubric>> rubrics() {
        return ResponseEntity.ok(evaluationService.rubrics());
    }
}
