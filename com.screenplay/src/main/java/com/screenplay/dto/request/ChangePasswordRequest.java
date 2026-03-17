package com.screenplay.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data

public class ChangePasswordRequest {

    @NotBlank(message = "Current Password is required")
    private String currentPassword;

    @NotBlank(message = "New Password is required")
    private String newPassword;
}