package com.campusos.room;

import com.campusos.common.AppException;
import com.campusos.user.Role;
import com.campusos.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@Transactional
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomBookingRepository roomBookingRepository;

    public RoomService(RoomRepository roomRepository, RoomBookingRepository roomBookingRepository) {
        this.roomRepository = roomRepository;
        this.roomBookingRepository = roomBookingRepository;
    }

    @Transactional(readOnly = true)
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Room getRoomById(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Room not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<RoomBooking> getAllBookings() {
        return roomBookingRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<RoomBooking> getBookingsByDate(LocalDate date) {
        return roomBookingRepository.findByBookingDateOrderByStartTimeAsc(date);
    }

    @Transactional(readOnly = true)
    public List<RoomBooking> getUserBookings(Long userId) {
        return roomBookingRepository.findByRequesterIdOrderByBookingDateDescStartTimeAsc(userId);
    }

    @Transactional(readOnly = true)
    public List<RoomBooking> getPendingBookings() {
        return roomBookingRepository.findByStatusOrderByBookingDateAscStartTimeAsc(BookingStatus.PENDING);
    }

    public RoomBooking requestBooking(Long roomId, LocalDate date, LocalTime startTime, LocalTime endTime, String purpose, User requester) {
        if (endTime.isBefore(startTime) || endTime.equals(startTime)) {
            throw AppException.badRequest("End time must be after start time");
        }
        if (date.isBefore(LocalDate.now())) {
            throw AppException.badRequest("Cannot book room for a past date");
        }

        Room room = getRoomById(roomId);

        // Slide 1 & Slide 6: "Overlap detection... Never double-booked"
        List<RoomBooking> overlappingApproved = roomBookingRepository.findOverlappingBookings(
                roomId, date, startTime, endTime, BookingStatus.APPROVED, null
        );
        if (!overlappingApproved.isEmpty()) {
            RoomBooking conflict = overlappingApproved.get(0);
            throw AppException.conflict("Room " + room.getRoomNumber() + " is already approved for " +
                    conflict.getPurpose() + " from " + conflict.getStartTime() + " to " + conflict.getEndTime());
        }

        RoomBooking booking = new RoomBooking(room, requester, date, startTime, endTime, purpose);
        
        // If an admin requests a room, it can be auto-approved
        if (requester.getRole() == Role.ADMIN) {
            booking.setStatus(BookingStatus.APPROVED);
        } else {
            booking.setStatus(BookingStatus.PENDING);
        }

        return roomBookingRepository.save(booking);
    }

    public RoomBooking approveBooking(Long bookingId, User admin) {
        if (admin.getRole() != Role.ADMIN) {
            throw AppException.forbidden("Only administrators can approve room bookings");
        }

        RoomBooking booking = roomBookingRepository.findById(bookingId)
                .orElseThrow(() -> AppException.notFound("Booking not found with id: " + bookingId));

        if (booking.getStatus() == BookingStatus.APPROVED) {
            return booking;
        }

        // Check if another booking was approved in the meantime that overlaps
        List<RoomBooking> overlaps = roomBookingRepository.findOverlappingBookings(
                booking.getRoom().getId(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                BookingStatus.APPROVED,
                booking.getId()
        );

        if (!overlaps.isEmpty()) {
            throw AppException.conflict("Cannot approve: Overlaps with an already approved booking for this room");
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setRejectionReason(null);
        return roomBookingRepository.save(booking);
    }

    public RoomBooking rejectBooking(Long bookingId, String reason, User admin) {
        if (admin.getRole() != Role.ADMIN) {
            throw AppException.forbidden("Only administrators can reject room bookings");
        }

        RoomBooking booking = roomBookingRepository.findById(bookingId)
                .orElseThrow(() -> AppException.notFound("Booking not found with id: " + bookingId));

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason != null ? reason : "Declined by administrator");
        return roomBookingRepository.save(booking);
    }

    public RoomBooking cancelBooking(Long bookingId, User user) {
        RoomBooking booking = roomBookingRepository.findById(bookingId)
                .orElseThrow(() -> AppException.notFound("Booking not found with id: " + bookingId));

        if (!booking.getRequester().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw AppException.forbidden("You cannot cancel another user's booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return roomBookingRepository.save(booking);
    }
}
