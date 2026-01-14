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
    
    @Query("SELECT s FROM Service s LEFT JOIN FETCH s.provider p LEFT JOIN FETCH p.user LEFT JOIN FETCH s.category WHERE p.providerId = :providerId AND s.isActive = true")
    Page<Service> findByProviderProviderIdAndIsActiveTrue(@Param("providerId") Long providerId, Pageable pageable);
    
    @Query("SELECT s FROM Service s LEFT JOIN FETCH s.provider p LEFT JOIN FETCH p.user LEFT JOIN FETCH s.category WHERE s.category.categoryId = :categoryId AND s.isActive = true")
    Page<Service> findByCategoryCategoryIdAndIsActiveTrue(@Param("categoryId") Long categoryId, Pageable pageable);
    
    @Query("SELECT s FROM Service s LEFT JOIN FETCH s.provider p LEFT JOIN FETCH p.user LEFT JOIN FETCH s.category c WHERE c.categorySlug = :categorySlug AND s.isActive = true")
    Page<Service> findByCategoryCategorySlugAndIsActiveTrue(@Param("categorySlug") String categorySlug, Pageable pageable);
    
    @Query("SELECT s FROM Service s LEFT JOIN FETCH s.provider p LEFT JOIN FETCH p.user LEFT JOIN FETCH s.category WHERE s.isFeatured = true AND s.isActive = true")
    List<Service> findByIsFeaturedTrueAndIsActiveTrue();
    
    @Query("SELECT s FROM Service s LEFT JOIN FETCH s.provider p LEFT JOIN FETCH p.user LEFT JOIN FETCH s.category WHERE s.isActive = true ORDER BY s.timesBooked DESC")
    Page<Service> findPopularServices(Pageable pageable);
    
    @Query("SELECT s FROM Service s LEFT JOIN FETCH s.provider p LEFT JOIN FETCH p.user LEFT JOIN FETCH s.category WHERE s.isActive = true AND (LOWER(s.serviceName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(s.serviceDescription) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Service> searchServices(@Param("query") String query, Pageable pageable);
    
    @Query("SELECT s FROM Service s LEFT JOIN FETCH s.provider p LEFT JOIN FETCH p.user LEFT JOIN FETCH s.category WHERE s.category.categoryId = :categoryId AND s.isActive = true ORDER BY s.averageRating DESC, s.timesBooked DESC")
    Page<Service> findTopServicesByCategory(@Param("categoryId") Long categoryId, Pageable pageable);
    
    @Query("SELECT s FROM Service s LEFT JOIN FETCH s.provider p LEFT JOIN FETCH p.user LEFT JOIN FETCH s.category WHERE p.basePincode = :pincode AND s.isActive = true")
    List<Service> findByProviderPincode(@Param("pincode") String pincode);
    
    @Query("SELECT COUNT(s) FROM Service s WHERE s.category.categoryId = :categoryId AND s.isActive = true")
    Long countByCategoryId(@Param("categoryId") Long categoryId);
    
    @Query("SELECT s FROM Service s LEFT JOIN FETCH s.provider p LEFT JOIN FETCH p.user LEFT JOIN FETCH s.category WHERE s.serviceId = :id")
    java.util.Optional<Service> findByIdWithDetails(@Param("id") Long id);
}
