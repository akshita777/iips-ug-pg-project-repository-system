package com.iips.pms.controller;

import com.iips.pms.dto.AllocationDecisionRequest;
import com.iips.pms.dto.PreferenceRequest;
import com.iips.pms.entity.GuideAllocation;
import com.iips.pms.service.AllocationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/allocations")
public class AllocationController {

    private final AllocationService allocationService;

    public AllocationController(AllocationService allocationService) {
        this.allocationService = allocationService;
    }

    @GetMapping
    public ResponseEntity<List<GuideAllocation>> list(Authentication auth) {
        return ResponseEntity.ok(allocationService.listForCaller(auth.getName()));
    }

    @PostMapping("/suggest")
    public ResponseEntity<List<GuideAllocation>> suggest() {
        return ResponseEntity.ok(allocationService.suggest());
    }

    @PostMapping("/confirm")
    public ResponseEntity<GuideAllocation> confirm(
            @Valid @RequestBody AllocationDecisionRequest req) {
        return ResponseEntity.ok(allocationService.confirm(req.allocationId()));
    }

    @PostMapping("/override")
    public ResponseEntity<GuideAllocation> override(
            @Valid @RequestBody AllocationDecisionRequest req) {
        if (req.facultyId() == null) {
            throw new IllegalArgumentException("facultyId is required to adjust an allocation");
        }
        return ResponseEntity.ok(allocationService.override(req.allocationId(), req.facultyId()));
    }

    @PostMapping("/preferences")
    public ResponseEntity<Void> preferences(Authentication auth,
                                            @Valid @RequestBody PreferenceRequest req) {
        allocationService.savePreferences(auth.getName(), req);
        return ResponseEntity.ok().build();
    }
}
