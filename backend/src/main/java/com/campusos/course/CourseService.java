package com.campusos.course;

import com.campusos.common.AppException;
import com.campusos.user.Role;
import com.campusos.user.User;
import com.campusos.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CourseService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    public CourseService(CourseRepository courseRepository,
                         EnrollmentRepository enrollmentRepository,
                         UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Course not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Course> getCoursesForUser(User user) {
        if (user.getRole() == Role.ADMIN) {
            return courseRepository.findAll();
        } else if (user.getRole() == Role.FACULTY) {
            return courseRepository.findByFacultyId(user.getId());
        } else {
            List<Enrollment> enrollments = enrollmentRepository.findByStudentId(user.getId());
            return enrollments.stream().map(Enrollment::getCourse).collect(Collectors.toList());
        }
    }

    @Transactional(readOnly = true)
    public List<User> getEnrolledStudents(Long courseId) {
        getCourseById(courseId); // ensure exists
        return enrollmentRepository.findByCourseId(courseId)
                .stream()
                .map(Enrollment::getStudent)
                .collect(Collectors.toList());
    }

    public Course createCourse(String code, String title, String department, String semester, int credits, Long facultyId, User creator) {
        if (creator.getRole() != Role.ADMIN) {
            throw AppException.forbidden("Only administrators can create courses");
        }
        if (courseRepository.findByCode(code).isPresent()) {
            throw AppException.conflict("Course with code '" + code + "' already exists");
        }
        User faculty = userRepository.findById(facultyId)
                .orElseThrow(() -> AppException.notFound("Faculty not found with id: " + facultyId));
        if (faculty.getRole() != Role.FACULTY) {
            throw AppException.badRequest("Selected user is not a faculty member");
        }

        Course course = new Course(code, title, department, semester, credits, faculty);
        return courseRepository.save(course);
    }

    public Enrollment enrollStudent(Long courseId, Long studentId, User currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            throw AppException.forbidden("Only administrators can enroll students");
        }
        Course course = getCourseById(courseId);
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> AppException.notFound("Student not found with id: " + studentId));
        if (student.getRole() != Role.STUDENT) {
            throw AppException.badRequest("User is not a student");
        }
        if (enrollmentRepository.existsByCourseIdAndStudentId(courseId, studentId)) {
            throw AppException.conflict("Student is already enrolled in this course");
        }

        Enrollment enrollment = new Enrollment(course, student);
        return enrollmentRepository.save(enrollment);
    }
}
