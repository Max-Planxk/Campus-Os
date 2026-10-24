package com.campusos.course;

import com.campusos.auth.CustomUserDetails;
import com.campusos.common.ApiResponse;
import com.campusos.user.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Course>>> getCourses(@AuthenticationPrincipal CustomUserDetails userDetails) {
        List<Course> courses = courseService.getCoursesForUser(userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success(courses));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<Course>>> getAllCourses() {
        return ResponseEntity.ok(ApiResponse.success(courseService.getAllCourses()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Course>> getCourse(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(courseService.getCourseById(id)));
    }

    @GetMapping("/{id}/students")
    public ResponseEntity<ApiResponse<List<User>>> getCourseStudents(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(courseService.getEnrolledStudents(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Course>> createCourse(
            @RequestBody Map<String, Object> req,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String code = (String) req.get("code");
        String title = (String) req.get("title");
        String department = (String) req.get("department");
        String semester = (String) req.get("semester");
        int credits = req.get("credits") != null ? Integer.parseInt(req.get("credits").toString()) : 3;
        Long facultyId = Long.parseLong(req.get("facultyId").toString());

        Course created = courseService.createCourse(code, title, department, semester, credits, facultyId, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Course created successfully", created));
    }

    @PostMapping("/{id}/enroll")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Enrollment>> enrollStudent(
            @PathVariable Long id,
            @RequestBody Map<String, Object> req,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long studentId = Long.parseLong(req.get("studentId").toString());
        Enrollment enrollment = courseService.enrollStudent(id, studentId, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Student enrolled successfully", enrollment));
    }
}
