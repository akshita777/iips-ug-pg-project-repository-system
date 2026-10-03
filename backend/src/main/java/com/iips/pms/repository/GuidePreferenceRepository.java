package com.iips.pms.repository;

import com.iips.pms.entity.GuidePreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GuidePreferenceRepository extends JpaRepository<GuidePreference, Long> {
    List<GuidePreference> findByStudentIdOrderByRankAsc(Long studentId);
    void deleteByStudentId(Long studentId);
}
