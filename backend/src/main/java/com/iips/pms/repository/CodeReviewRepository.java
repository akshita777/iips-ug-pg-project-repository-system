package com.iips.pms.repository;

import com.iips.pms.entity.CodeReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CodeReviewRepository extends JpaRepository<CodeReview, Long> {
    List<CodeReview> findByProjectIdOrderByCreatedAtDesc(Long projectId);
}
