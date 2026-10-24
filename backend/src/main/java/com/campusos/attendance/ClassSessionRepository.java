package com.campusos.attendance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClassSessionRepository extends JpaRepository<ClassSession, Long> {
    List<ClassSession> findByCourseIdOrderBySessionDateDesc(Long courseId);
    List<ClassSession> findByCourseIdAndSessionDate(Long courseId, LocalDate sessionDate);
    Optional<ClassSession> findByQrCodeToken(String qrCodeToken);
    long countByCourseId(Long courseId);
}
