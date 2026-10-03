package com.iips.pms.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "batch_mentors",
        uniqueConstraints = {
            @UniqueConstraint(columnNames = {"program_code", "batch_year"}),
            @UniqueConstraint(columnNames = {"faculty_id"})
        })
public class BatchMentor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "faculty_id", nullable = false, unique = true)
    private User faculty;

    @Column(name = "program_code", nullable = false)
    private String programCode;

    @Column(name = "batch_year", nullable = false)
    private Integer batchYear;

    public BatchMentor() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getFaculty() { return faculty; }
    public void setFaculty(User faculty) { this.faculty = faculty; }
    public String getProgramCode() { return programCode; }
    public void setProgramCode(String programCode) { this.programCode = programCode; }
    public Integer getBatchYear() { return batchYear; }
    public void setBatchYear(Integer batchYear) { this.batchYear = batchYear; }
}
