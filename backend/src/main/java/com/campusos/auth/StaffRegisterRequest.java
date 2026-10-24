package com.campusos.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class StaffRegisterRequest {

    @NotBlank(message = "Staff member full name is required")
    private String name;

    @NotBlank(message = "Staff ID or Employee Code is required")
    private String staffId;

    @NotBlank(message = "Email address is required")
    @Email(message = "Please enter a valid email address")
    private String email;

    @NotBlank(message = "Department is required")
    private String department;

    @NotBlank(message = "Password is required")
    private String password;

    public StaffRegisterRequest() {}

    public StaffRegisterRequest(String name, String staffId, String email, String department, String password) {
        this.name = name;
        this.staffId = staffId;
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

    public String getStaffId() {
        return staffId;
    }

    public void setStaffId(String staffId) {
        this.staffId = staffId;
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
