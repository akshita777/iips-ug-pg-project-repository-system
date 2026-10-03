package com.iips.pms.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "guide_preferences",
        uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "faculty_id"}))
public class GuidePreference {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "faculty_id", nullable = false)
    private Faculty faculty;

    @Column(nullable = false)
    private Integer rank;

    public GuidePreference() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public Faculty getFaculty() { return faculty; }
    public void setFaculty(Faculty faculty) { this.faculty = faculty; }
    public Integer getRank() { return rank; }
    public void setRank(Integer rank) { this.rank = rank; }
}
