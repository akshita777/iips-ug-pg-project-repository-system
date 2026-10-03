package com.iips.pms.repository;

import com.iips.pms.entity.DeadlineWindow;
import com.iips.pms.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DeadlineWindowRepository extends JpaRepository<DeadlineWindow, Long> {
    List<DeadlineWindow> findByBatchMentorProgramCodeAndBatchMentorBatchYearAndProjectType(
            String programCode, Integer batchYear, Project.ProjectType projectType);
}
