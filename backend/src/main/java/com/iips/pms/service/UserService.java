package com.iips.pms.service;

import com.iips.pms.exception.ResourceNotFoundException;
import com.iips.pms.dto.UserResponse;
import com.iips.pms.entity.User;
import com.iips.pms.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
public class UserService {

    private static final Set<String> ROLES =
            Set.of("STUDENT", "FACULTY", "COORDINATOR", "EVALUATOR", "ADMIN");

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserResponse> listAll() {
        return userRepository.findAll().stream()
                .map(u -> new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getRole()))
                .toList();
    }

    @Transactional
    public UserResponse changeRole(Long userId, String role) {
        String normalized = role.toUpperCase();
        if (!ROLES.contains(normalized)) {
            throw new IllegalArgumentException(
                    "Role must be STUDENT, FACULTY, COORDINATOR, EVALUATOR, or ADMIN");
        }
        User user = userRepository.findById(userId).orElseThrow(
                () -> new ResourceNotFoundException("User not found: " + userId));
        userRepository.updateRole(userId, normalized);
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), normalized);
    }
}
