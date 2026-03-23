package com.screenplay.serviceImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.screenplay.exception.EmailNotVerifiedException;
import com.screenplay.service.EmailService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Autowired
    private JavaMailSender mailSender;

    // Frontend URL (Angular app)
    @Value("${app.frontend.url:http://localhost:4200}")
    private String frontendUrl;

    // Sender email (configured in application.properties)
    @Value("${spring.mail.username}")
    private String fromEmail;

    // SEND VERIFICATION EMAIL
    @Override
    public void sendVerificationEmail(String toEmail, String token) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();

            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Netflix Clone - Verify Your Email");

            String verificationLink = frontendUrl + "/verify-email?token=" + token;

            String emailBody = "Welcome to ScreenPLAY!\n\n"
                    +
                    "Thank you for registering. Please verify your email address by clicking the link below:\n\n"
                    +
                    verificationLink
                    + "\n\n"
                    +
                    "This link will expire in 24 hours.\n\n"
                    +
                    "If you did not create this account, please ignore this email.\n\n"
                    +
                    "Best regards,\n"
                    + "ScreenPLAY Team";

            message.setText(emailBody);

            mailSender.send(message);

            logger.info("Verification email sent to {}", toEmail);

        } catch (Exception ex) {
            logger.error("Failed to send verification email to {}: {}", toEmail, ex.getMessage(), ex);
            throw new EmailNotVerifiedException("Failed to send verification email");
        }
    }

    // SEND PASSWORD RESET EMAIL
    @Override
    public void sendPasswordResetEmail(String toEmail, String token) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();

            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("ScreenPLAY - Password Reset");

            String resetLink = frontendUrl + "/reset-password?token=" + token;

            String emailBody = "Hi,\n\n"
                    +
                    "We received a request to reset your password. Click the link below to reset it:\n\n"
                    +
                    resetLink
                    + "\n\n"
                    +
                    "This link will expire in 1 hour.\n\n"
                    +
                    "If you did not request a password reset, please ignore this email.\n\n"
                    +
                    "Best regards,\n"
                    +
                    "Netflix Clone Team";

            message.setText(emailBody);

            mailSender.send(message);

            logger.info("Password reset email sent to {}", toEmail);

        } catch (Exception ex) {
            logger.error("Failed to send password reset email to {}: {}", toEmail, ex.getMessage(), ex);
            throw new RuntimeException("Failed to send password reset email");
        }
    }
}
