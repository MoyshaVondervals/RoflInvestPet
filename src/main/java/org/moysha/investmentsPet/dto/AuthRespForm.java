package org.moysha.investmentsPet.dto;

import lombok.Data;
import org.moysha.investmentsPet.enums.Role;

@Data
public class AuthRespForm {
    private final String token;
    private final String username;
    private final Role role;
}