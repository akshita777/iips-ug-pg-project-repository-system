package com.iips.pms.repository;

import com.iips.pms.entity.BatchMentor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BatchMentorRepository extends JpaRepository<BatchMentor, Long> {
    Optional<BatchMentor> findByProgramCodeAndBatchYear(String programCode, Integer batchYear);
    List<BatchMentor> findByFacultyId(Long facultyId);
}
