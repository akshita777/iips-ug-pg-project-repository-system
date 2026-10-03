package com.iips.pms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Map;

public record RubricRequest(
        @NotBlank String name,
        @NotNull Map<String, Object> criteria
) {}
