package com.hirelink.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Service for sending emails.
 * Uses Spring Boot's JavaMailSender to send OTP verification emails via SMTP.
 * 
 * Configuration required in application.properties:
 * - spring.mail.host
 * - spring.mail.port
 * - spring.mail.username
 * - spring.mail.password
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@hirelink.com}")
    private String fromEmail;

    /**
     * Send an OTP verification email.
     * 
     * @param toEmail The recipient's email address
     * @param otp The 6-digit OTP code
     */
    public void sendOtpEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("HireLink - Your Verification Code");
            message.setText(buildOtpEmailBody(otp));
            
            mailSender.send(message);
            log.info("OTP email sent successfully to: {}", toEmail);
            
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
            // Log OTP to console as fallback for development
            logOtpFallback(toEmail, otp);
            throw new RuntimeException("Failed to send verification email. Please try again.", e);
        }
    }

    /**
     * Build the email body for OTP verification
     */
    private String buildOtpEmailBody(String otp) {
        return """
            Hello,
            
            Your HireLink verification code is:
            
            %s
            
            This code will expire in 10 minutes.
            
            If you didn't request this code, please ignore this email.
            
            Best regards,
            HireLink Team
            
            ---
            This is an automated message. Please do not reply.
            """.formatted(otp);
    }

    /**
     * Fallback logging when email fails (useful for development)
     */
    private void logOtpFallback(String email, String otp) {
        log.warn("");
        log.warn("╔══════════════════════════════════════════════════════════════╗");
        log.warn("║               📧 EMAIL OTP FALLBACK (MOCK)                    ║");
        log.warn("╠══════════════════════════════════════════════════════════════╣");
        log.warn("║  Email failed to send. OTP logged for development:          ║");
        log.warn("║  Email: {}", padRight(email, 47) + "║");
        log.warn("║  OTP:   {}", padRight(otp, 47) + "║");
        log.warn("╚══════════════════════════════════════════════════════════════╝");
        log.warn("");
    }

    /**
     * Helper method to pad string for log formatting
     */
    private String padRight(String s, int n) {
        return String.format("%-" + n + "s", s);
    }

    /**
     * Validate email format
     * 
     * @param email The email address to validate
     * @return true if the email format is valid
     */
    public boolean isValidEmail(String email) {
        if (email == null || email.isEmpty()) {
            return false;
        }
        // Basic email validation
        return email.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }
}
