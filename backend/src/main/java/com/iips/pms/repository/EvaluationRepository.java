package com.iips.pms.repository;

import com.iips.pms.entity.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
    List<Evaluation> findByProjectId(Long projectId);
    List<Evaluation> findByEvaluatorId(Long evaluatorId);
}
