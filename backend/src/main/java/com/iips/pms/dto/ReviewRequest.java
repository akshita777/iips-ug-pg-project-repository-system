package com.iips.pms.dto;

import jakarta.validation.constraints.NotBlank;

public record ReviewRequest(
        @NotBlank String status,
        String comments
) {}
