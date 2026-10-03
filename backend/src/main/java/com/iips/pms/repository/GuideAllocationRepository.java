package com.iips.pms.repository;

import com.iips.pms.entity.GuideAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GuideAllocationRepository extends JpaRepository<GuideAllocation, Long> {
    List<GuideAllocation> findByFacultyId(Long facultyId);
    List<GuideAllocation> findByStudentId(Long studentId);
    List<GuideAllocation> findByProjectId(Long projectId);
}
