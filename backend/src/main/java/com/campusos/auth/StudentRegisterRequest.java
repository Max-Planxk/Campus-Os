package com.campusos.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class StudentRegisterRequest {

    @NotBlank(message = "Student name is required")
    private String name;

    @NotBlank(message = "College ID is required")
    private String collegeId;

    @NotNull(message = "Date of birth is required")
    private LocalDate dateOfBirth;

    private String email;
    private String department;
    private String password;

    public StudentRegisterRequest() {}

    public StudentRegisterRequest(String name, String collegeId, LocalDate dateOfBirth, String email, String department, String password) {
        this.name = name;
        this.collegeId = collegeId;
        this.dateOfBirth = dateOfBirth;
        this.email = email;
        this.department = department;
        this.password = password;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCollegeId() {
        return collegeId;
    }

    public void setCollegeId(String collegeId) {
        this.collegeId = collegeId;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
