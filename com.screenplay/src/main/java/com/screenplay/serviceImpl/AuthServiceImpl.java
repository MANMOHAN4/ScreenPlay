package com.screenplay.serviceImpl;

import java.time.Instant;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.screenplay.dao.UserRepository;
import com.screenplay.dto.request.UserRequest;
import com.screenplay.dto.response.*;
import com.screenplay.entity.User;
import com.screenplay.enums.Role;
import com.screenplay.exception.*;
import com.screenplay.security.JwtUtil;
import com.screenplay.service.AuthService;
import com.screenplay.service.EmailService;
import com.screenplay.util.ServiceUtils;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private ServiceUtils serviceUtils;

    // SIGNUP
    @Override
    public MessageResponse signup(UserRequest userRequest) {

        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        User user = new User();
        user.setEmail(userRequest.getEmail());
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        user.setFullName(userRequest.getFullName());
        user.setRole(Role.USER);
        user.setActive(true);
        user.setEmailVerified(false);

        String verificationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpiry(
                Instant.now().plusSeconds(86400));

        userRepository.save(user);

        emailService.sendVerificationEmail(userRequest.getEmail(), verificationToken);

        return new MessageResponse(
                "Registration successful! Please check your email to verify your account.");
    }

    // LOGIN
    @Override
    public LoginResponse login(String email, String password) {

        User user = userRepository.findByEmail(email)
                .filter(u -> passwordEncoder.matches(password, u.getPassword()))
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!user.isActive()) {
            throw new AccountDeactivatedException(
                    "Your account has been deactivated. Please contact support for assistance.");
        }

        if (!user.isEmailVerified()) {
            throw new EmailNotVerifiedException(
                    "Please verify your email address before logging in. Check your inbox for the verification token");
        }

        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole().name());

        return new LoginResponse(
                token,
                user.getEmail(),
                user.getFullName(),
                user.getRole().name());
    }

    // VALIDATE EMAIL
    @Override
    public EmailValidationResponse validateEmail(String email) {
        boolean exists = userRepository.existsByEmail(email);
        return new EmailValidationResponse(exists, !exists);
    }

    // VERIFY EMAIL
    @Override
    public MessageResponse verifyEmail(String token) {

        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new InvalidTokenException("Invalid or expired verification token"));

        if (user.getVerificationTokenExpiry() == null ||
                user.getVerificationTokenExpiry().isBefore(Instant.now())) {
            throw new InvalidTokenException("Verification link has expired. Please request a new one.");
        }

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);

        userRepository.save(user);

        return new MessageResponse("Email verified successfully");
    }

    // RESEND VERIFICATION
    @Override
    public MessageResponse resendVerification(String email) {

        User user = serviceUtils.getUserByEmailOrThrow(email);

        String verificationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpiry(
                Instant.now().plusSeconds(86400));

        userRepository.save(user);

        emailService.sendVerificationEmail(email, verificationToken);

        return new MessageResponse("Verification email resent successfully! Please check your inbox");
    }

    // FORGOT PASSWORD
    @Override
    public MessageResponse forgotPassword(String email) {

        User user = serviceUtils.getUserByEmailOrThrow(email);

        String resetToken = UUID.randomUUID().toString();
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetTokenExpiry(
                Instant.now().plusSeconds(3600));

        userRepository.save(user);

        emailService.sendPasswordResetEmail(email, resetToken);

        return new MessageResponse("Password reset email sent successfully! Please check your inbox");
    }

    // RESET PASSWORD
    @Override
    public MessageResponse resetPassword(String token, String newPassword) {

        User user = userRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new InvalidTokenException("Invalid or expired resest-token"));

        if (user.getPasswordResetTokenExpiry() == null ||
                user.getPasswordResetTokenExpiry().isBefore(Instant.now())) {
            throw new InvalidTokenException("Reset-token has expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);

        userRepository.save(user);

        return new MessageResponse("Password reset successful! Now you can log-in with your new password");
    }

    // CHANGE PASSWORD
    @Override
    public MessageResponse changePassword(String email, String currentPassword, String newPassword) {

        User user = serviceUtils.getUserByEmailOrThrow(email);

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new InvalidCredentialsException("Current password incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return new MessageResponse("Password changed successfully");
    }

    // GET CURRENT USER
    @Override
    public LoginResponse getCurrentUser(String email) {

        User user = serviceUtils.getUserByEmailOrThrow(email);

        return new LoginResponse(
                null,
                user.getEmail(),
                user.getFullName(),
                user.getRole().name());
    }
}