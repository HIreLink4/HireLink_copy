package com.hirelink.repository;

import com.hirelink.entity.ServiceCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceCategoryRepository extends JpaRepository<ServiceCategory, Long> {
    
    Optional<ServiceCategory> findByCategorySlug(String slug);
    
    Optional<ServiceCategory> findByCategoryName(String name);
    
    List<ServiceCategory> findByIsActiveTrue();
    
    List<ServiceCategory> findByIsFeaturedTrueAndIsActiveTrue();
    
    List<ServiceCategory> findByParentCategoryIsNullAndIsActiveTrue();
    
    List<ServiceCategory> findByParentCategoryCategoryIdAndIsActiveTrue(Long parentId);
    
    @Query("SELECT c FROM ServiceCategory c WHERE c.isActive = true ORDER BY c.displayOrder ASC, c.categoryName ASC")
    List<ServiceCategory> findAllActiveSorted();
    
    @Query("SELECT c FROM ServiceCategory c WHERE c.parentCategory IS NULL AND c.isActive = true ORDER BY c.displayOrder ASC")
    List<ServiceCategory> findRootCategories();
    
    boolean existsByCategorySlug(String slug);
}
