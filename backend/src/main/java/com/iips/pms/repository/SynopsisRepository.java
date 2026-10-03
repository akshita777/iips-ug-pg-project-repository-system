package com.iips.pms.repository;

import com.iips.pms.entity.Synopsis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SynopsisRepository extends JpaRepository<Synopsis, Long> {
    List<Synopsis> findByStudentIdOrderByCreatedAtDesc(Long studentId);
}
