package com.iips.pms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "guide_allocations")
public class GuideAllocation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "faculty_id", nullable = false)
    private Faculty faculty;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AllocationStatus status = AllocationStatus.PENDING;

    @Column(name = "allocated_at")
    private LocalDateTime allocatedAt;

    public GuideAllocation() {}

    @PrePersist
    protected void onCreate() {
        allocatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public Faculty getFaculty() { return faculty; }
    public void setFaculty(Faculty faculty) { this.faculty = faculty; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public AllocationStatus getStatus() { return status; }
    public void setStatus(AllocationStatus status) { this.status = status; }
    public LocalDateTime getAllocatedAt() { return allocatedAt; }

    public enum AllocationStatus {
        PENDING, SUGGESTED, CONFIRMED, OVERRIDDEN, ACTIVE, COMPLETED
    }
}
