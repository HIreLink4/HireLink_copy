package com.hirelink.controller;

import com.hirelink.dto.ApiResponse;
import com.hirelink.dto.BookingDTO;
import com.hirelink.security.CustomUserDetails;
import com.hirelink.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Booking management endpoints")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @Operation(summary = "Create a new booking")
    public ResponseEntity<ApiResponse<BookingDTO.BookingResponse>> createBooking(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody BookingDTO.CreateBookingRequest request) {
        BookingDTO.BookingResponse response = bookingService.createBooking(userDetails.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Booking created successfully", response));
    }

    @GetMapping("/my-bookings")
    @Operation(summary = "Get current user's bookings")
    public ResponseEntity<ApiResponse<BookingDTO.BookingListResponse>> getMyBookings(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        BookingDTO.BookingListResponse response = bookingService.getUserBookings(
                userDetails.getUserId(), status, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get booking by ID")
    public ResponseEntity<ApiResponse<BookingDTO.BookingResponse>> getBookingById(
            @PathVariable Long id) {
        BookingDTO.BookingResponse response = bookingService.getBookingById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/number/{bookingNumber}")
    @Operation(summary = "Get booking by booking number")
    public ResponseEntity<ApiResponse<BookingDTO.BookingResponse>> getBookingByNumber(
            @PathVariable String bookingNumber) {
        BookingDTO.BookingResponse response = bookingService.getBookingByNumber(bookingNumber);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update booking status")
    public ResponseEntity<ApiResponse<BookingDTO.BookingResponse>> updateBookingStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody BookingDTO.UpdateBookingStatusRequest request) {
        BookingDTO.BookingResponse response = bookingService.updateBookingStatus(id, userDetails.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Booking status updated", response));
    }

    @PostMapping("/{id}/review")
    @Operation(summary = "Add review for completed booking")
    public ResponseEntity<ApiResponse<Void>> addReview(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody BookingDTO.AddReviewRequest request) {
        bookingService.addReview(id, userDetails.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Review added successfully"));
    }
}
