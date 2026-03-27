package com.screenplay.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.screenplay.dto.request.*;
import com.screenplay.dto.response.*;
import com.screenplay.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {

    @Autowired
    private AuthService authService;

    // SIGNUP
    @PostMapping("/signup")
    public ResponseEntity<MessageResponse> signup(@Valid @RequestBody UserRequest userRequest) {
        return ResponseEntity.ok(authService.signup(userRequest));
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse response = authService.login(
                loginRequest.getEmail(),
                loginRequest.getPassword());
        return ResponseEntity.ok(response);
    }

    // VALIDATE EMAIL
    @GetMapping("/validate-email")
    public ResponseEntity<EmailValidationResponse> validateEmail(@RequestParam String email) {
        return ResponseEntity.ok(authService.validateEmail(email));
    }

    // VERIFY EMAIL
    @GetMapping("/verify-email")
    public ResponseEntity<MessageResponse> verifyEmail(@RequestParam String token) {
        return ResponseEntity.ok(authService.verifyEmail(token));
    }

    // RESEND VERIFICATION
    @PostMapping("/resend-verification")
    public ResponseEntity<MessageResponse> resendVerification(
            @Valid @RequestBody EmailRequest emaiRequest) {
        return ResponseEntity.ok(authService.resendVerification(emaiRequest.getEmail()));
    }

    // FORGOT PASSWORD
    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(
            @Valid @RequestBody EmailRequest emailRequest) {
        return ResponseEntity.ok(authService.forgotPassword(emailRequest.getEmail()));
    }

    // RESET PASSWORD
    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(
            @Valid @RequestBody ResetPasswordRequest resetPasswordRequest) {
        return ResponseEntity.ok(
                authService.resetPassword(
                        resetPasswordRequest.getToken(),
                        resetPasswordRequest.getNewPassword()));
    }

    // CHANGE PASSWORD
    @PostMapping("/change-password")
    public ResponseEntity<MessageResponse> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest changePasswordRequest) {
        String email = authentication.getName();

        return ResponseEntity.ok(
                authService.changePassword(
                        email,
                        changePasswordRequest.getCurrentPassword(),
                        changePasswordRequest.getNewPassword()));
    }

    // CURRENT USER
    @GetMapping("/current-user")
    public ResponseEntity<LoginResponse> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(authService.getCurrentUser(email));
    }
}