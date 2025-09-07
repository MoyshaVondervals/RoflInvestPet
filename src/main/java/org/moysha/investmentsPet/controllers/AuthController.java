package org.moysha.investmentsPet.controllers;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.moysha.investmentsPet.dto.AuthRespForm;
import org.moysha.investmentsPet.dto.JwtAuthenticationResponse;
import org.moysha.investmentsPet.dto.SignInRequest;
import org.moysha.investmentsPet.dto.SignUpRequest;
import org.moysha.investmentsPet.services.AuthenticationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Аутентификация")
public class AuthController {
    private final AuthenticationService authenticationService;

    @Operation(summary = "Регистрация пользователя")
    @PostMapping("/sign-up")
    public ResponseEntity<AuthRespForm> signUp(@RequestBody @Valid SignUpRequest request) {
        return authenticationService.signUp(request);
    }


    @Operation(summary = "Логин пользователя")
    @PostMapping("/sign-in")
    public ResponseEntity<AuthRespForm> signIn(@RequestBody @Valid SignInRequest request) {
        System.err.println("SignIn started");
        return authenticationService.signIn(request);
    }

}
