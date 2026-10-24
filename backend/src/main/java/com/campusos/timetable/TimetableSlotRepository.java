package com.campusos.timetable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface TimetableSlotRepository extends JpaRepository<TimetableSlot, Long> {

    List<TimetableSlot> findByFacultyId(Long facultyId);

    List<TimetableSlot> findByCourseId(Long courseId);

    List<TimetableSlot> findByCourseIdIn(List<Long> courseIds);

    List<TimetableSlot> findByDayOfWeekOrderByStartTimeAsc(DayOfWeek dayOfWeek);

    @Query("SELECT s FROM TimetableSlot s WHERE s.room.id = :roomId AND s.dayOfWeek = :dayOfWeek " +
           "AND s.startTime < :endTime AND s.endTime > :startTime " +
           "AND (:excludeId IS NULL OR s.id != :excludeId)")
    List<TimetableSlot> findOverlappingRoomSlots(
            @Param("roomId") Long roomId,
            @Param("dayOfWeek") DayOfWeek dayOfWeek,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeId") Long excludeId
    );

    @Query("SELECT s FROM TimetableSlot s WHERE s.faculty.id = :facultyId AND s.dayOfWeek = :dayOfWeek " +
           "AND s.startTime < :endTime AND s.endTime > :startTime " +
           "AND (:excludeId IS NULL OR s.id != :excludeId)")
    List<TimetableSlot> findOverlappingFacultySlots(
            @Param("facultyId") Long facultyId,
            @Param("dayOfWeek") DayOfWeek dayOfWeek,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeId") Long excludeId
    );
}
