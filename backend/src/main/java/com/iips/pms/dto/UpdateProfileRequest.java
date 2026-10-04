package com.iips.pms.dto;

public record UpdateProfileRequest(
        String name,
        String rollNumber,
        Integer semester
) {}
