package com.iips.pms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "deadline_windows")
public class DeadlineWindow {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "batch_mentor_id", nullable = false)
    private BatchMentor batchMentor;

    @Enumerated(EnumType.STRING)
    @Column(name = "project_type", nullable = false)
    private Project.ProjectType projectType;

    @Column(name = "opens_on", nullable = false)
    private LocalDateTime opensOn;

    @Column(name = "closes_on", nullable = false)
    private LocalDateTime closesOn;

    public DeadlineWindow() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public BatchMentor getBatchMentor() { return batchMentor; }
    public void setBatchMentor(BatchMentor batchMentor) { this.batchMentor = batchMentor; }
    public Project.ProjectType getProjectType() { return projectType; }
    public void setProjectType(Project.ProjectType projectType) { this.projectType = projectType; }
    public LocalDateTime getOpensOn() { return opensOn; }
    public void setOpensOn(LocalDateTime opensOn) { this.opensOn = opensOn; }
    public LocalDateTime getClosesOn() { return closesOn; }
    public void setClosesOn(LocalDateTime closesOn) { this.closesOn = closesOn; }
}
