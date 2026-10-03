package com.iips.pms.event;

import com.iips.pms.entity.Project.ProjectStatus;

public record ProjectStatusEvent(
        Long projectId,
        ProjectStatus oldStatus,
        ProjectStatus newStatus
) {}
