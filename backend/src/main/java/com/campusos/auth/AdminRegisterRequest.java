package com.campusos.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class AdminRegisterRequest {

    @NotBlank(message = "Administrator full name is required")
    private String name;

    @NotBlank(message = "Admin ID or Badge ID is required")
    private String adminId;

    @NotBlank(message = "Email address is required")
    @Email(message = "Please enter a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    private String department;

    public AdminRegisterRequest() {}

    public AdminRegisterRequest(String name, String adminId, String email, String password, String department) {
        this.name = name;
        this.adminId = adminId;
        this.email = email;
        this.password = password;
        this.department = department;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAdminId() {
        return adminId;
    }

    public void setAdminId(String adminId) {
        this.adminId = adminId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }
}
