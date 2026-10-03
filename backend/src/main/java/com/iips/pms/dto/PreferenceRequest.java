package com.iips.pms.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record PreferenceRequest(
        @NotNull Long projectId,
        @NotNull List<Long> facultyIds
) {}
