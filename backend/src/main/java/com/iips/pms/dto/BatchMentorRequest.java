package com.iips.pms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record BatchMentorRequest(
        @NotNull Long facultyId,
        @NotBlank String programCode,
        @NotNull Integer batchYear
) {}
