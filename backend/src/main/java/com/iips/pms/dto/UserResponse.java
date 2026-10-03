package com.iips.pms.dto;

public record UserResponse(
        Long id,
        String name,
        String email,
        String role
) {}
