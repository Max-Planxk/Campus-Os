package com.campusos.attendance;

import com.campusos.auth.CustomUserDetails;
import com.campusos.common.ApiResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    // Slide 4: POST /api/attendance/sessions/{id}/records (Example: marking attendance)
    @PostMapping("/sessions/{id}/records")
    public ResponseEntity<ApiResponse<List<AttendanceRecord>>> recordAttendance(
            @PathVariable Long id,
            @RequestBody List<Map<String, Object>> records,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<AttendanceRecord> saved = attendanceService.recordAttendance(id, records, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Attendance marked successfully", saved));
    }

    @PostMapping("/sessions")
    public ResponseEntity<ApiResponse<ClassSession>> createSession(
            @RequestBody Map<String, Object> req,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long courseId = Long.parseLong(req.get("courseId").toString());
        LocalDate sessionDate = LocalDate.parse(req.get("sessionDate").toString());
        String topic = (String) req.get("topic");

        ClassSession session = attendanceService.createSession(courseId, sessionDate, topic, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Class session created", session));
    }

    @GetMapping("/sessions/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSessionSheet(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getSessionSheet(id)));
    }

    @GetMapping("/courses/{courseId}/sessions")
    public ResponseEntity<ApiResponse<List<ClassSession>>> getCourseSessions(@PathVariable Long courseId) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getCourseSessions(courseId)));
    }

    @PostMapping("/sessions/{id}/qr-token")
    public ResponseEntity<ApiResponse<ClassSession>> generateQrToken(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ClassSession session = attendanceService.generateQrCodeToken(id, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("QR code session active for 15 minutes", session));
    }

    @PostMapping("/sessions/{id}/qr-checkin")
    public ResponseEntity<ApiResponse<AttendanceRecord>> qrCheckIn(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String token = body.get("token");
        AttendanceRecord record = attendanceService.studentQrCheckIn(id, token, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Checked in successfully as PRESENT", record));
    }

    @GetMapping("/student/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStudentSummary(
            @RequestParam(required = false) Long studentId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long targetStudentId = studentId != null ? studentId : userDetails.getId();
        Map<String, Object> summary = attendanceService.getStudentAttendanceSummary(targetStudentId, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}
