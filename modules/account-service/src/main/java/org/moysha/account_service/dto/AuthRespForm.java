package org.moysha.account_service.dto;

import lombok.Data;
import org.moysha.account_service.enums.Role;

@Data
public class AuthRespForm {
    private final String token;
    private final String username;
    private final Role role;
}
