package com.campusos.auth;

import com.campusos.user.Role;

public class LoginResponse {
    private String token;
    private Long id;
    private String name;
    private String email;
    private Role role;
    private String department;
    private String studentIdOrStaffId;
    private java.time.LocalDate dateOfBirth;

    public LoginResponse() {}

    public LoginResponse(String token, Long id, String name, String email, Role role, String department, String studentIdOrStaffId) {
        this(token, id, name, email, role, department, studentIdOrStaffId, null);
    }

    public LoginResponse(String token, Long id, String name, String email, Role role, String department, String studentIdOrStaffId, java.time.LocalDate dateOfBirth) {
        this.token = token;
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.department = department;
        this.studentIdOrStaffId = studentIdOrStaffId;
        this.dateOfBirth = dateOfBirth;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getStudentIdOrStaffId() {
        return studentIdOrStaffId;
    }

    public void setStudentIdOrStaffId(String studentIdOrStaffId) {
        this.studentIdOrStaffId = studentIdOrStaffId;
    }

    public java.time.LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(java.time.LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }
}
