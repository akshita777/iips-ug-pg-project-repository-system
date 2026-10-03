package com.iips.pms.dto;

import jakarta.validation.constraints.NotNull;

public record TeamAddRequest(
        @NotNull Long studentId,
        @NotNull String teamRole
) {}
