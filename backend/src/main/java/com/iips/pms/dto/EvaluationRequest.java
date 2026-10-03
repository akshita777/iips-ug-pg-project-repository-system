package com.iips.pms.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record EvaluationRequest(
        @NotNull Long projectId,
        @NotNull Long rubricId,
        @NotNull BigDecimal totalMarks,
        String feedback
) {}
