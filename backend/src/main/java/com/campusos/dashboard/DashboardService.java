package com.campusos.dashboard;

import com.campusos.attendance.AttendanceRecordRepository;
import com.campusos.attendance.AttendanceService;
import com.campusos.attendance.AttendanceStatus;
import com.campusos.club.ClubMembershipRepository;
import com.campusos.club.ClubRepository;
import com.campusos.club.MembershipStatus;
import com.campusos.course.Course;
import com.campusos.course.CourseRepository;
import com.campusos.course.EnrollmentRepository;
import com.campusos.event.Event;
import com.campusos.event.EventRepository;
import com.campusos.room.BookingStatus;
import com.campusos.room.RoomBooking;
import com.campusos.room.RoomBookingRepository;
import com.campusos.room.RoomRepository;
import com.campusos.timetable.TimetableService;
import com.campusos.timetable.TimetableSlot;
import com.campusos.user.Role;
import com.campusos.user.User;
import com.campusos.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final RoomRepository roomRepository;
    private final RoomBookingRepository roomBookingRepository;
    private final EventRepository eventRepository;
    private final ClubRepository clubRepository;
    private final ClubMembershipRepository clubMembershipRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceService attendanceService;
    private final TimetableService timetableService;

    public DashboardService(UserRepository userRepository,
                            CourseRepository courseRepository,
                            RoomRepository roomRepository,
                            RoomBookingRepository roomBookingRepository,
                            EventRepository eventRepository,
                            ClubRepository clubRepository,
                            ClubMembershipRepository clubMembershipRepository,
                            AttendanceRecordRepository attendanceRecordRepository,
                            AttendanceService attendanceService,
                            TimetableService timetableService) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.roomRepository = roomRepository;
        this.roomBookingRepository = roomBookingRepository;
        this.eventRepository = eventRepository;
        this.clubRepository = clubRepository;
        this.clubMembershipRepository = clubMembershipRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.attendanceService = attendanceService;
        this.timetableService = timetableService;
    }

    public Map<String, Object> getDashboardData(User user) {
        Map<String, Object> data = new HashMap<>();
        data.put("role", user.getRole().name());
        data.put("userName", user.getName());
        data.put("email", user.getEmail());
        data.put("department", user.getDepartment());
        data.put("currentDate", LocalDate.now().toString());

        // Common: Today's schedule
        List<TimetableSlot> todayClasses = timetableService.getTodayClasses(user);
        data.put("todayClasses", todayClasses);

        // Common: Upcoming events
        List<Event> upcomingEvents = eventRepository.findByEventDateAfterOrderByEventDateAsc(LocalDateTime.now());
        if (upcomingEvents.size() > 4) {
            upcomingEvents = upcomingEvents.subList(0, 4);
        }
        data.put("upcomingEvents", upcomingEvents);

        if (user.getRole() == Role.STUDENT) {
            // Student specific metrics
            Map<String, Object> attendanceSummary = attendanceService.getStudentAttendanceSummary(user.getId(), user);
            data.put("attendanceSummary", attendanceSummary);

            long clubsJoined = clubMembershipRepository.countByUserIdAndStatus(user.getId(), MembershipStatus.APPROVED);
            long clubsPending = clubMembershipRepository.countByUserIdAndStatus(user.getId(), MembershipStatus.PENDING);
            data.put("clubsJoined", clubsJoined);
            data.put("clubsPending", clubsPending);

            List<RoomBooking> myBookings = roomBookingRepository.findByRequesterIdOrderByBookingDateDescStartTimeAsc(user.getId());
            data.put("recentBookings", myBookings.stream().limit(3).toList());

        } else if (user.getRole() == Role.FACULTY) {
            // Faculty specific metrics
            List<Course> courses = courseRepository.findByFacultyId(user.getId());
            data.put("coursesTaught", courses);
            data.put("courseCount", courses.size());

            List<RoomBooking> myBookings = roomBookingRepository.findByRequesterIdOrderByBookingDateDescStartTimeAsc(user.getId());
            data.put("recentBookings", myBookings.stream().limit(3).toList());

        } else if (user.getRole() == Role.ADMIN) {
            // Campus-wide statistics
            long totalStudents = userRepository.findByRole(Role.STUDENT).size();
            long totalFaculty = userRepository.findByRole(Role.FACULTY).size();
            long totalRooms = roomRepository.count();
            long totalCourses = courseRepository.count();
            long totalClubs = clubRepository.count();
            long pendingBookings = roomBookingRepository.countByStatus(BookingStatus.PENDING);
            long totalEvents = eventRepository.count();

            // Campus-wide attendance calculation
            long totalPresent = attendanceRecordRepository.countOverallByStatus(AttendanceStatus.PRESENT);
            long totalLate = attendanceRecordRepository.countOverallByStatus(AttendanceStatus.LATE);
            long totalAbsent = attendanceRecordRepository.countOverallByStatus(AttendanceStatus.ABSENT);
            long totalAttendanceRecords = totalPresent + totalLate + totalAbsent;
            double campusAttendanceRate = totalAttendanceRecords > 0
                    ? ((totalPresent + (totalLate * 0.75)) / totalAttendanceRecords) * 100.0
                    : 92.5;

            Map<String, Object> campusStats = new HashMap<>();
            campusStats.put("totalStudents", totalStudents);
            campusStats.put("totalFaculty", totalFaculty);
            campusStats.put("totalRooms", totalRooms);
            campusStats.put("totalCourses", totalCourses);
            campusStats.put("totalClubs", totalClubs);
            campusStats.put("totalEvents", totalEvents);
            campusStats.put("pendingRoomBookings", pendingBookings);
            campusStats.put("campusAttendanceRate", Math.round(campusAttendanceRate * 10.0) / 10.0);
            campusStats.put("totalAttendanceRecords", totalAttendanceRecords);

            data.put("campusStats", campusStats);

            // Admin pending actions
            List<RoomBooking> pendingBookingList = roomBookingRepository.findByStatusOrderByBookingDateAscStartTimeAsc(BookingStatus.PENDING);
            data.put("pendingBookingRequests", pendingBookingList);
        }

        return data;
    }
}
