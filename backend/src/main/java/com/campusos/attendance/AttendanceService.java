package com.campusos.attendance;

import com.campusos.common.AppException;
import com.campusos.course.Course;
import com.campusos.course.CourseRepository;
import com.campusos.course.Enrollment;
import com.campusos.course.EnrollmentRepository;
import com.campusos.user.Role;
import com.campusos.user.User;
import com.campusos.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class AttendanceService {

    private final ClassSessionRepository classSessionRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    public AttendanceService(ClassSessionRepository classSessionRepository,
                             AttendanceRecordRepository attendanceRecordRepository,
                             CourseRepository courseRepository,
                             EnrollmentRepository enrollmentRepository,
                             UserRepository userRepository) {
        this.classSessionRepository = classSessionRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
    }

    public ClassSession createSession(Long courseId, LocalDate sessionDate, String topic, User user) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> AppException.notFound("Course not found"));

        // Slide 2: "Faculty mark attendance (own classes)... Admin authorized corrections"
        if (user.getRole() == Role.STUDENT) {
            throw AppException.forbidden("Students cannot create class attendance sessions");
        }
        if (user.getRole() == Role.FACULTY && !course.getFaculty().getId().equals(user.getId())) {
            throw AppException.forbidden("Faculty can only create sessions for their assigned courses");
        }

        ClassSession session = new ClassSession(course, sessionDate, topic);
        return classSessionRepository.save(session);
    }

    // Slide 4: "Checks permissions, enrollment, duplicates. Saves inside a transaction."
    public List<AttendanceRecord> recordAttendance(Long sessionId, List<Map<String, Object>> recordsInput, User user) {
        ClassSession session = classSessionRepository.findById(sessionId)
                .orElseThrow(() -> AppException.notFound("Class session not found"));

        Course course = session.getCourse();

        // Slide 2: "The backend enforces permissions. Hiding a button in React is not security."
        if (user.getRole() == Role.STUDENT) {
            throw AppException.forbidden("Students cannot mark attendance records");
        }
        if (user.getRole() == Role.FACULTY && !course.getFaculty().getId().equals(user.getId())) {
            throw AppException.forbidden("You can only mark attendance for your own course");
        }

        List<AttendanceRecord> savedRecords = new ArrayList<>();

        for (Map<String, Object> item : recordsInput) {
            Long studentId = Long.parseLong(item.get("studentId").toString());
            AttendanceStatus status = AttendanceStatus.valueOf(item.get("status").toString().toUpperCase());

            // Validate enrollment: Student must be enrolled in this course
            boolean isEnrolled = enrollmentRepository.existsByCourseIdAndStudentId(course.getId(), studentId);
            if (!isEnrolled) {
                throw AppException.badRequest("Student (ID " + studentId + ") is not enrolled in course " + course.getCode());
            }

            User student = userRepository.findById(studentId)
                    .orElseThrow(() -> AppException.notFound("Student not found"));

            // Check duplicate / existing record for this session
            Optional<AttendanceRecord> existingOpt = attendanceRecordRepository.findBySessionIdAndStudentId(sessionId, studentId);
            AttendanceRecord record;
            if (existingOpt.isPresent()) {
                record = existingOpt.get();
                record.setStatus(status);
                record.setMarkedAt(LocalDateTime.now());
            } else {
                record = new AttendanceRecord(session, student, status);
            }
            savedRecords.add(attendanceRecordRepository.save(record));
        }

        return savedRecords;
    }

    public ClassSession generateQrCodeToken(Long sessionId, User user) {
        ClassSession session = classSessionRepository.findById(sessionId)
                .orElseThrow(() -> AppException.notFound("Class session not found"));

        if (user.getRole() == Role.STUDENT) {
            throw AppException.forbidden("Students cannot generate attendance QR codes");
        }
        if (user.getRole() == Role.FACULTY && !session.getCourse().getFaculty().getId().equals(user.getId())) {
            throw AppException.forbidden("You can only generate QR codes for your own course sessions");
        }

        session.setQrCodeToken(UUID.randomUUID().toString());
        session.setQrCodeExpiresAt(LocalDateTime.now().plusMinutes(15));
        return classSessionRepository.save(session);
    }

    public AttendanceRecord studentQrCheckIn(Long sessionId, String token, User student) {
        if (student.getRole() != Role.STUDENT) {
            throw AppException.badRequest("Only students can check in via QR code");
        }

        ClassSession session = classSessionRepository.findById(sessionId)
                .orElseThrow(() -> AppException.notFound("Class session not found"));

        if (session.getQrCodeToken() == null || !session.getQrCodeToken().equals(token)) {
            throw AppException.badRequest("Invalid QR code token");
        }

        if (session.getQrCodeExpiresAt() == null || session.getQrCodeExpiresAt().isBefore(LocalDateTime.now())) {
            throw AppException.badRequest("This QR code session has expired");
        }

        // Validate student enrollment
        boolean isEnrolled = enrollmentRepository.existsByCourseIdAndStudentId(session.getCourse().getId(), student.getId());
        if (!isEnrolled) {
            throw AppException.forbidden("You are not enrolled in " + session.getCourse().getCode());
        }

        Optional<AttendanceRecord> existing = attendanceRecordRepository.findBySessionIdAndStudentId(sessionId, student.getId());
        AttendanceRecord record;
        if (existing.isPresent()) {
            record = existing.get();
            record.setStatus(AttendanceStatus.PRESENT);
            record.setMarkedAt(LocalDateTime.now());
        } else {
            record = new AttendanceRecord(session, student, AttendanceStatus.PRESENT);
        }

        return attendanceRecordRepository.save(record);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStudentAttendanceSummary(Long studentId, User currentUser) {
        if (currentUser.getRole() == Role.STUDENT && !currentUser.getId().equals(studentId)) {
            throw AppException.forbidden("Students can only view their own attendance");
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> AppException.notFound("Student not found"));

        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(studentId);
        List<Map<String, Object>> courseSummaries = new ArrayList<>();

        long totalAllSessions = 0;
        long totalAllPresent = 0;
        long totalAllLate = 0;
        long totalAllAbsent = 0;

        for (Enrollment enrollment : enrollments) {
            Course course = enrollment.getCourse();
            List<AttendanceRecord> records = attendanceRecordRepository.findByStudentIdAndCourseId(studentId, course.getId());
            long totalSessions = classSessionRepository.countByCourseId(course.getId());

            long present = records.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
            long late = records.stream().filter(r -> r.getStatus() == AttendanceStatus.LATE).count();
            long absent = records.stream().filter(r -> r.getStatus() == AttendanceStatus.ABSENT).count();

            // Late counts as 0.5 attendance or partial credit
            double attendedWeight = present + (late * 0.75);
            double percentage = totalSessions > 0 ? (attendedWeight / totalSessions) * 100.0 : 100.0;

            Map<String, Object> cMap = new HashMap<>();
            cMap.put("courseId", course.getId());
            cMap.put("courseCode", course.getCode());
            cMap.put("courseTitle", course.getTitle());
            cMap.put("facultyName", course.getFaculty().getName());
            cMap.put("totalSessions", totalSessions);
            cMap.put("presentCount", present);
            cMap.put("lateCount", late);
            cMap.put("absentCount", absent);
            cMap.put("percentage", Math.round(percentage * 10.0) / 10.0);
            courseSummaries.add(cMap);

            totalAllSessions += totalSessions;
            totalAllPresent += present;
            totalAllLate += late;
            totalAllAbsent += absent;
        }

        double overallPercentage = totalAllSessions > 0
                ? ((totalAllPresent + (totalAllLate * 0.75)) / totalAllSessions) * 100.0
                : 100.0;

        Map<String, Object> response = new HashMap<>();
        response.put("studentId", student.getId());
        response.put("studentName", student.getName());
        response.put("overallPercentage", Math.round(overallPercentage * 10.0) / 10.0);
        response.put("totalSessions", totalAllSessions);
        response.put("totalPresent", totalAllPresent);
        response.put("totalLate", totalAllLate);
        response.put("totalAbsent", totalAllAbsent);
        response.put("courses", courseSummaries);

        return response;
    }

    @Transactional(readOnly = true)
    public List<ClassSession> getCourseSessions(Long courseId) {
        return classSessionRepository.findByCourseIdOrderBySessionDateDesc(courseId);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSessionSheet(Long sessionId) {
        ClassSession session = classSessionRepository.findById(sessionId)
                .orElseThrow(() -> AppException.notFound("Session not found"));

        Course course = session.getCourse();
        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(course.getId());
        List<AttendanceRecord> records = attendanceRecordRepository.findBySessionId(sessionId);

        Map<Long, AttendanceRecord> recordMap = records.stream()
                .collect(Collectors.toMap(r -> r.getStudent().getId(), r -> r));

        List<Map<String, Object>> studentList = new ArrayList<>();
        for (Enrollment e : enrollments) {
            User student = e.getStudent();
            AttendanceRecord record = recordMap.get(student.getId());

            Map<String, Object> sMap = new HashMap<>();
            sMap.put("studentId", student.getId());
            sMap.put("studentName", student.getName());
            sMap.put("studentEmail", student.getEmail());
            sMap.put("studentCode", student.getStudentIdOrStaffId());
            sMap.put("status", record != null ? record.getStatus().name() : null);
            sMap.put("markedAt", record != null ? record.getMarkedAt() : null);
            studentList.add(sMap);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("session", session);
        result.put("students", studentList);
        return result;
    }
}
