package com.campusos.timetable;

import com.campusos.common.AppException;
import com.campusos.course.Course;
import com.campusos.course.CourseRepository;
import com.campusos.course.Enrollment;
import com.campusos.course.EnrollmentRepository;
import com.campusos.room.Room;
import com.campusos.room.RoomRepository;
import com.campusos.user.Role;
import com.campusos.user.User;
import com.campusos.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class TimetableService {

    private final TimetableSlotRepository timetableSlotRepository;
    private final CourseRepository courseRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    public TimetableService(TimetableSlotRepository timetableSlotRepository,
                            CourseRepository courseRepository,
                            RoomRepository roomRepository,
                            UserRepository userRepository,
                            EnrollmentRepository enrollmentRepository) {
        this.timetableSlotRepository = timetableSlotRepository;
        this.courseRepository = courseRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @Transactional(readOnly = true)
    public List<TimetableSlot> getTimetableForUser(User user) {
        if (user.getRole() == Role.ADMIN) {
            return timetableSlotRepository.findAll();
        } else if (user.getRole() == Role.FACULTY) {
            return timetableSlotRepository.findByFacultyId(user.getId());
        } else {
            List<Enrollment> enrollments = enrollmentRepository.findByStudentId(user.getId());
            List<Long> courseIds = enrollments.stream().map(e -> e.getCourse().getId()).collect(Collectors.toList());
            if (courseIds.isEmpty()) {
                return Collections.emptyList();
            }
            return timetableSlotRepository.findByCourseIdIn(courseIds);
        }
    }

    @Transactional(readOnly = true)
    public List<TimetableSlot> getAllSlots() {
        return timetableSlotRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> checkConflicts(Long roomId, Long facultyId, DayOfWeek dayOfWeek,
                                              LocalTime startTime, LocalTime endTime, Long excludeSlotId) {
        Map<String, Object> result = new HashMap<>();
        boolean hasConflict = false;
        List<String> messages = new ArrayList<>();

        if (endTime.isBefore(startTime) || endTime.equals(startTime)) {
            result.put("valid", false);
            result.put("conflict", true);
            result.put("messages", List.of("End time must be after start time"));
            return result;
        }

        // Room conflict check
        List<TimetableSlot> roomConflicts = timetableSlotRepository.findOverlappingRoomSlots(
                roomId, dayOfWeek, startTime, endTime, excludeSlotId
        );
        if (!roomConflicts.isEmpty()) {
            hasConflict = true;
            TimetableSlot s = roomConflicts.get(0);
            messages.add("Room conflict: " + s.getRoom().getRoomNumber() + " is already occupied by " +
                    s.getCourse().getCode() + " (" + s.getStartTime() + " - " + s.getEndTime() + ")");
        }

        // Faculty conflict check
        List<TimetableSlot> facultyConflicts = timetableSlotRepository.findOverlappingFacultySlots(
                facultyId, dayOfWeek, startTime, endTime, excludeSlotId
        );
        if (!facultyConflicts.isEmpty()) {
            hasConflict = true;
            TimetableSlot s = facultyConflicts.get(0);
            messages.add("Faculty conflict: " + s.getFaculty().getName() + " is already teaching " +
                    s.getCourse().getCode() + " in " + s.getRoom().getRoomNumber() + " (" + s.getStartTime() + " - " + s.getEndTime() + ")");
        }

        result.put("valid", true);
        result.put("conflict", hasConflict);
        result.put("messages", messages);
        return result;
    }

    public TimetableSlot createSlot(Long courseId, Long facultyId, Long roomId,
                                  DayOfWeek dayOfWeek, LocalTime startTime, LocalTime endTime, User user) {
        if (user.getRole() != Role.ADMIN) {
            throw AppException.forbidden("Only administrators can configure timetable slots");
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> AppException.notFound("Course not found"));
        User faculty = userRepository.findById(facultyId)
                .orElseThrow(() -> AppException.notFound("Faculty not found"));
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> AppException.notFound("Room not found"));

        Map<String, Object> conflictCheck = checkConflicts(roomId, facultyId, dayOfWeek, startTime, endTime, null);
        if (Boolean.TRUE.equals(conflictCheck.get("conflict"))) {
            @SuppressWarnings("unchecked")
            List<String> messages = (List<String>) conflictCheck.get("messages");
            throw AppException.conflict("Timetable conflict detected: " + String.join("; ", messages));
        }

        TimetableSlot slot = new TimetableSlot(course, faculty, room, dayOfWeek, startTime, endTime);
        return timetableSlotRepository.save(slot);
    }

    public void deleteSlot(Long slotId, User user) {
        if (user.getRole() != Role.ADMIN) {
            throw AppException.forbidden("Only administrators can delete timetable slots");
        }
        if (!timetableSlotRepository.existsById(slotId)) {
            throw AppException.notFound("Timetable slot not found");
        }
        timetableSlotRepository.deleteById(slotId);
    }

    @Transactional(readOnly = true)
    public List<TimetableSlot> getTodayClasses(User user) {
        DayOfWeek today = LocalDate.now().getDayOfWeek();
        List<TimetableSlot> userSlots = getTimetableForUser(user);
        return userSlots.stream()
                .filter(s -> s.getDayOfWeek() == today)
                .sorted(Comparator.comparing(TimetableSlot::getStartTime))
                .collect(Collectors.toList());
    }
}
