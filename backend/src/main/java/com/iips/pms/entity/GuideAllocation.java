package com.iips.pms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "guide_allocations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
    @Builder.Default
    private AllocationStatus status = AllocationStatus.PENDING;

    @Column(name = "allocated_at")
    private LocalDateTime allocatedAt;

    @PrePersist
    protected void onCreate() {
        allocatedAt = LocalDateTime.now();
    }

    public enum AllocationStatus {
        PENDING, SUGGESTED, CONFIRMED, OVERRIDDEN, ACTIVE, COMPLETED
    }
}
