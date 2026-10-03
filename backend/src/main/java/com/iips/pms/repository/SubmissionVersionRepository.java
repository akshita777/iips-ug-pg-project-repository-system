package com.iips.pms.repository;

import com.iips.pms.entity.SubmissionVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SubmissionVersionRepository extends JpaRepository<SubmissionVersion, Long> {
    List<SubmissionVersion> findByProjectIdOrderByVersionNumberDesc(Long projectId);
}
