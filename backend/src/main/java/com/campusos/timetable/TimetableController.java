package com.campusos.timetable;

import com.campusos.auth.CustomUserDetails;
import com.campusos.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/timetable")
public class TimetableController {

    private final TimetableService timetableService;

    public TimetableController(TimetableService timetableService) {
        this.timetableService = timetableService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TimetableSlot>>> getTimetable(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(timetableService.getTimetableForUser(userDetails.getUser())));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<TimetableSlot>>> getAllSlots() {
        return ResponseEntity.ok(ApiResponse.success(timetableService.getAllSlots()));
    }

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<List<TimetableSlot>>> getTodayClasses(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(timetableService.getTodayClasses(userDetails.getUser())));
    }

    @PostMapping("/check-conflicts")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkConflicts(@RequestBody Map<String, Object> req) {
        Long roomId = Long.parseLong(req.get("roomId").toString());
        Long facultyId = Long.parseLong(req.get("facultyId").toString());
        DayOfWeek dayOfWeek = DayOfWeek.valueOf(req.get("dayOfWeek").toString());
        LocalTime startTime = LocalTime.parse(req.get("startTime").toString());
        LocalTime endTime = LocalTime.parse(req.get("endTime").toString());
        Long excludeSlotId = req.get("excludeSlotId") != null ? Long.parseLong(req.get("excludeSlotId").toString()) : null;

        Map<String, Object> report = timetableService.checkConflicts(roomId, facultyId, dayOfWeek, startTime, endTime, excludeSlotId);
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @PostMapping("/slots")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TimetableSlot>> createSlot(
            @RequestBody Map<String, Object> req,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long courseId = Long.parseLong(req.get("courseId").toString());
        Long facultyId = Long.parseLong(req.get("facultyId").toString());
        Long roomId = Long.parseLong(req.get("roomId").toString());
        DayOfWeek dayOfWeek = DayOfWeek.valueOf(req.get("dayOfWeek").toString());
        LocalTime startTime = LocalTime.parse(req.get("startTime").toString());
        LocalTime endTime = LocalTime.parse(req.get("endTime").toString());

        TimetableSlot created = timetableService.createSlot(courseId, facultyId, roomId, dayOfWeek, startTime, endTime, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Timetable slot created successfully", created));
    }

    @DeleteMapping("/slots/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSlot(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        timetableService.deleteSlot(id, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Timetable slot deleted successfully", null));
    }
}
