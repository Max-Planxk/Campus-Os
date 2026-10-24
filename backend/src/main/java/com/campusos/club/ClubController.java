package com.campusos.club;

import com.campusos.auth.CustomUserDetails;
import com.campusos.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clubs")
public class ClubController {

    private final ClubService clubService;

    public ClubController(ClubService clubService) {
        this.clubService = clubService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getClubs(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(clubService.getAllClubsWithStatus(userDetails.getUser())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Club>> getClub(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(clubService.getClubById(id)));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<ApiResponse<ClubMembership>> joinClub(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ClubMembership membership = clubService.requestMembership(id, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Membership request submitted to club lead", membership));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<ApiResponse<List<ClubMembership>>> getMembers(
            @PathVariable Long id,
            @RequestParam(required = false) MembershipStatus status) {
        return ResponseEntity.ok(ApiResponse.success(clubService.getClubMembers(id, status)));
    }

    @PutMapping("/{id}/memberships/{membershipId}")
    public ResponseEntity<ApiResponse<ClubMembership>> updateMembership(
            @PathVariable Long id,
            @PathVariable Long membershipId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        MembershipStatus status = MembershipStatus.valueOf(body.get("status").toUpperCase());
        ClubMembership updated = clubService.updateMembershipStatus(id, membershipId, status, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Membership updated to " + status, updated));
    }

    @GetMapping("/{id}/announcements")
    public ResponseEntity<ApiResponse<List<ClubAnnouncement>>> getAnnouncements(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(clubService.getClubAnnouncements(id)));
    }

    @GetMapping("/announcements/all")
    public ResponseEntity<ApiResponse<List<ClubAnnouncement>>> getAllAnnouncements() {
        return ResponseEntity.ok(ApiResponse.success(clubService.getAllRecentAnnouncements()));
    }

    @PostMapping("/{id}/announcements")
    public ResponseEntity<ApiResponse<ClubAnnouncement>> postAnnouncement(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String title = body.get("title");
        String content = body.get("content");
        ClubAnnouncement created = clubService.postAnnouncement(id, title, content, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Announcement posted", created));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Club>> createClub(
            @RequestBody Map<String, Object> req,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String name = (String) req.get("name");
        String description = (String) req.get("description");
        String category = (String) req.get("category");
        Long leadId = Long.parseLong(req.get("leadId").toString());
        String bannerColor = (String) req.get("bannerColor");

        Club club = clubService.createClub(name, description, category, leadId, bannerColor, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Club created successfully", club));
    }
}
