package com.hirelink.service;

import com.hirelink.dto.AuthDTO;
import com.hirelink.entity.ServiceProvider;
import com.hirelink.entity.User;
import com.hirelink.exception.BadRequestException;
import com.hirelink.exception.ResourceNotFoundException;
import com.hirelink.exception.UnauthorizedException;
import com.hirelink.repository.ServiceProviderRepository;
import com.hirelink.repository.UserRepository;
import com.hirelink.security.CustomUserDetails;
import com.hirelink.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final ServiceProviderRepository providerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest request) {
        // Check if phone already exists
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new BadRequestException("Phone number already registered");
        }

        // Check if email already exists (if provided)
        if (request.getEmail() != null && !request.getEmail().isEmpty() && 
            userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        // Determine user type
        User.UserType userType = User.UserType.CUSTOMER;
        if (request.getUserType() != null && request.getUserType().equalsIgnoreCase("PROVIDER")) {
            userType = User.UserType.PROVIDER;
        }

        // Create user
        User user = User.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .userType(userType)
                .accountStatus(User.AccountStatus.ACTIVE)
                .build();

        user = userRepository.save(user);

        // If provider, create provider profile
        if (userType == User.UserType.PROVIDER) {
            ServiceProvider provider = ServiceProvider.builder()
                    .user(user)
                    .businessName(request.getName() + "'s Services")
                    .build();
            providerRepository.save(provider);
        }

        // Generate tokens
        CustomUserDetails userDetails = new CustomUserDetails(user);
        String accessToken = jwtService.generateAccessToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthDTO.AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpiration())
                .user(mapToUserDTO(user))
                .build();
    }

    @Transactional
    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getPhone(), request.getPassword())
            );
        } catch (Exception e) {
            throw new UnauthorizedException("Invalid phone or password");
        }

        User user = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new UnauthorizedException("Invalid phone or password"));

        // Update last login
        user.setLastLoginAt(LocalDateTime.now());
        user.setFailedLoginAttempts(0);
        userRepository.save(user);

        // Generate tokens
        CustomUserDetails userDetails = new CustomUserDetails(user);
        String accessToken = jwtService.generateAccessToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthDTO.AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpiration())
                .user(mapToUserDTO(user))
                .build();
    }

    public AuthDTO.AuthResponse refreshToken(String refreshToken) {
        String phone = jwtService.extractUsername(refreshToken);
        
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        CustomUserDetails userDetails = new CustomUserDetails(user);
        
        if (!jwtService.isTokenValid(refreshToken, userDetails)) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        String newAccessToken = jwtService.generateAccessToken(userDetails);
        String newRefreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthDTO.AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpiration())
                .user(mapToUserDTO(user))
                .build();
    }

    @Transactional
    public void changePassword(Long userId, AuthDTO.ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private AuthDTO.UserDTO mapToUserDTO(User user) {
        return AuthDTO.UserDTO.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .profileImageUrl(user.getProfileImageUrl())
                .userType(user.getUserType().name())
                .accountStatus(user.getAccountStatus().name())
                .isEmailVerified(user.getIsEmailVerified())
                .isPhoneVerified(user.getIsPhoneVerified())
                .build();
    }
}
