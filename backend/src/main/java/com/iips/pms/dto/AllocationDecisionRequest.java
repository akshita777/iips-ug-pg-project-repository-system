package com.iips.pms.dto;

import jakarta.validation.constraints.NotNull;

public record AllocationDecisionRequest(
        @NotNull Long allocationId,
        Long facultyId
) {}
