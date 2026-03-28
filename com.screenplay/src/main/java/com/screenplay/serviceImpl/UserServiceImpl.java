package com.screenplay.serviceImpl;

import com.screenplay.dto.request.UserRequest;
import com.screenplay.dto.response.MessageResponse;
import com.screenplay.dto.response.PageResponse;
import com.screenplay.dto.response.UserResponse;
import com.screenplay.entity.User;
import com.screenplay.enums.Role;
import com.screenplay.exception.EmailAlreadyExistsException;
import com.screenplay.exception.InvalidRoleException;
import com.screenplay.dao.UserRepository;
import com.screenplay.service.EmailService;
import com.screenplay.service.UserService;
import com.screenplay.util.PaginationUtils;
import com.screenplay.util.ServiceUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Arrays;
import java.util.UUID;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ServiceUtils serviceUtils;

    @Autowired
    private EmailService emailService;

    // CREATE USER
    @Override
    public MessageResponse createUser(UserRequest userRequest) {

        // Check duplicate email
        if (userRepository.findByEmail(userRequest.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        // Validate role
        validateRole(userRequest.getRole());

        // Create user
        User user = new User();
        user.setEmail(userRequest.getEmail());
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        user.setFullName(userRequest.getFullName());
        user.setRole(Role.valueOf(userRequest.getRole().toUpperCase()));
        user.setActive(true);

        // Verification token
        String verificationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpiry(
                Instant.now().plusSeconds(86400));

        userRepository.save(user);

        // Send email
        emailService.sendVerificationEmail(
                userRequest.getEmail(),
                verificationToken);

        return new MessageResponse("User created successfully!");
    }

    // UPDATE USER
    @Override
    public MessageResponse updateUser(Long id, UserRequest userRequest) {

        User user = serviceUtils.getUserByIdOrThrow(id);

        ensureNotLastActiveAdmin(user);

        validateRole(userRequest.getRole());

        user.setFullName(userRequest.getFullName());
        user.setRole(Role.valueOf(userRequest.getRole().toUpperCase()));

        userRepository.save(user);

        return new MessageResponse("User updated successfully!");
    }

    // GET USERS
    @Override
    public PageResponse<UserResponse> getUsers(int page, int size, String search) {

        Pageable pageable = PaginationUtils.createPageRequest(page, size, "id");

        Page<User> userPage;

        if (search != null && !search.trim().isEmpty()) {
            userPage = userRepository.searchUsers(
                    search.trim(),
                    pageable);
        } else {
            userPage = userRepository.findAll(pageable);
        }

        return PaginationUtils.toPageResponse(
                userPage,
                UserResponse::fromEntity);
    }

    // DELETE USER
    @Override
    public MessageResponse deleteUser(Long id, String currentUserEmail) {

        User user = serviceUtils.getUserByIdOrThrow(id);

        if (user.getEmail().equals(currentUserEmail)) {
            throw new RuntimeException("You cannot delete your own account.");
        }

        ensureNotLastAdmin(user, "delete");

        userRepository.deleteById(id);

        return new MessageResponse("User deleted successfully.");
    }

    // TOGGLE STATUS
    @Override
    public MessageResponse toggleUserStatus(Long id, String currentUserEmail) {

        User user = serviceUtils.getUserByIdOrThrow(id);

        if (user.getEmail().equals(currentUserEmail)) {
            throw new RuntimeException("You cannot deactivate your own account");
        }

        ensureNotLastActiveAdmin(user);

        user.setActive(!user.isActive());
        userRepository.save(user);

        return new MessageResponse("User status updated successfully!");
    }

    // CHANGE ROLE
    @Override
    public MessageResponse changeUserRole(Long id, UserRequest userRequest) {

        User user = serviceUtils.getUserByIdOrThrow(id);
        validateRole(userRequest.getRole());

        Role newRole = Role.valueOf(userRequest.getRole().toUpperCase());

        if (user.getRole() == Role.ADMIN && newRole == Role.USER) {
            ensureNotLastAdmin(user, "change role of");
        }

        user.setRole(newRole);
        userRepository.save(user);

        return new MessageResponse("User role updated successfully");
    }

    // HELPER METHODS

    private void validateRole(String role) {
        boolean valid = Arrays.stream(Role.values())
                .anyMatch(r -> r.name().equalsIgnoreCase(role));

        if (!valid) {
            throw new InvalidRoleException("Invalid role: " + role);
        }
    }

    private void ensureNotLastActiveAdmin(User user) {
        if (user.isActive() && user.getRole() == Role.ADMIN) {
            long activeAdminCount = userRepository.countByRoleAndActive(Role.ADMIN, true);

            if (activeAdminCount <= 1) {
                throw new RuntimeException(
                        "Cannot deactivate the last active admin user");
            }
        }
    }

    private void ensureNotLastAdmin(User user, String operation) {
        if (user.getRole() == Role.ADMIN) {
            long adminCount = userRepository.countByRole(Role.ADMIN);

            if (adminCount <= 1) {
                throw new RuntimeException(
                        "Cannot " + operation + " the last admin user");
            }
        }
    }
}