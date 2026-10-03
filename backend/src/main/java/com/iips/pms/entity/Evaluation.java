package com.iips.pms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "evaluations")
public class Evaluation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne
    @JoinColumn(name = "evaluator_id", nullable = false)
    private User evaluator;

    @ManyToOne
    @JoinColumn(name = "rubric_id", nullable = false)
    private Rubric rubric;

    @Column(name = "total_marks", precision = 5, scale = 2)
    private BigDecimal totalMarks;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EvaluationStatus status = EvaluationStatus.PENDING;

    @Column(name = "evaluated_at")
    private LocalDateTime evaluatedAt;

    public Evaluation() {}

    @PrePersist
    protected void onCreate() {
        evaluatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public User getEvaluator() { return evaluator; }
    public void setEvaluator(User evaluator) { this.evaluator = evaluator; }
    public Rubric getRubric() { return rubric; }
    public void setRubric(Rubric rubric) { this.rubric = rubric; }
    public BigDecimal getTotalMarks() { return totalMarks; }
    public void setTotalMarks(BigDecimal totalMarks) { this.totalMarks = totalMarks; }
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
    public EvaluationStatus getStatus() { return status; }
    public void setStatus(EvaluationStatus status) { this.status = status; }
    public LocalDateTime getEvaluatedAt() { return evaluatedAt; }

    public enum EvaluationStatus {
        PENDING, IN_PROGRESS, COMPLETED
    }
}
