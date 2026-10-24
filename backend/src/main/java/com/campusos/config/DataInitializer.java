package com.campusos.config;

import com.campusos.attendance.*;
import com.campusos.club.*;
import com.campusos.course.*;
import com.campusos.event.*;
import com.campusos.room.*;
import com.campusos.timetable.*;
import com.campusos.user.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final RoomRepository roomRepository;
    private final TimetableSlotRepository timetableSlotRepository;
    private final ClassSessionRepository classSessionRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final ClubRepository clubRepository;
    private final ClubMembershipRepository clubMembershipRepository;
    private final ClubAnnouncementRepository clubAnnouncementRepository;
    private final RoomBookingRepository roomBookingRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           CourseRepository courseRepository,
                           EnrollmentRepository enrollmentRepository,
                           RoomRepository roomRepository,
                           TimetableSlotRepository timetableSlotRepository,
                           ClassSessionRepository classSessionRepository,
                           AttendanceRecordRepository attendanceRecordRepository,
                           EventRepository eventRepository,
                           EventRegistrationRepository eventRegistrationRepository,
                           ClubRepository clubRepository,
                           ClubMembershipRepository clubMembershipRepository,
                           ClubAnnouncementRepository clubAnnouncementRepository,
                           RoomBookingRepository roomBookingRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.roomRepository = roomRepository;
        this.timetableSlotRepository = timetableSlotRepository;
        this.classSessionRepository = classSessionRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.eventRepository = eventRepository;
        this.eventRegistrationRepository = eventRegistrationRepository;
        this.clubRepository = clubRepository;
        this.clubMembershipRepository = clubMembershipRepository;
        this.clubAnnouncementRepository = clubAnnouncementRepository;
        this.roomBookingRepository = roomBookingRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Ensure Manas (System Administrator) is always present in the database
        if (!userRepository.existsByEmail("manas123@gmail.com")) {
            userRepository.save(new User(
                    "Manas",
                    "manas123@gmail.com",
                    passwordEncoder.encode("@123456789"),
                    Role.ADMIN,
                    "Campus Administration",
                    "ADM-MANAS"
            ));
        }

        if (userRepository.count() > 1) {
            return;
        }

        // 1. Seed Users (Admin, Faculty, Students)
        User admin = userRepository.save(new User(
                "Dean Marcus Vance",
                "admin@campusos.edu",
                passwordEncoder.encode("admin123"),
                Role.ADMIN,
                "Academic Administration",
                "ADM-001"
        ));

        User facultyJenkins = userRepository.save(new User(
                "Dr. Sarah Jenkins",
                "faculty@campusos.edu",
                passwordEncoder.encode("faculty123"),
                Role.FACULTY,
                "Computer Science & Engineering",
                "FAC-108"
        ));

        User facultyChen = userRepository.save(new User(
                "Dr. Arthur Chen",
                "chen@campusos.edu",
                passwordEncoder.encode("faculty123"),
                Role.FACULTY,
                "Data Science & AI",
                "FAC-214"
        ));

        User studentAlex = userRepository.save(new User(
                "Alex Rivera",
                "student@campusos.edu",
                passwordEncoder.encode("student123"),
                Role.STUDENT,
                "Computer Science",
                "CS2023-042",
                LocalDate.of(2004, 3, 15)
        ));

        User studentPriya = userRepository.save(new User(
                "Priya Sharma",
                "priya@campusos.edu",
                passwordEncoder.encode("student123"),
                Role.STUDENT,
                "Computer Science",
                "CS2023-018",
                LocalDate.of(2004, 7, 22)
        ));

        User studentLiam = userRepository.save(new User(
                "Liam Patel",
                "liam@campusos.edu",
                passwordEncoder.encode("student123"),
                Role.STUDENT,
                "Computer Science",
                "CS2023-089",
                LocalDate.of(2003, 11, 5)
        ));

        User studentZara = userRepository.save(new User(
                "Zara Al-Mansoor",
                "zara@campusos.edu",
                passwordEncoder.encode("student123"),
                Role.STUDENT,
                "Information Technology",
                "IT2024-007",
                LocalDate.of(2005, 1, 30)
        ));

        // 1. Seed Faculty Members from Timetable
        User facultyKhurana = userRepository.save(new User(
                "Dr. Suraj Singh Khurana",
                "suraj.khurana@campusos.edu",
                passwordEncoder.encode("faculty123"),
                Role.FACULTY,
                "Computer Science & Engineering",
                "23120"
        ));

        User facultyAnandarao = userRepository.save(new User(
                "Dr. Sarvani Anandarao",
                "sarvani.anandarao@campusos.edu",
                passwordEncoder.encode("faculty123"),
                Role.FACULTY,
                "Computer Science & Engineering",
                "24110"
        ));

        User facultyPratik = userRepository.save(new User(
                "Dr. Shreerudra Pratik",
                "shreerudra.pratik@campusos.edu",
                passwordEncoder.encode("faculty123"),
                Role.FACULTY,
                "Computer Science & Engineering",
                "25393"
        ));

        User facultyRao = userRepository.save(new User(
                "Dr. Madasu Venkateswara Rao",
                "madasu.rao@campusos.edu",
                passwordEncoder.encode("faculty123"),
                Role.FACULTY,
                "Computer Science & Engineering",
                "26146"
        ));

        User facultyGoswami = userRepository.save(new User(
                "Ms. Shyamosree Goswami",
                "shyamosree.goswami@campusos.edu",
                passwordEncoder.encode("faculty123"),
                Role.FACULTY,
                "Computer Science & Engineering",
                "26368"
        ));

        User facultySahu = userRepository.save(new User(
                "Dr. Aditya Kumar Sahu",
                "aditya.sahu@campusos.edu",
                passwordEncoder.encode("faculty123"),
                Role.FACULTY,
                "Computer Science & Engineering",
                "25346"
        ));

        User facultyViswanath = userRepository.save(new User(
                "Dr. Dasari Kasi Viswanath",
                "dasari.viswanath@campusos.edu",
                passwordEncoder.encode("faculty123"),
                Role.FACULTY,
                "Computer Science & Engineering",
                "26196"
        ));

        User facultyKumar = userRepository.save(new User(
                "Dr. Vemula Naresh Kumar",
                "naresh.vemula@campusos.edu",
                passwordEncoder.encode("faculty123"),
                Role.FACULTY,
                "Electrical & Electronics Engineering",
                "26279"
        ));

        User facultyJapanese = userRepository.save(new User(
                "Mr. Japanese Language Trainer",
                "japanese.trainer@campusos.edu",
                passwordEncoder.encode("faculty123"),
                Role.FACULTY,
                "Foreign Languages & Linguistics",
                "V00023"
        ));

        User facultySkilling = userRepository.save(new User(
                "Mr. Skilling Course Five Six",
                "skilling.trainer@campusos.edu",
                passwordEncoder.encode("faculty123"),
                Role.FACULTY,
                "Skill Development Centre",
                "tmp056"
        ));

        // 2. Seed Timetable Rooms
        Room roomC705 = roomRepository.save(new Room("C 705", "Academic Block C", 75, RoomType.LECTURE_HALL, "Dual 4K Laser Projector, Smart Podium, Air Conditioned"));
        Room roomC808 = roomRepository.save(new Room("C 808", "Academic Block C", 70, RoomType.LECTURE_HALL, "Laser Projector, Surround Sound, Tiered Seating"));
        Room roomC1011 = roomRepository.save(new Room("C 1011", "Academic Block C", 65, RoomType.LAB, "Digital Electronics & Embedded Logic Workstations"));
        Room roomC305 = roomRepository.save(new Room("C 305", "Academic Block C", 70, RoomType.LAB, "Advanced Java & Computing Rigs, Dual Monitors"));
        Room roomS510 = roomRepository.save(new Room("S 510", "Science & Engineering Block", 60, RoomType.LECTURE_HALL, "Circuit Labs & Interactive Smart Screen"));
        Room roomX208 = roomRepository.save(new Room("X 208", "Extension Block X", 60, RoomType.LAB, "Hardware Prototyping & Logic Analyzer Benches"));
        Room audi = roomRepository.save(new Room("Auditorium-Main", "Rabindranath Tagore Hall", 500, RoomType.AUDITORIUM, "Concert Acoustics, Pro Stage Lighting, Twin 200\" LED Walls"));
        Room lh101 = roomRepository.save(new Room("LH-101", "Turing Science Block", 120, RoomType.LECTURE_HALL, "Dual 4K Laser Projectors, Wireless Mic"));
        Room lab301 = roomRepository.save(new Room("Lab-301", "Ada Lovelace Computing Wing", 45, RoomType.LAB, "45 High-Spec Workstations, Gigabit LAN"));
        Room lab302 = roomRepository.save(new Room("Lab-302", "Ada Lovelace Computing Wing", 40, RoomType.LAB, "40 NVIDIA RTX AI/ML Desktops, Linux LTS, AC"));
        Room sem4a = roomRepository.save(new Room("Seminar-4A", "Executive Academic Centre", 30, RoomType.SEMINAR_ROOM, "Polycom Conference Suite, Executive Roundtable"));

        // 3. Seed Courses matching attached timetable
        Course cse203 = courseRepository.save(new Course("CSE 203", "DISCRETE MATHEMATICS", "Computer Science", "Fall 2026", 3, facultyKhurana));
        Course cse204 = courseRepository.save(new Course("CSE 204", "DESIGN AND ANALYSIS OF ALGORITHMS", "Computer Science", "Fall 2026", 4, facultyAnandarao));
        Course cse207 = courseRepository.save(new Course("CSE 207", "DIGITAL ELECTRONICS", "Computer Science", "Fall 2026", 4, facultyRao));
        Course cse213 = courseRepository.save(new Course("CSE 213", "ADVANCED JAVA PROGRAMMING", "Computer Science", "Fall 2026", 4, facultySahu));
        Course fic120 = courseRepository.save(new Course("FIC 120", "FOUNDATIONS OF ELECTRICAL AND ELECTRONICS ENGINEERING", "Electrical & Electronics", "Fall 2026", 3, facultyKumar));
        Course flc105 = courseRepository.save(new Course("FLC 105", "INTRODUCTION TO BASIC JAPANESE - DJ", "Foreign Languages", "Fall 2026", 3, facultyJapanese));
        Course sec203 = courseRepository.save(new Course("SEC 203", "APTITUDE FOR ENGINEERS - III", "Skill Development", "Fall 2026", 2, facultySkilling));

        // 4. Seed Enrollments
        for (Course c : List.of(cse203, cse204, cse207, cse213, fic120, flc105, sec203)) {
            enrollmentRepository.save(new Enrollment(c, studentAlex));
            enrollmentRepository.save(new Enrollment(c, studentPriya));
            enrollmentRepository.save(new Enrollment(c, studentLiam));
            enrollmentRepository.save(new Enrollment(c, studentZara));
        }

        // 5. Seed Exact Timetable Slots from Attached Image
        // Standard Period Times:
        // 1: 09:00 - 09:50
        // 2: 10:00 - 10:50
        // 3: 11:00 - 11:50
        // 4: 12:00 - 12:50
        // 5: 13:00 - 13:50 (01:00 To 01:50)
        // 6: 14:00 - 14:50 (02:00 To 02:50)
        // 7: 15:00 - 15:50 (03:00 To 03:50)
        // 8: 16:00 - 17:30 (04:00 To 05:30)

        // Monday
        timetableSlotRepository.save(new TimetableSlot(cse204, facultyAnandarao, roomC705, DayOfWeek.MONDAY, LocalTime.of(10, 0), LocalTime.of(10, 50)));
        timetableSlotRepository.save(new TimetableSlot(sec203, facultySkilling, roomC705, DayOfWeek.MONDAY, LocalTime.of(13, 0), LocalTime.of(13, 50)));
        timetableSlotRepository.save(new TimetableSlot(sec203, facultySkilling, roomC705, DayOfWeek.MONDAY, LocalTime.of(14, 0), LocalTime.of(14, 50)));
        timetableSlotRepository.save(new TimetableSlot(flc105, facultyJapanese, roomC705, DayOfWeek.MONDAY, LocalTime.of(16, 0), LocalTime.of(17, 30)));

        // Tuesday
        timetableSlotRepository.save(new TimetableSlot(cse203, facultyKhurana, roomC705, DayOfWeek.TUESDAY, LocalTime.of(9, 0), LocalTime.of(9, 50)));
        timetableSlotRepository.save(new TimetableSlot(sec203, facultySkilling, roomC705, DayOfWeek.TUESDAY, LocalTime.of(10, 0), LocalTime.of(10, 50)));
        timetableSlotRepository.save(new TimetableSlot(cse213, facultySahu, roomC705, DayOfWeek.TUESDAY, LocalTime.of(13, 0), LocalTime.of(13, 50)));
        timetableSlotRepository.save(new TimetableSlot(cse213, facultySahu, roomC705, DayOfWeek.TUESDAY, LocalTime.of(14, 0), LocalTime.of(14, 50)));
        timetableSlotRepository.save(new TimetableSlot(flc105, facultyJapanese, roomC705, DayOfWeek.TUESDAY, LocalTime.of(16, 0), LocalTime.of(17, 30)));

        // Wednesday
        timetableSlotRepository.save(new TimetableSlot(fic120, facultyKumar, roomS510, DayOfWeek.WEDNESDAY, LocalTime.of(10, 0), LocalTime.of(10, 50)));
        timetableSlotRepository.save(new TimetableSlot(fic120, facultyKumar, roomS510, DayOfWeek.WEDNESDAY, LocalTime.of(11, 0), LocalTime.of(11, 50)));
        timetableSlotRepository.save(new TimetableSlot(fic120, facultyKumar, roomC705, DayOfWeek.WEDNESDAY, LocalTime.of(13, 0), LocalTime.of(13, 50)));
        timetableSlotRepository.save(new TimetableSlot(fic120, facultyKumar, roomC705, DayOfWeek.WEDNESDAY, LocalTime.of(14, 0), LocalTime.of(14, 50)));

        // Thursday
        timetableSlotRepository.save(new TimetableSlot(cse204, facultyAnandarao, roomC705, DayOfWeek.THURSDAY, LocalTime.of(9, 0), LocalTime.of(9, 50)));
        timetableSlotRepository.save(new TimetableSlot(cse204, facultyAnandarao, roomC705, DayOfWeek.THURSDAY, LocalTime.of(10, 0), LocalTime.of(10, 50)));
        timetableSlotRepository.save(new TimetableSlot(cse207, facultyRao, roomC705, DayOfWeek.THURSDAY, LocalTime.of(11, 0), LocalTime.of(11, 50)));
        timetableSlotRepository.save(new TimetableSlot(cse207, facultyRao, roomC1011, DayOfWeek.THURSDAY, LocalTime.of(13, 0), LocalTime.of(13, 50)));
        timetableSlotRepository.save(new TimetableSlot(cse207, facultyRao, roomC1011, DayOfWeek.THURSDAY, LocalTime.of(14, 0), LocalTime.of(14, 50)));
        timetableSlotRepository.save(new TimetableSlot(cse213, facultySahu, roomC305, DayOfWeek.THURSDAY, LocalTime.of(15, 0), LocalTime.of(15, 50)));
        timetableSlotRepository.save(new TimetableSlot(cse213, facultySahu, roomC305, DayOfWeek.THURSDAY, LocalTime.of(16, 0), LocalTime.of(17, 30)));

        // Friday
        timetableSlotRepository.save(new TimetableSlot(cse213, facultySahu, roomC705, DayOfWeek.FRIDAY, LocalTime.of(9, 0), LocalTime.of(9, 50)));
        timetableSlotRepository.save(new TimetableSlot(cse204, facultyAnandarao, roomC808, DayOfWeek.FRIDAY, LocalTime.of(10, 0), LocalTime.of(10, 50)));
        timetableSlotRepository.save(new TimetableSlot(cse204, facultyAnandarao, roomC808, DayOfWeek.FRIDAY, LocalTime.of(11, 0), LocalTime.of(11, 50)));
        timetableSlotRepository.save(new TimetableSlot(cse207, facultyGoswami, roomX208, DayOfWeek.FRIDAY, LocalTime.of(13, 0), LocalTime.of(13, 50)));
        timetableSlotRepository.save(new TimetableSlot(cse207, facultyGoswami, roomX208, DayOfWeek.FRIDAY, LocalTime.of(14, 0), LocalTime.of(14, 50)));
        timetableSlotRepository.save(new TimetableSlot(cse203, facultyKhurana, roomC705, DayOfWeek.FRIDAY, LocalTime.of(15, 0), LocalTime.of(15, 50)));
        timetableSlotRepository.save(new TimetableSlot(cse203, facultyKhurana, roomC705, DayOfWeek.FRIDAY, LocalTime.of(16, 0), LocalTime.of(17, 30)));

        // 6. Seed Class Sessions and Attendance Records
        LocalDate today = LocalDate.now();

        // Past session 1 - Algorithms (CSE 204)
        ClassSession sess1 = classSessionRepository.save(new ClassSession(cse204, today.minusDays(7), "Divide and Conquer: Master Theorem & Strassen's Matrix"));
        attendanceRecordRepository.save(new AttendanceRecord(sess1, studentAlex, AttendanceStatus.PRESENT));
        attendanceRecordRepository.save(new AttendanceRecord(sess1, studentPriya, AttendanceStatus.PRESENT));
        attendanceRecordRepository.save(new AttendanceRecord(sess1, studentLiam, AttendanceStatus.LATE));
        attendanceRecordRepository.save(new AttendanceRecord(sess1, studentZara, AttendanceStatus.PRESENT));

        // Past session 2 - Advanced Java (CSE 213)
        ClassSession sess2 = classSessionRepository.save(new ClassSession(cse213, today.minusDays(5), "Spring Boot Architecture, Virtual Threads & Concurrency"));
        attendanceRecordRepository.save(new AttendanceRecord(sess2, studentAlex, AttendanceStatus.PRESENT));
        attendanceRecordRepository.save(new AttendanceRecord(sess2, studentPriya, AttendanceStatus.ABSENT));
        attendanceRecordRepository.save(new AttendanceRecord(sess2, studentLiam, AttendanceStatus.PRESENT));
        attendanceRecordRepository.save(new AttendanceRecord(sess2, studentZara, AttendanceStatus.PRESENT));

        // Past session 3 - Discrete Math (CSE 203)
        ClassSession sess3 = classSessionRepository.save(new ClassSession(cse203, today.minusDays(3), "Graph Theory: Eulerian & Hamiltonian Paths"));
        attendanceRecordRepository.save(new AttendanceRecord(sess3, studentAlex, AttendanceStatus.PRESENT));
        attendanceRecordRepository.save(new AttendanceRecord(sess3, studentPriya, AttendanceStatus.PRESENT));

        // Today's active session with a live QR Code token
        ClassSession sessToday = new ClassSession(cse213, today, "Enterprise Microservices with Spring Cloud & JPA");
        sessToday.setQrCodeToken("QR-CAMPUSOS-JAVA-213");
        sessToday.setQrCodeExpiresAt(LocalDateTime.now().plusHours(4));
        classSessionRepository.save(sessToday);
        attendanceRecordRepository.save(new AttendanceRecord(sessToday, studentAlex, AttendanceStatus.PRESENT));

        // 7. Seed Events
        Event hackathon = eventRepository.save(new Event(
                "HackCampus 2026: 36h Collegiate Hackathon",
                "The flagship annual university hackathon. Build innovative AI, Web3, and Systems solutions. Over $15,000 in prizes, mentorship from Google & industry leaders, and complimentary catering.",
                EventCategory.HACKATHON,
                LocalDateTime.now().plusDays(4).withHour(9).withMinute(0),
                audi,
                "Rabindranath Tagore Auditorium",
                facultyJenkins,
                150,
                "Flagship"
        ));

        Event agentWorkshop = eventRepository.save(new Event(
                "Hands-On: Building Autonomous AI Coding Agents",
                "Deep dive into tool calling, reactive wakeups, memory loops, and agentic workflows using Java and Spring AI.",
                EventCategory.WORKSHOP,
                LocalDateTime.now().plusDays(2).withHour(15).withMinute(0),
                lab302,
                "Ada Lovelace Computing Wing - Lab 302",
                facultyChen,
                35,
                "AI/ML"
        ));

        Event keynote = eventRepository.save(new Event(
                "Distinguished Lecture: Distributed Ledger Consensus",
                "Keynote address by Turing Fellow Dr. Marcus Vance on Byzantine Fault Tolerance at planetary scale.",
                EventCategory.TECH_TALK,
                LocalDateTime.now().plusDays(8).withHour(17).withMinute(30),
                lh101,
                "Turing Science Block - LH 101",
                admin,
                120,
                "Keynote"
        ));

        eventRegistrationRepository.save(new EventRegistration(hackathon, studentAlex));
        eventRegistrationRepository.save(new EventRegistration(hackathon, studentPriya));
        eventRegistrationRepository.save(new EventRegistration(agentWorkshop, studentAlex));
        eventRegistrationRepository.save(new EventRegistration(keynote, studentLiam));

        // 8. Seed Clubs
        Club acm = clubRepository.save(new Club(
                "ACM Student Chapter",
                "Official university chapter of the Association for Computing Machinery. We conduct competitive programming leagues, research roundtables, and technical workshops.",
                "Technical",
                studentAlex,
                "#4F46E5"
        ));

        Club gdsc = clubRepository.save(new Club(
                "Google Developer Student Club (GDSC)",
                "A vibrant peer-to-peer developer community focused on Android, Flutter, Cloud, and Machine Learning.",
                "Development",
                studentPriya,
                "#059669"
        ));

        Club robotics = clubRepository.save(new Club(
                "Autonomous Robotics Guild",
                "Designing rovers, drones, and embedded firmware for international robotics competitions and robotic combat.",
                "Robotics & Hardware",
                studentLiam,
                "#D97706"
        ));

        Club debating = clubRepository.save(new Club(
                "Campus Debating & Literary Society",
                "Fostering parliamentary debate, critical discourse, and creative writing across disciplines.",
                "Literary & Cultural",
                studentZara,
                "#DB2777"
        ));

        // Club Memberships
        clubMembershipRepository.save(new ClubMembership(acm, studentAlex, MembershipStatus.APPROVED, MembershipRole.LEAD));
        clubMembershipRepository.save(new ClubMembership(acm, studentPriya, MembershipStatus.APPROVED, MembershipRole.MEMBER));
        clubMembershipRepository.save(new ClubMembership(acm, studentLiam, MembershipStatus.PENDING, MembershipRole.MEMBER));

        clubMembershipRepository.save(new ClubMembership(gdsc, studentPriya, MembershipStatus.APPROVED, MembershipRole.LEAD));
        clubMembershipRepository.save(new ClubMembership(gdsc, studentAlex, MembershipStatus.APPROVED, MembershipRole.MEMBER));

        clubMembershipRepository.save(new ClubMembership(robotics, studentLiam, MembershipStatus.APPROVED, MembershipRole.LEAD));
        clubMembershipRepository.save(new ClubMembership(robotics, studentAlex, MembershipStatus.PENDING, MembershipRole.MEMBER));

        // Club Announcements
        clubAnnouncementRepository.save(new ClubAnnouncement(
                acm,
                "ACM ICPC Regional Qualifiers Registration Open",
                "Teams of 3 are invited to register for the preliminary online round before November 10th. Practice contest this Saturday in Lab 301.",
                studentAlex
        ));

        clubAnnouncementRepository.save(new ClubAnnouncement(
                gdsc,
                "Google Cloud Study Jam Kickoff",
                "All members who received complimentary Qwiklabs credits must complete Skill Badges 1 & 2 by next week.",
                studentPriya
        ));

        // 9. Seed Room Bookings
        RoomBooking approvedBooking = new RoomBooking(
                lh101,
                facultyJenkins,
                today.plusDays(1),
                LocalTime.of(16, 30),
                LocalTime.of(18, 0),
                "ACM Competitive Programming Bootcamp"
        );
        approvedBooking.setStatus(BookingStatus.APPROVED);
        roomBookingRepository.save(approvedBooking);

        RoomBooking pendingBooking = new RoomBooking(
                lab301,
                studentAlex,
                today.plusDays(3),
                LocalTime.of(17, 0),
                LocalTime.of(19, 0),
                "Hackathon Team Testing & Setup"
        );
        pendingBooking.setStatus(BookingStatus.PENDING);
        roomBookingRepository.save(pendingBooking);

        RoomBooking pendingBooking2 = new RoomBooking(
                sem4a,
                studentLiam,
                today.plusDays(2),
                LocalTime.of(15, 0),
                LocalTime.of(16, 30),
                "Robotics Guild Executive Planning"
        );
        pendingBooking2.setStatus(BookingStatus.PENDING);
        roomBookingRepository.save(pendingBooking2);
    }
}
