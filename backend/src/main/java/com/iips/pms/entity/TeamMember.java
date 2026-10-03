package com.iips.pms.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "team_members",
        uniqueConstraints = @UniqueConstraint(columnNames = {"project_id", "student_id"}))
public class TeamMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(name = "team_role", nullable = false)
    private TeamRole teamRole = TeamRole.DEVELOPER;

    public TeamMember() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public TeamRole getTeamRole() { return teamRole; }
    public void setTeamRole(TeamRole teamRole) { this.teamRole = teamRole; }

    public enum TeamRole {
        LEAD, DEVELOPER, TESTER
    }
}
