package com.campusos.room;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface RoomBookingRepository extends JpaRepository<RoomBooking, Long> {

    List<RoomBooking> findByRequesterIdOrderByBookingDateDescStartTimeAsc(Long requesterId);

    List<RoomBooking> findByBookingDateOrderByStartTimeAsc(LocalDate bookingDate);

    List<RoomBooking> findByStatusOrderByBookingDateAscStartTimeAsc(BookingStatus status);

    @Query("SELECT b FROM RoomBooking b WHERE b.room.id = :roomId AND b.bookingDate = :bookingDate " +
           "AND b.status = :status AND b.startTime < :endTime AND b.endTime > :startTime " +
           "AND (:excludeId IS NULL OR b.id != :excludeId)")
    List<RoomBooking> findOverlappingBookings(
            @Param("roomId") Long roomId,
            @Param("bookingDate") LocalDate bookingDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("status") BookingStatus status,
            @Param("excludeId") Long excludeId
    );

    long countByStatus(BookingStatus status);
}
