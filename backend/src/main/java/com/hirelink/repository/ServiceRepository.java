package com.hirelink.repository;

import com.hirelink.entity.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    
    List<Service> findByProviderProviderId(Long providerId);
    
    Page<Service> findByProviderProviderIdAndIsActiveTrue(Long providerId, Pageable pageable);
    
    Page<Service> findByCategoryCategoryIdAndIsActiveTrue(Long categoryId, Pageable pageable);
    
    Page<Service> findByCategoryCategorySlugAndIsActiveTrue(String categorySlug, Pageable pageable);
    
    List<Service> findByIsFeaturedTrueAndIsActiveTrue();
    
    @Query("SELECT s FROM Service s WHERE s.isActive = true ORDER BY s.timesBooked DESC")
    Page<Service> findPopularServices(Pageable pageable);
    
    @Query("SELECT s FROM Service s WHERE s.isActive = true AND (LOWER(s.serviceName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(s.serviceDescription) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Service> searchServices(@Param("query") String query, Pageable pageable);
    
    @Query("SELECT s FROM Service s WHERE s.category.categoryId = :categoryId AND s.isActive = true ORDER BY s.averageRating DESC, s.timesBooked DESC")
    Page<Service> findTopServicesByCategory(@Param("categoryId") Long categoryId, Pageable pageable);
    
    @Query("SELECT s FROM Service s WHERE s.provider.basePincode = :pincode AND s.isActive = true")
    List<Service> findByProviderPincode(@Param("pincode") String pincode);
    
    @Query("SELECT COUNT(s) FROM Service s WHERE s.category.categoryId = :categoryId AND s.isActive = true")
    Long countByCategoryId(@Param("categoryId") Long categoryId);
}
