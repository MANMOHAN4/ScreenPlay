package com.screenplay.service;

import com.screenplay.dto.request.UserRequest;
import com.screenplay.dto.response.MessageResponse;
import com.screenplay.dto.response.PageResponse;
import com.screenplay.dto.response.UserResponse;

public interface UserService {

    // Create user (Admin)
    MessageResponse createUser(UserRequest userRequest);

    // Update user (Admin)
    MessageResponse updateUser(Long id, UserRequest userRequest);

    // Get all users with pagination + search
    PageResponse<UserResponse> getUsers(int page, int size, String search);

    // Delete user (Admin)
    MessageResponse deleteUser(Long id, String currentUserEmail);

    // Toggle user active/inactive status
    MessageResponse toggleUserStatus(Long id, String currentUserEmail);

    // Change user role (Admin)
    MessageResponse changeUserRole(Long id, UserRequest userRequest);
}