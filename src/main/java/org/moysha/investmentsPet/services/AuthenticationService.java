package org.moysha.investmentsPet.services;

import lombok.RequiredArgsConstructor;

import org.moysha.investmentsPet.dto.JwtAuthenticationResponse;
import org.moysha.investmentsPet.dto.SignInRequest;
import org.moysha.investmentsPet.dto.SignUpRequest;
import org.moysha.investmentsPet.enums.Role;
import org.moysha.investmentsPet.models.User;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final JwtService jwtService;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public JwtAuthenticationResponse sugnUp(SignUpRequest request) {
        var user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ROLE_USER).build();
        userService.create(user);
        var jwt = jwtService.generateToken(user);
        return new JwtAuthenticationResponse(jwt);
    }

    public JwtAuthenticationResponse signIn(SignInRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                request.getUsername(),
                request.getPassword()
        ));
        var user = userService.userDetailsService().loadUserByUsername(request.getUsername());
        var jwt = jwtService.generateToken(user);
        return new JwtAuthenticationResponse(jwt);
    }
}
