package com.iips.pms.service;

import com.iips.pms.dto.AuthRequest;
import com.iips.pms.dto.AuthResponse;
import com.iips.pms.dto.RegisterRequest;
import com.iips.pms.entity.Faculty;
import com.iips.pms.entity.Student;
import com.iips.pms.entity.User;
import com.iips.pms.repository.UserRepository;
import com.iips.pms.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil, AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new IllegalArgumentException("Email already registered");
        }
        User user;
        if ("STUDENT".equalsIgnoreCase(req.role())) {
            Student s = new Student();
            s.setName(req.name());
            s.setEmail(req.email());
            s.setPassword(passwordEncoder.encode(req.password()));
            user = s;
        } else {
            Faculty f = new Faculty();
            f.setName(req.name());
            f.setEmail(req.email());
            f.setPassword(passwordEncoder.encode(req.password()));
            user = f;
        }
        userRepository.save(user);
        String token = jwtUtil.generateToken(req.email(), req.role());
        String refresh = jwtUtil.generateRefreshToken(req.email());
        return new AuthResponse(token, refresh, req.email(), req.role());
    }

    public AuthResponse login(AuthRequest req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password()));
        var user = userRepository.findByEmail(req.email()).orElseThrow();
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        String refresh = jwtUtil.generateRefreshToken(user.getEmail());
        return new AuthResponse(token, refresh, user.getEmail(), user.getRole());
    }

    public AuthResponse refresh(String refreshToken) {
        String email = jwtUtil.extractEmail(refreshToken);
        var user = userRepository.findByEmail(email).orElseThrow();
        String token = jwtUtil.generateToken(email, user.getRole());
        return new AuthResponse(token, refreshToken, email, user.getRole());
    }
}
