package com.campusos.attendance;

import com.campusos.course.Course;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "class_sessions")
public class ClassSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    private LocalDate sessionDate;

    @Column(nullable = false)
    private String topic;

    private String qrCodeToken;

    private LocalDateTime qrCodeExpiresAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public ClassSession() {}

    public ClassSession(Course course, LocalDate sessionDate, String topic) {
        this.course = course;
        this.sessionDate = sessionDate;
        this.topic = topic;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public LocalDate getSessionDate() {
        return sessionDate;
    }

    public void setSessionDate(LocalDate sessionDate) {
        this.sessionDate = sessionDate;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getQrCodeToken() {
        return qrCodeToken;
    }

    public void setQrCodeToken(String qrCodeToken) {
        this.qrCodeToken = qrCodeToken;
    }

    public LocalDateTime getQrCodeExpiresAt() {
        return qrCodeExpiresAt;
    }

    public void setQrCodeExpiresAt(LocalDateTime qrCodeExpiresAt) {
        this.qrCodeExpiresAt = qrCodeExpiresAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
