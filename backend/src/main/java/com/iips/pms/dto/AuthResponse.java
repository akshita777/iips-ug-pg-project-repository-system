package com.iips.pms.dto;

public record AuthResponse(
        String token,
        String refreshToken,
        String email,
        String role
) {}
