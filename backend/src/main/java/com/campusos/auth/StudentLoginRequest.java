package com.campusos.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class StudentLoginRequest {

    @NotBlank(message = "College ID is required")
    private String collegeId;

    @NotNull(message = "Date of birth is required")
    private LocalDate dateOfBirth;

    private String password;

    public StudentLoginRequest() {}

    public StudentLoginRequest(String collegeId, LocalDate dateOfBirth) {
        this.collegeId = collegeId;
        this.dateOfBirth = dateOfBirth;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
