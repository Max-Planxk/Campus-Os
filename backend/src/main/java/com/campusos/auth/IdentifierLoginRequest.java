package com.campusos.auth;

import jakarta.validation.constraints.NotBlank;

public class IdentifierLoginRequest {

    @NotBlank(message = "Identifier (Email or Staff/Admin ID) is required")
    private String identifier;

    @NotBlank(message = "Password is required")
    private String password;

    public IdentifierLoginRequest() {}

    public IdentifierLoginRequest(String identifier, String password) {
        this.identifier = identifier;
        this.password = password;
    }

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
