package com.campusos.room;

import com.campusos.auth.CustomUserDetails;
import com.campusos.common.ApiResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Room>>> getAllRooms() {
        return ResponseEntity.ok(ApiResponse.success(roomService.getAllRooms()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Room>> getRoom(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(roomService.getRoomById(id)));
    }

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<RoomBooking>>> getBookings(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date != null) {
            return ResponseEntity.ok(ApiResponse.success(roomService.getBookingsByDate(date)));
        }
        return ResponseEntity.ok(ApiResponse.success(roomService.getAllBookings()));
    }

    @GetMapping("/bookings/my")
    public ResponseEntity<ApiResponse<List<RoomBooking>>> getMyBookings(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(roomService.getUserBookings(userDetails.getId())));
    }

    @GetMapping("/bookings/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<RoomBooking>>> getPendingBookings() {
        return ResponseEntity.ok(ApiResponse.success(roomService.getPendingBookings()));
    }

    @PostMapping("/bookings")
    public ResponseEntity<ApiResponse<RoomBooking>> createBooking(
            @RequestBody Map<String, Object> req,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long roomId = Long.parseLong(req.get("roomId").toString());
        LocalDate date = LocalDate.parse(req.get("bookingDate").toString());
        LocalTime startTime = LocalTime.parse(req.get("startTime").toString());
        LocalTime endTime = LocalTime.parse(req.get("endTime").toString());
        String purpose = (String) req.get("purpose");

        RoomBooking booking = roomService.requestBooking(roomId, date, startTime, endTime, purpose, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Booking requested successfully", booking));
    }

    @PutMapping("/bookings/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoomBooking>> approveBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        RoomBooking approved = roomService.approveBooking(id, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Booking approved", approved));
    }

    @PutMapping("/bookings/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoomBooking>> rejectBooking(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String reason = body != null ? body.get("reason") : "Declined by admin";
        RoomBooking rejected = roomService.rejectBooking(id, reason, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Booking rejected", rejected));
    }

    @DeleteMapping("/bookings/{id}")
    public ResponseEntity<ApiResponse<RoomBooking>> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        RoomBooking cancelled = roomService.cancelBooking(id, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled", cancelled));
    }
}
