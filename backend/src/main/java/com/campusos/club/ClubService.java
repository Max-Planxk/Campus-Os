package com.campusos.club;

import com.campusos.common.AppException;
import com.campusos.user.Role;
import com.campusos.user.User;
import com.campusos.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class ClubService {

    private final ClubRepository clubRepository;
    private final ClubMembershipRepository clubMembershipRepository;
    private final ClubAnnouncementRepository clubAnnouncementRepository;
    private final UserRepository userRepository;

    public ClubService(ClubRepository clubRepository,
                       ClubMembershipRepository clubMembershipRepository,
                       ClubAnnouncementRepository clubAnnouncementRepository,
                       UserRepository userRepository) {
        this.clubRepository = clubRepository;
        this.clubMembershipRepository = clubMembershipRepository;
        this.clubAnnouncementRepository = clubAnnouncementRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllClubsWithStatus(User currentUser) {
        List<Club> clubs = clubRepository.findAll();
        List<ClubMembership> userMemberships = clubMembershipRepository.findByUserId(currentUser.getId());
        Map<Long, ClubMembership> membershipMap = userMemberships.stream()
                .collect(Collectors.toMap(m -> m.getClub().getId(), m -> m));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Club club : clubs) {
            long approvedCount = clubMembershipRepository.countByClubIdAndStatus(club.getId(), MembershipStatus.APPROVED);
            long pendingCount = clubMembershipRepository.countByClubIdAndStatus(club.getId(), MembershipStatus.PENDING);
            ClubMembership userMembership = membershipMap.get(club.getId());

            boolean isLeadOrAdmin = currentUser.getRole() == Role.ADMIN || club.getLead().getId().equals(currentUser.getId());

            Map<String, Object> map = new HashMap<>();
            map.put("id", club.getId());
            map.put("name", club.getName());
            map.put("description", club.getDescription());
            map.put("category", club.getCategory());
            map.put("lead", club.getLead());
            map.put("bannerColor", club.getBannerColor());
            map.put("memberCount", approvedCount);
            map.put("pendingCount", pendingCount);
            map.put("isLeadOrAdmin", isLeadOrAdmin);
            map.put("membershipStatus", userMembership != null ? userMembership.getStatus().name() : "NONE");
            map.put("membershipRole", userMembership != null ? userMembership.getRole().name() : null);
            map.put("membershipId", userMembership != null ? userMembership.getId() : null);

            result.add(map);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public Club getClubById(Long id) {
        return clubRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Club not found with id: " + id));
    }

    // Slide 1 & Slide 5: "Students request membership"
    public ClubMembership requestMembership(Long clubId, User user) {
        Club club = getClubById(clubId);

        Optional<ClubMembership> existing = clubMembershipRepository.findByClubIdAndUserId(clubId, user.getId());
        if (existing.isPresent()) {
            ClubMembership m = existing.get();
            if (m.getStatus() == MembershipStatus.APPROVED) {
                throw AppException.conflict("You are already an approved member of " + club.getName());
            } else if (m.getStatus() == MembershipStatus.PENDING) {
                throw AppException.conflict("Your membership request is already pending approval");
            } else {
                // If previously rejected, re-apply as PENDING
                m.setStatus(MembershipStatus.PENDING);
                m.setJoinedAt(LocalDateTime.now());
                return clubMembershipRepository.save(m);
            }
        }

        ClubMembership membership = new ClubMembership(club, user, MembershipStatus.PENDING, MembershipRole.MEMBER);
        return clubMembershipRepository.save(membership);
    }

    // Slide 1 & Slide 5: "Leads approve or reject"
    public ClubMembership updateMembershipStatus(Long clubId, Long membershipId, MembershipStatus newStatus, User actor) {
        Club club = getClubById(clubId);
        boolean isLeadOrAdmin = actor.getRole() == Role.ADMIN || club.getLead().getId().equals(actor.getId());
        if (!isLeadOrAdmin) {
            throw AppException.forbidden("Only club leads or administrators can approve or reject memberships");
        }

        ClubMembership membership = clubMembershipRepository.findById(membershipId)
                .orElseThrow(() -> AppException.notFound("Membership request not found"));

        if (!membership.getClub().getId().equals(clubId)) {
            throw AppException.badRequest("Membership does not belong to this club");
        }

        membership.setStatus(newStatus);
        return clubMembershipRepository.save(membership);
    }

    @Transactional(readOnly = true)
    public List<ClubMembership> getClubMembers(Long clubId, MembershipStatus status) {
        getClubById(clubId); // ensure exists
        if (status != null) {
            return clubMembershipRepository.findByClubIdAndStatus(clubId, status);
        }
        return clubMembershipRepository.findByClubId(clubId);
    }

    @Transactional(readOnly = true)
    public List<ClubAnnouncement> getClubAnnouncements(Long clubId) {
        getClubById(clubId);
        return clubAnnouncementRepository.findByClubIdOrderByCreatedAtDesc(clubId);
    }

    @Transactional(readOnly = true)
    public List<ClubAnnouncement> getAllRecentAnnouncements() {
        return clubAnnouncementRepository.findAllByOrderByCreatedAtDesc();
    }

    public ClubAnnouncement postAnnouncement(Long clubId, String title, String content, User author) {
        Club club = getClubById(clubId);
        boolean isLeadOrAdmin = author.getRole() == Role.ADMIN || club.getLead().getId().equals(author.getId());
        if (!isLeadOrAdmin) {
            throw AppException.forbidden("Only club leads or administrators can post announcements");
        }

        ClubAnnouncement announcement = new ClubAnnouncement(club, title, content, author);
        return clubAnnouncementRepository.save(announcement);
    }

    public Club createClub(String name, String description, String category, Long leadId, String bannerColor, User admin) {
        if (admin.getRole() != Role.ADMIN) {
            throw AppException.forbidden("Only administrators can create campus clubs");
        }
        if (clubRepository.findByName(name).isPresent()) {
            throw AppException.conflict("A club named '" + name + "' already exists");
        }

        User lead = userRepository.findById(leadId)
                .orElseThrow(() -> AppException.notFound("Lead user not found"));

        Club club = new Club(name, description, category, lead, bannerColor);
        Club saved = clubRepository.save(club);

        // Make lead an approved member with LEAD role
        ClubMembership leadMembership = new ClubMembership(saved, lead, MembershipStatus.APPROVED, MembershipRole.LEAD);
        clubMembershipRepository.save(leadMembership);

        return saved;
    }
}
