package com.hirelink.repository;

import com.hirelink.entity.ServiceProvider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceProviderRepository extends JpaRepository<ServiceProvider, Long> {
    
    Optional<ServiceProvider> findByUserUserId(Long userId);
    
    Optional<ServiceProvider> findByUserPhone(String phone);
    
    List<ServiceProvider> findByIsFeaturedTrue();
    
    Page<ServiceProvider> findByIsAvailableTrue(Pageable pageable);
    
    @Query("SELECT sp FROM ServiceProvider sp WHERE sp.isAvailable = true AND sp.kycStatus = 'VERIFIED' ORDER BY sp.averageRating DESC")
    Page<ServiceProvider> findTopRatedProviders(Pageable pageable);
    
    @Query("SELECT sp FROM ServiceProvider sp WHERE sp.basePincode = :pincode AND sp.isAvailable = true")
    List<ServiceProvider> findByPincodeAndAvailable(@Param("pincode") String pincode);
    
    @Query("SELECT DISTINCT sp FROM ServiceProvider sp JOIN sp.services s WHERE s.category.categoryId = :categoryId AND sp.isAvailable = true")
    Page<ServiceProvider> findByCategoryId(@Param("categoryId") Long categoryId, Pageable pageable);
    
    @Query("SELECT sp FROM ServiceProvider sp WHERE sp.user.accountStatus = 'ACTIVE' AND sp.isAvailable = true ORDER BY sp.averageRating DESC, sp.completedBookings DESC")
    Page<ServiceProvider> findActiveProviders(Pageable pageable);
}
