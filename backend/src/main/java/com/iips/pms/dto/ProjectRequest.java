package com.iips.pms.dto;

import jakarta.validation.constraints.NotBlank;

public record ProjectRequest(
        @NotBlank String title,
        String abstractText,
        String techStack
) {}
