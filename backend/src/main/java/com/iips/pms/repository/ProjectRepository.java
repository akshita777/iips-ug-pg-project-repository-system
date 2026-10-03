package com.iips.pms.repository;

import com.iips.pms.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByStudentId(Long studentId);
    List<Project> findByStatus(Project.ProjectStatus status);
}
