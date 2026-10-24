package com.campusos.user;

import com.campusos.common.ApiResponse;
import com.campusos.common.AppException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers(@RequestParam(required = false) Role role) {
        if (role != null) {
            return ResponseEntity.ok(ApiResponse.success(userRepository.findByRoleOrderByNameAsc(role)));
        }
        return ResponseEntity.ok(ApiResponse.success(userRepository.findAll()));
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<User>> createUser(@RequestBody Map<String, String> req) {
        String name = req.get("name");
        String email = req.get("email").toLowerCase().trim();
        String password = req.get("password") != null ? req.get("password") : "password123";
        Role role = Role.valueOf(req.get("role").toUpperCase());
        String department = req.get("department");
        String studentIdOrStaffId = req.get("studentIdOrStaffId");
        String dobStr = req.get("dateOfBirth");
        java.time.LocalDate dob = null;
        if (dobStr != null && !dobStr.isBlank()) {
            try {
                dob = java.time.LocalDate.parse(dobStr);
            } catch (Exception ignored) {}
        }

        if (userRepository.existsByEmail(email)) {
            throw AppException.conflict("Email is already registered");
        }

        User user = new User(name, email, passwordEncoder.encode(password), role, department, studentIdOrStaffId, dob);
        User saved = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("User created successfully", saved));
    }
}
