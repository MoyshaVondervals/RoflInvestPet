package org.moysha.investmentsPet.dto;

import lombok.Data;

import java.util.Base64;

@Data
public class ProfileResp {
    private String username;
    private String bio;
    private String userAvatar;

    public ProfileResp(String username, String bio, byte[] logoBase64) {
        this.username = username;
        this.bio = bio;
        this.userAvatar = Base64.getEncoder().encodeToString(logoBase64);
    }
}
