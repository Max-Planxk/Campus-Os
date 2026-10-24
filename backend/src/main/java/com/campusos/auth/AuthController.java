package com.campusos.auth;

import com.campusos.common.ApiResponse;
import com.campusos.common.AppException;
import com.campusos.course.Course;
import com.campusos.course.CourseRepository;
import com.campusos.course.Enrollment;
import com.campusos.course.EnrollmentRepository;
import com.campusos.user.Role;
import com.campusos.user.User;
import com.campusos.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository,
                          CourseRepository courseRepository,
                          EnrollmentRepository enrollmentRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    private LoginResponse buildLoginResponse(User user, String token) {
        return new LoginResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getDepartment(),
                user.getStudentIdOrStaffId(),
                user.getDateOfBirth()
        );
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> AppException.unauthorized("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw AppException.unauthorized("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user);
        return ResponseEntity.ok(ApiResponse.success("Login successful", buildLoginResponse(user, token)));
    }

    @PostMapping("/staff-login")
    public ResponseEntity<ApiResponse<LoginResponse>> staffLogin(@Valid @RequestBody IdentifierLoginRequest request) {
        String idOrEmail = request.getIdentifier().trim();

        User user = userRepository.findByEmail(idOrEmail.toLowerCase())
                .or(() -> userRepository.findByStudentIdOrStaffIdIgnoreCase(idOrEmail))
                .orElseThrow(() -> AppException.unauthorized("No staff account found for: " + idOrEmail));

        if (user.getRole() != Role.FACULTY) {
            throw AppException.unauthorized("Access Denied: This portal is for Faculty/Staff members only. Your registered role is: " + user.getRole());
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw AppException.unauthorized("Invalid password for faculty member " + user.getName());
        }

        String token = jwtUtil.generateToken(user);
        return ResponseEntity.ok(ApiResponse.success("Welcome back, " + user.getName() + "!", buildLoginResponse(user, token)));
    }

    @PostMapping("/admin-login")
    public ResponseEntity<ApiResponse<LoginResponse>> adminLogin(@Valid @RequestBody IdentifierLoginRequest request) {
        String idOrEmail = request.getIdentifier().trim();

        User user = userRepository.findByEmail(idOrEmail.toLowerCase())
                .or(() -> userRepository.findByStudentIdOrStaffIdIgnoreCase(idOrEmail))
                .orElseThrow(() -> AppException.unauthorized("No administrator account found for: " + idOrEmail));

        if (user.getRole() != Role.ADMIN) {
            throw AppException.unauthorized("Access Denied: Administrator privileges required.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw AppException.unauthorized("Invalid administrator credentials.");
        }

        String token = jwtUtil.generateToken(user);
        return ResponseEntity.ok(ApiResponse.success("Administrator session authorized: " + user.getName(), buildLoginResponse(user, token)));
    }

    @PostMapping("/student-register")
    public ResponseEntity<ApiResponse<LoginResponse>> registerStudent(@Valid @RequestBody StudentRegisterRequest request) {
        String cleanCollegeId = request.getCollegeId().trim();

        // 1. Check if student with this College ID already exists in the database
        if (userRepository.existsByStudentIdOrStaffIdIgnoreCase(cleanCollegeId)) {
            User existing = userRepository.findByStudentIdOrStaffIdIgnoreCase(cleanCollegeId).orElse(null);
            if (existing != null && existing.getDateOfBirth() != null && existing.getDateOfBirth().equals(request.getDateOfBirth())) {
                String token = jwtUtil.generateToken(existing);
                return ResponseEntity.ok(ApiResponse.success("Welcome back! Student account found in database. Logged in successfully.", buildLoginResponse(existing, token)));
            }
            throw AppException.conflict("A student with College ID '" + cleanCollegeId + "' is already registered in the database. Please use Student Login.");
        }

        // 2. Generate or sanitize email
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        if (email.isBlank()) {
            String sanitizedId = cleanCollegeId.toLowerCase().replaceAll("[^a-z0-9]", "");
            if (sanitizedId.isBlank()) {
                sanitizedId = "student" + (System.currentTimeMillis() % 10000);
            }
            email = sanitizedId + "@campusos.edu";
        }

        if (userRepository.existsByEmail(email)) {
            String sanitizedId = cleanCollegeId.toLowerCase().replaceAll("[^a-z0-9]", "");
            email = sanitizedId + "_" + (System.currentTimeMillis() % 1000) + "@campusos.edu";
        }

        // 3. Password handling (defaults to date of birth or student123)
        String rawPassword = request.getPassword();
        if (rawPassword == null || rawPassword.isBlank()) {
            rawPassword = request.getDateOfBirth() != null ? request.getDateOfBirth().toString() : "student123";
        }

        String department = request.getDepartment();
        if (department == null || department.isBlank()) {
            department = "Computer Science & Engineering";
        }

        // 4. Create and persist the new student entity into the database
        User newUser = new User(
                request.getName().trim(),
                email,
                passwordEncoder.encode(rawPassword),
                Role.STUDENT,
                department,
                cleanCollegeId,
                request.getDateOfBirth()
        );

        User savedUser = userRepository.save(newUser);

        // 5. Auto-enroll student into active courses in their department/system so their dashboard is populated
        try {
            List<Course> courses = courseRepository.findAll();
            for (Course course : courses) {
                enrollmentRepository.save(new Enrollment(course, savedUser));
            }
        } catch (Exception ignored) {
            // Non-blocking if enrollment fails
        }

        // 6. Generate authentication token
        String token = jwtUtil.generateToken(savedUser);
        LoginResponse response = buildLoginResponse(savedUser, token);

        return ResponseEntity.ok(ApiResponse.success("Student registered into database and authenticated successfully!", response));
    }

    @PostMapping("/staff-register")
    public ResponseEntity<ApiResponse<LoginResponse>> registerStaff(@Valid @RequestBody StaffRegisterRequest request) {
        String cleanStaffId = request.getStaffId().trim();
        String cleanEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(cleanEmail)) {
            throw AppException.conflict("A faculty member or user with email '" + cleanEmail + "' is already registered in the database.");
        }

        if (userRepository.existsByStudentIdOrStaffIdIgnoreCase(cleanStaffId)) {
            throw AppException.conflict("A staff member with Staff ID '" + cleanStaffId + "' is already registered in the database.");
        }

        User newStaff = new User(
                request.getName().trim(),
                cleanEmail,
                passwordEncoder.encode(request.getPassword()),
                Role.FACULTY,
                request.getDepartment().trim(),
                cleanStaffId
        );

        User savedUser = userRepository.save(newStaff);
        String token = jwtUtil.generateToken(savedUser);
        return ResponseEntity.ok(ApiResponse.success("Faculty member registered into database successfully!", buildLoginResponse(savedUser, token)));
    }

    @PostMapping("/admin-register")
    public ResponseEntity<ApiResponse<LoginResponse>> registerAdmin(@Valid @RequestBody AdminRegisterRequest request) {
        String cleanAdminId = request.getAdminId().trim();
        String cleanEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(cleanEmail)) {
            throw AppException.conflict("An administrator or user with email '" + cleanEmail + "' is already registered in the database.");
        }

        if (userRepository.existsByStudentIdOrStaffIdIgnoreCase(cleanAdminId)) {
            throw AppException.conflict("An administrator with ID '" + cleanAdminId + "' is already registered in the database.");
        }

        String dept = request.getDepartment() != null && !request.getDepartment().isBlank() 
                ? request.getDepartment().trim() 
                : "Campus Administration";

        User newAdmin = new User(
                request.getName().trim(),
                cleanEmail,
                passwordEncoder.encode(request.getPassword()),
                Role.ADMIN,
                dept,
                cleanAdminId
        );

        User savedUser = userRepository.save(newAdmin);
        String token = jwtUtil.generateToken(savedUser);
        return ResponseEntity.ok(ApiResponse.success("Administrator account registered into database successfully!", buildLoginResponse(savedUser, token)));
    }

    @PostMapping("/student-login")
    public ResponseEntity<ApiResponse<LoginResponse>> studentLogin(@Valid @RequestBody StudentLoginRequest request) {
        String cleanCollegeId = request.getCollegeId().trim();

        User user = userRepository.findByStudentIdOrStaffIdIgnoreCase(cleanCollegeId)
                .orElseThrow(() -> AppException.unauthorized("No student found with College ID: " + cleanCollegeId + ". Please register as a new student first."));

        if (user.getRole() != Role.STUDENT) {
            throw AppException.unauthorized("This portal is for students. Faculty and staff should use the Staff Login.");
        }

        // Verify Date of Birth
        if (user.getDateOfBirth() != null) {
            if (!user.getDateOfBirth().equals(request.getDateOfBirth())) {
                throw AppException.unauthorized("Date of birth does not match our college database records for ID: " + cleanCollegeId);
            }
        } else {
            // First time student sets/verifies DOB
            user.setDateOfBirth(request.getDateOfBirth());
            userRepository.save(user);
        }

        String token = jwtUtil.generateToken(user);
        LoginResponse response = buildLoginResponse(user, token);

        return ResponseEntity.ok(ApiResponse.success("Welcome back, " + user.getName() + "!", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<LoginResponse>> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw AppException.unauthorized("Not authenticated");
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> AppException.notFound("User not found"));

        return ResponseEntity.ok(ApiResponse.success(buildLoginResponse(user, null)));
    }

    @PostMapping("/demo-switch")
    public ResponseEntity<ApiResponse<LoginResponse>> demoSwitchRole(@RequestParam(required = false) Role role,
                                                                    @RequestParam(required = false) String email) {
        User user;
        if (email != null && !email.isBlank()) {
            user = userRepository.findByEmail(email.toLowerCase().trim())
                    .orElseThrow(() -> AppException.notFound("User not found: " + email));
        } else if (role != null) {
            List<User> users = userRepository.findByRole(role);
            if (users.isEmpty()) {
                throw AppException.notFound("No user found for role: " + role);
            }
            user = users.get(0);
        } else {
            throw AppException.badRequest("Must provide role or email");
        }

        String token = jwtUtil.generateToken(user);
        return ResponseEntity.ok(ApiResponse.success("Switched to " + user.getRole() + " (" + user.getName() + ")", buildLoginResponse(user, token)));
    }

    @GetMapping("/demo-users")
    public ResponseEntity<ApiResponse<List<User>>> getDemoUsers() {
        return ResponseEntity.ok(ApiResponse.success(userRepository.findAll()));
    }
}
