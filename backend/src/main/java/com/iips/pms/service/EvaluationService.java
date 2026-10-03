package com.iips.pms.service;

import com.iips.pms.exception.ResourceNotFoundException;
import com.iips.pms.dto.EvaluationRequest;
import com.iips.pms.entity.Evaluation;
import com.iips.pms.entity.Project;
import com.iips.pms.entity.Rubric;
import com.iips.pms.entity.User;
import com.iips.pms.repository.EvaluationRepository;
import com.iips.pms.repository.GuideAllocationRepository;
import com.iips.pms.repository.ProjectRepository;
import com.iips.pms.repository.RubricRepository;
import com.iips.pms.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final ProjectRepository projectRepository;
    private final RubricRepository rubricRepository;
    private final UserRepository userRepository;
    private final GuideAllocationRepository allocationRepository;

    public EvaluationService(EvaluationRepository evaluationRepository,
                             ProjectRepository projectRepository,
                             RubricRepository rubricRepository,
                             UserRepository userRepository,
                             GuideAllocationRepository allocationRepository) {
        this.evaluationRepository = evaluationRepository;
        this.projectRepository = projectRepository;
        this.rubricRepository = rubricRepository;
        this.userRepository = userRepository;
        this.allocationRepository = allocationRepository;
    }

    public List<Rubric> rubrics() {
        return rubricRepository.findAll();
    }

    public List<Evaluation> assignedTo(String evaluatorEmail) {
        User evaluator = userRepository.findByEmail(evaluatorEmail).orElseThrow(() -> new ResourceNotFoundException("Record not found"));
        return evaluationRepository.findByEvaluatorId(evaluator.getId());
    }

    @Transactional
    public Evaluation submit(String evaluatorEmail, EvaluationRequest req) {
        User evaluator = userRepository.findByEmail(evaluatorEmail).orElseThrow(() -> new ResourceNotFoundException("Record not found"));
        Project project = projectRepository.findById(req.projectId()).orElseThrow(
                () -> new ResourceNotFoundException("Project not found: " + req.projectId()));
        boolean staff = "EVALUATOR".equals(evaluator.getRole())
                || "COORDINATOR".equals(evaluator.getRole())
                || "ADMIN".equals(evaluator.getRole());
        boolean ownGuide = allocationRepository.findByProjectId(project.getId()).stream()
                .anyMatch(a -> a.getFaculty().getEmail().equals(evaluatorEmail));
        if (!staff && !ownGuide) {
            throw new IllegalStateException("Only evaluators or the allocated guide submit marks");
        }
        if (project.getStatus() != Project.ProjectStatus.APPROVED
                && project.getStatus() != Project.ProjectStatus.EVALUATION_PENDING
                && project.getStatus() != Project.ProjectStatus.EVALUATED) {
            throw new IllegalStateException("Project must be approved before evaluation");
        }
        Rubric rubric = rubricRepository.findById(req.rubricId()).orElseThrow(
                () -> new ResourceNotFoundException("Rubric not found: " + req.rubricId()));
        if (req.totalMarks().compareTo(BigDecimal.ZERO) < 0
                || req.totalMarks().compareTo(new BigDecimal("100")) > 0) {
            throw new IllegalArgumentException("Total marks must be between 0 and 100");
        }
        Evaluation evaluation = new Evaluation();
        evaluation.setProject(project);
        evaluation.setEvaluator(evaluator);
        evaluation.setRubric(rubric);
        evaluation.setTotalMarks(req.totalMarks());
        evaluation.setFeedback(req.feedback());
        evaluation.setStatus(Evaluation.EvaluationStatus.COMPLETED);
        Evaluation saved = evaluationRepository.save(evaluation);
        project.setStatus(Project.ProjectStatus.EVALUATED);
        projectRepository.save(project);
        return saved;
    }
}
