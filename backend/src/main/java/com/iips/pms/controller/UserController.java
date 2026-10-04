package com.iips.pms.controller;

import com.iips.pms.dto.RoleUpdateRequest;
import com.iips.pms.dto.UpdateProfileRequest;
import com.iips.pms.dto.UserResponse;
import com.iips.pms.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(Authentication auth) {
        return ResponseEntity.ok(userService.me(auth.getName()));
    }

    @PatchMapping("/me")
    public ResponseEntity<UserResponse> updateMe(Authentication auth,
                                                 @RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(userService.updateMe(auth.getName(), req));
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> list() {
        return ResponseEntity.ok(userService.listAll());
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<UserResponse> changeRole(@PathVariable Long id,
                                                   @Valid @RequestBody RoleUpdateRequest req) {
        return ResponseEntity.ok(userService.changeRole(id, req.role()));
    }
}
