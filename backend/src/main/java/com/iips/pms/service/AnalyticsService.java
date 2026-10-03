package com.iips.pms.service;

import com.iips.pms.entity.Evaluation;
import com.iips.pms.entity.GuideAllocation;
import com.iips.pms.entity.Project;
import com.iips.pms.repository.EvaluationRepository;
import com.iips.pms.repository.GuideAllocationRepository;
import com.iips.pms.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final ProjectRepository projectRepository;
    private final EvaluationRepository evaluationRepository;
    private final GuideAllocationRepository allocationRepository;

    public AnalyticsService(ProjectRepository projectRepository,
                            EvaluationRepository evaluationRepository,
                            GuideAllocationRepository allocationRepository) {
        this.projectRepository = projectRepository;
        this.evaluationRepository = evaluationRepository;
        this.allocationRepository = allocationRepository;
    }

    public Map<String, Object> summary() {
        Map<String, Object> out = new LinkedHashMap<>();
        List<Project> projects = projectRepository.findAll();
        out.put("totalProjects", projects.size());
        out.put("projectsByStatus", projects.stream().collect(
                Collectors.groupingBy(p -> p.getStatus().name(), Collectors.counting())));
        List<Evaluation> evaluations = evaluationRepository.findAll();
        out.put("totalEvaluations", evaluations.size());
        BigDecimal average = evaluations.stream()
                .map(Evaluation::getTotalMarks)
                .filter(m -> m != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        out.put("averageMarks", evaluations.isEmpty() ? BigDecimal.ZERO :
                average.divide(BigDecimal.valueOf(evaluations.size()), 2, RoundingMode.HALF_UP));
        Map<String, Long> load = new LinkedHashMap<>();
        for (GuideAllocation allocation : allocationRepository.findAll()) {
            if (allocation.getStatus() == GuideAllocation.AllocationStatus.CONFIRMED
                    || allocation.getStatus() == GuideAllocation.AllocationStatus.ACTIVE) {
                load.merge(allocation.getFaculty().getName(), 1L, Long::sum);
            }
        }
        out.put("guideLoad", load);
        return out;
    }
}
