package com.iips.pms.service;

import com.iips.pms.exception.ResourceNotFoundException;
import com.iips.pms.dto.AuthRequest;
import com.iips.pms.dto.AuthResponse;
import com.iips.pms.dto.RegisterRequest;
import com.iips.pms.entity.Administrator;
import com.iips.pms.entity.Coordinator;
import com.iips.pms.entity.Evaluator;
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
        String role = req.role().toUpperCase();
        User user;
        switch (role) {
            case "STUDENT" -> {
                Student s = new Student();
                RollNumber.Parsed parsed = RollNumber.parse(req.rollNumber());
                s.setRollNumber(parsed.normalized());
                s.setProgramCode(parsed.programCode());
                s.setBatchYear(parsed.batchYear());
                s.setSection(RollNumber.sectionFor(req.name(), req.section()));
                if (req.semester() == null || req.semester() < 1 || req.semester() > 10) {
                    throw new IllegalArgumentException("Semester must be between 1 and 10");
                }
                s.setSemester(req.semester());
                user = s;
            }
            case "FACULTY" -> user = new Faculty();
            case "COORDINATOR" -> user = new Coordinator();
            case "EVALUATOR" -> user = new Evaluator();
            case "ADMIN" -> user = new Administrator();
            default -> throw new IllegalArgumentException(
                    "Role must be STUDENT, FACULTY, COORDINATOR, EVALUATOR, or ADMIN");
        }
        user.setName(req.name());
        user.setEmail(req.email());
        user.setPassword(passwordEncoder.encode(req.password()));
        userRepository.save(user);
        String token = jwtUtil.generateToken(req.email(), role);
        String refresh = jwtUtil.generateRefreshToken(req.email());
        return new AuthResponse(token, refresh, req.email(), role);
    }

    public AuthResponse login(AuthRequest req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password()));
        var user = userRepository.findByEmail(req.email()).orElseThrow(() -> new ResourceNotFoundException("Record not found"));
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        String refresh = jwtUtil.generateRefreshToken(user.getEmail());
        return new AuthResponse(token, refresh, user.getEmail(), user.getRole());
    }

    public AuthResponse refresh(String refreshToken) {
        String email = jwtUtil.extractEmail(refreshToken);
        var user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("Record not found"));
        String token = jwtUtil.generateToken(email, user.getRole());
        return new AuthResponse(token, refreshToken, email, user.getRole());
    }
}
