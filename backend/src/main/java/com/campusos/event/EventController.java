package com.campusos.event;

import com.campusos.auth.CustomUserDetails;
import com.campusos.common.ApiResponse;
import com.campusos.user.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getEvents(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(eventService.getAllEventsWithUserStatus(userDetails.getUser())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Event>> getEvent(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(eventService.getEventById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Event>> createEvent(
            @RequestBody Map<String, Object> req,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String title = (String) req.get("title");
        String description = (String) req.get("description");
        EventCategory category = EventCategory.valueOf(req.get("category").toString().toUpperCase());
        LocalDateTime eventDate = LocalDateTime.parse(req.get("eventDate").toString());
        Long roomId = req.get("roomId") != null && !req.get("roomId").toString().isBlank()
                ? Long.parseLong(req.get("roomId").toString())
                : null;
        String venueName = (String) req.get("venueName");
        int capacity = Integer.parseInt(req.get("capacity").toString());
        String tag = (String) req.get("tag");

        Event event = eventService.createEvent(title, description, category, eventDate, roomId, venueName, capacity, tag, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Event created successfully", event));
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<ApiResponse<EventRegistration>> register(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        EventRegistration reg = eventService.register(id, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Registered for event successfully", reg));
    }

    @DeleteMapping("/{id}/register")
    public ResponseEntity<ApiResponse<Void>> cancelRegistration(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        eventService.cancelRegistration(id, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Registration cancelled", null));
    }

    @GetMapping("/{id}/attendees")
    public ResponseEntity<ApiResponse<List<User>>> getAttendees(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(eventService.getAttendees(id, userDetails.getUser())));
    }
}
