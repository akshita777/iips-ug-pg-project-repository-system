package com.iips.pms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record LinkRepoRequest(
        @NotBlank
        @Pattern(regexp = "https://github\\.com/[\\w.-]+/[\\w.-]+/?",
                message = "Must be a GitHub repository URL like https://github.com/owner/name")
        String repoUrl
) {}
