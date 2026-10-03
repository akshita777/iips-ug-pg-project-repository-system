package com.iips.pms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "synopses")
public class Synopsis {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String summary;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SynopsisStatus status = SynopsisStatus.DRAFT;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Synopsis() {}

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public SynopsisStatus getStatus() { return status; }
    public void setStatus(SynopsisStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public enum SynopsisStatus {
        DRAFT, SUBMITTED, APPROVED, RETURNED
    }
}
