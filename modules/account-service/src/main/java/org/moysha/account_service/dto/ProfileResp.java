package org.moysha.account_service.dto;

import lombok.Data;

import java.util.Base64;
import java.util.Objects;

@Data
public class ProfileResp {
    private String username;
    private String bio;
    private String userAvatar;

    public ProfileResp(String username, String bio, byte[] logoBase64) {
        this.username = username;
        this.bio = Objects.requireNonNullElse(bio, "");

        this.userAvatar = (logoBase64 != null)
                ? Base64.getEncoder().encodeToString(logoBase64)
                : null;
    }
}
