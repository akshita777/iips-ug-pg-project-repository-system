package com.iips.pms.dto;

public record AuthResponse(
        String token,
        String refreshToken,
        String email,
        String role,
        String name,
        Boolean needsRegistration
) {
    public AuthResponse(String token, String refreshToken, String email, String role) {
        this(token, refreshToken, email, role, null, false);
    }
}
