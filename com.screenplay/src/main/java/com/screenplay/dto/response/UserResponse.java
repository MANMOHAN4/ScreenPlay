package com.screenplay.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

import com.screenplay.entity.User;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class UserResponse {
    private Long id;
    private String email;
    private String fullName;
    private String role;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;

    // Converts User entity → UserResponse DTO
    public static UserResponse fromEntity(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.isActive(),
                user.getCreatedAt(),
                user.getUpdatedAt());
    }

}
