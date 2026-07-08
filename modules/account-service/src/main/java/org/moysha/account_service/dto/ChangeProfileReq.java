package org.moysha.account_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class ChangeProfileReq {
    @Schema(description = "Имя пользователя")
    private String username;

    @Schema(description = "био")
    private String bio;
}
