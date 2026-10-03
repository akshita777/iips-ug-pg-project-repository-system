package com.iips.pms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record DeadlineRequest(
        @NotBlank String projectType,
        @NotNull LocalDateTime opensOn,
        @NotNull LocalDateTime closesOn
) {}
