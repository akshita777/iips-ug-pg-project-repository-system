package com.iips.pms.repository;

import com.iips.pms.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    List<TeamMember> findByProjectId(Long projectId);
    boolean existsByProjectIdAndStudentId(Long projectId, Long studentId);
}
