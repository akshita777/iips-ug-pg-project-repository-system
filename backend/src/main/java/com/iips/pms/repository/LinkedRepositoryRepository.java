package com.iips.pms.repository;

import com.iips.pms.entity.LinkedRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface LinkedRepositoryRepository extends JpaRepository<LinkedRepository, Long> {
    Optional<LinkedRepository> findByProjectId(Long projectId);
}
