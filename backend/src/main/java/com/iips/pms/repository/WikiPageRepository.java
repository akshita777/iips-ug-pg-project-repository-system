package com.iips.pms.repository;

import com.iips.pms.entity.WikiPage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WikiPageRepository extends JpaRepository<WikiPage, Long> {
    List<WikiPage> findByProjectIdOrderByTitleAsc(Long projectId);
    Optional<WikiPage> findByProjectIdAndTitle(Long projectId, String title);
}
