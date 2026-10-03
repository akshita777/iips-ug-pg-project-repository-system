package com.iips.pms.repository;

import com.iips.pms.entity.CommitRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommitRecordRepository extends JpaRepository<CommitRecord, Long> {
    List<CommitRecord> findByProjectIdOrderByCommittedAtDesc(Long projectId);
    boolean existsBySha(String sha);
}
