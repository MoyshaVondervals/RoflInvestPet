package org.moysha.account_service.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.moysha.account_service.dto.AuthRespForm;
import org.moysha.account_service.dto.JwtAuthenticationResponse;
import org.moysha.account_service.dto.SignInRequest;
import org.moysha.account_service.dto.SignUpRequest;
import org.moysha.account_service.enums.InvestmentStatus;
import org.moysha.account_service.enums.Role;
import org.moysha.account_service.models.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final JwtService jwtService;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final BrokerageAccountService brokerageAccountService;

    @Transactional
    public ResponseEntity<AuthRespForm> signUp(SignUpRequest request) {
        var user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .investorStatus(InvestmentStatus.BASIC)
                .createdAt(LocalDateTime.now())
                .role(Role.ROLE_USER)
                .build();

        userService.create(user);

        var jwt = jwtService.generateToken(user);
        return new ResponseEntity<>(new AuthRespForm(jwt, request.getUsername(), Role.ROLE_USER), HttpStatus.OK);
    }

    public ResponseEntity<AuthRespForm> signIn(SignInRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                request.getUsername(),
                request.getPassword()
        ));
        var user = userService.userDetailsService().loadUserByUsername(request.getUsername());
        var jwt = jwtService.generateToken(user);
        String username = request.getUsername();
        return new ResponseEntity<>(new AuthRespForm(jwt, username, userService.getUserRole(username)), HttpStatus.OK);
    }
}
