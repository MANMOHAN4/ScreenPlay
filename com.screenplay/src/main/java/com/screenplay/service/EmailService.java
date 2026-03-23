package com.screenplay.service;

public interface EmailService {

    // Send verification email (during signup)
    void sendVerificationEmail(String toEmail, String token);

    // Send password reset email
    void sendPasswordResetEmail(String toEmail, String token);
}