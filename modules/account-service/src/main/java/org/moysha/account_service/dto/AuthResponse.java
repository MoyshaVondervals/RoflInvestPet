package org.moysha.account_service.dto;

public record AuthResponse(
        String token,
        String email
) {
}
