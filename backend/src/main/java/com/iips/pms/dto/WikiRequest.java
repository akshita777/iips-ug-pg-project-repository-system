package com.iips.pms.dto;

import jakarta.validation.constraints.NotBlank;

public record WikiRequest(
        @NotBlank String title,
        String body
) {}
