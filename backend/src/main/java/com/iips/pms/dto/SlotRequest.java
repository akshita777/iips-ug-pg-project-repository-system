package com.iips.pms.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record SlotRequest(
        @NotNull LocalDateTime startsAt
) {}
