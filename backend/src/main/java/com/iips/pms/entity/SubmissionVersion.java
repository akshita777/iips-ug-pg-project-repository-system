package com.iips.pms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "submission_versions")
public class SubmissionVersion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(columnDefinition = "TEXT")
    private String comments;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    public SubmissionVersion() {}

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public Integer getVersionNumber() { return versionNumber; }
    public void setVersionNumber(Integer versionNumber) { this.versionNumber = versionNumber; }
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
}
