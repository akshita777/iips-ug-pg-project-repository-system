package com.iips.pms.dto;

import jakarta.validation.constraints.NotBlank;

public record SynopsisRequest(
        @NotBlank String title,
        @NotBlank String summary
) {}
