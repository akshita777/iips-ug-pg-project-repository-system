package com.iips.pms.repository;

import com.iips.pms.entity.ReviewSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewSlotRepository extends JpaRepository<ReviewSlot, Long> {
    List<ReviewSlot> findByFacultyIdOrderByStartsAtAsc(Long facultyId);
    List<ReviewSlot> findByStudentIdOrderByStartsAtAsc(Long studentId);
}
