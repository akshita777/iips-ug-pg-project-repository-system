package com.iips.pms.service;

import com.iips.pms.exception.ResourceNotFoundException;
import com.iips.pms.dto.UpdateProfileRequest;
import com.iips.pms.dto.UserResponse;
import com.iips.pms.entity.Student;
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
                .map(UserService::toResponse)
                .toList();
    }

    public UserResponse me(String email) {
        return toResponse(findByEmail(email));
    }

    @Transactional
    public UserResponse updateMe(String email, UpdateProfileRequest req) {
        User user = findByEmail(email);
        if (req.name() != null && !req.name().isBlank()) {
            if (req.name().trim().length() < 2) {
                throw new IllegalArgumentException("Enter your full name");
            }
            user.setName(req.name().trim());
        }
        if (user instanceof Student student) {
            if (req.rollNumber() != null && !req.rollNumber().isBlank()) {
                RollNumber.Parsed parsed = RollNumber.parse(req.rollNumber());
                student.setRollNumber(parsed.normalized());
                student.setProgramCode(parsed.programCode());
                student.setBatchYear(parsed.batchYear());
                student.setSection(RollNumber.sectionFor(user.getName(), null));
            }
            if (req.semester() != null) {
                if (req.semester() < 1 || req.semester() > 10) {
                    throw new IllegalArgumentException("Semester must be between 1 and 10");
                }
                student.setSemester(req.semester());
            }
        } else if ((req.rollNumber() != null && !req.rollNumber().isBlank()) || req.semester() != null) {
            throw new IllegalArgumentException("Only students have roll numbers and semesters");
        }
        return toResponse(userRepository.save(user));
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
        return toResponse(userRepository.findById(userId).orElse(user));
    }

    private User findByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(
                () -> new ResourceNotFoundException("User not found: " + email));
    }

    private static UserResponse toResponse(User u) {
        String roll = null;
        Integer sem = null;
        String section = null;
        if (u instanceof Student s) {
            roll = s.getRollNumber();
            sem = s.getSemester();
            section = s.getSection();
        }
        return new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getRole(), roll, sem, section);
    }
}
