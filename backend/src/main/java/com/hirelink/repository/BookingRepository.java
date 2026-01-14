package com.hirelink.repository;

import com.hirelink.entity.Booking;
import com.hirelink.entity.Booking.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    Optional<Booking> findByBookingNumber(String bookingNumber);
    
    Page<Booking> findByUserUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    Page<Booking> findByProviderProviderIdOrderByCreatedAtDesc(Long providerId, Pageable pageable);
    
    Page<Booking> findByUserUserIdAndBookingStatusOrderByCreatedAtDesc(Long userId, BookingStatus status, Pageable pageable);
    
    Page<Booking> findByProviderProviderIdAndBookingStatusOrderByCreatedAtDesc(Long providerId, BookingStatus status, Pageable pageable);
    
    List<Booking> findByProviderProviderIdAndScheduledDateAndBookingStatusIn(Long providerId, LocalDate date, List<BookingStatus> statuses);
    
    @Query("SELECT b FROM Booking b WHERE b.user.userId = :userId ORDER BY b.createdAt DESC")
    Page<Booking> findUserBookings(@Param("userId") Long userId, Pageable pageable);
    
    @Query("SELECT b FROM Booking b WHERE b.provider.providerId = :providerId ORDER BY b.createdAt DESC")
    Page<Booking> findProviderBookings(@Param("providerId") Long providerId, Pageable pageable);
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.user.userId = :userId AND b.bookingStatus = :status")
    Long countByUserAndStatus(@Param("userId") Long userId, @Param("status") BookingStatus status);
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.provider.providerId = :providerId AND b.bookingStatus = :status")
    Long countByProviderAndStatus(@Param("providerId") Long providerId, @Param("status") BookingStatus status);
    
    @Query("SELECT b FROM Booking b WHERE b.scheduledDate = :date AND b.bookingStatus IN :statuses ORDER BY b.scheduledTime ASC")
    List<Booking> findByDateAndStatuses(@Param("date") LocalDate date, @Param("statuses") List<BookingStatus> statuses);
    
    boolean existsByUserUserIdAndServiceServiceIdAndBookingStatusIn(Long userId, Long serviceId, List<BookingStatus> statuses);
}
