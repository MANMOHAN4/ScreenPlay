package com.screenplay.controller;

import com.screenplay.dto.request.UserRequest;
import com.screenplay.dto.response.MessageResponse;
import com.screenplay.dto.response.PageResponse;
import com.screenplay.dto.response.UserResponse;
import com.screenplay.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

        @Autowired
        private UserService userService;

        // CREATE USER (Admin)
        @PostMapping
        public ResponseEntity<MessageResponse> createUser(
                        @RequestBody UserRequest userRequest) {
                return ResponseEntity.ok(
                                userService.createUser(userRequest));
        }

        // UPDATE USER (Admin)
        @PutMapping("/{id}")
        public ResponseEntity<MessageResponse> updateUser(
                        @PathVariable Long id,
                        @RequestBody UserRequest userRequest) {
                return ResponseEntity.ok(
                                userService.updateUser(id, userRequest));
        }

        // GET ALL USERS (Admin with Pagination + Search)
        @GetMapping
        public ResponseEntity<PageResponse<UserResponse>> getAllUsers(
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size,
                        @RequestParam(required = false) String search) {
                return ResponseEntity.ok(
                                userService.getUsers(page, size, search));
        }

        // DELETE USER (Admin)
        @DeleteMapping("/{id}")
        public ResponseEntity<MessageResponse> deleteUser(
                        @PathVariable Long id,
                        Authentication authentication) {
                String currentUserEmail = authentication.getName();

                return ResponseEntity.ok(
                                userService.deleteUser(id, currentUserEmail));
        }

        // TOGGLE USER STATUS (Enable / Disable)
        @PutMapping("/{id}/toggle-status")
        public ResponseEntity<MessageResponse> toggleUserStatus(
                        @PathVariable Long id,
                        Authentication authentication) {
                String currentUserEmail = authentication.getName();

                return ResponseEntity.ok(
                                userService.toggleUserStatus(id, currentUserEmail));
        }

        // CHANGE USER ROLE (Admin <-> User)
        @PutMapping("/{id}/change-role")
        public ResponseEntity<MessageResponse> changeUserRole(
                        @PathVariable Long id,
                        @RequestBody UserRequest userRequest) {
                return ResponseEntity.ok(
                                userService.changeUserRole(id, userRequest));
        }
}