package com.campusos.club;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClubAnnouncementRepository extends JpaRepository<ClubAnnouncement, Long> {
    List<ClubAnnouncement> findByClubIdOrderByCreatedAtDesc(Long clubId);
    List<ClubAnnouncement> findAllByOrderByCreatedAtDesc();
}
