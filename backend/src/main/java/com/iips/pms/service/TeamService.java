package com.iips.pms.service;

import com.iips.pms.entity.Project;
import com.iips.pms.entity.Student;
import com.iips.pms.entity.TeamMember;
import com.iips.pms.entity.User;
import com.iips.pms.exception.ResourceNotFoundException;
import com.iips.pms.repository.ProjectRepository;
import com.iips.pms.repository.TeamMemberRepository;
import com.iips.pms.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TeamService {

    private final TeamMemberRepository teamRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public TeamService(TeamMemberRepository teamRepository,
                       ProjectRepository projectRepository,
                       UserRepository userRepository) {
        this.teamRepository = teamRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public List<TeamMember> list(Long projectId) {
        findProject(projectId);
        return teamRepository.findByProjectId(projectId);
    }

    @Transactional
    public TeamMember add(Long projectId, String callerEmail, Long studentId, String teamRole) {
        Project project = findOwnedProject(projectId, callerEmail);
        User candidate = userRepository.findById(studentId).orElseThrow(
                () -> new ResourceNotFoundException("User not found: " + studentId));
        if (!(candidate instanceof Student student)) {
            throw new IllegalArgumentException("Only students can join a project team");
        }
        if (teamRepository.existsByProjectIdAndStudentId(projectId, studentId)) {
            throw new IllegalStateException("Student is already on this team");
        }
        if (teamRepository.findByProjectId(projectId).size() >= 1) {
            throw new IllegalStateException("Teams are capped at two members including the owner");
        }
        TeamMember.TeamRole role;
        try {
            role = TeamMember.TeamRole.valueOf(teamRole.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Team role must be LEAD, DEVELOPER, or TESTER");
        }
        TeamMember member = new TeamMember();
        member.setProject(project);
        member.setStudent(student);
        member.setTeamRole(role);
        return teamRepository.save(member);
    }

    @Transactional
    public void remove(Long projectId, String callerEmail, Long memberId) {
        findOwnedProject(projectId, callerEmail);
        TeamMember member = teamRepository.findById(memberId).orElseThrow(
                () -> new ResourceNotFoundException("Team member not found: " + memberId));
        if (!member.getProject().getId().equals(projectId)) {
            throw new IllegalArgumentException("Team member does not belong to this project");
        }
        teamRepository.delete(member);
    }

    private Project findProject(Long id) {
        return projectRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Project not found: " + id));
    }

    private Project findOwnedProject(Long projectId, String callerEmail) {
        Project project = findProject(projectId);
        User caller = userRepository.findByEmail(callerEmail).orElseThrow(
                () -> new ResourceNotFoundException("User not found: " + callerEmail));
        if (!(caller instanceof Student) || !project.getStudent().getId().equals(caller.getId())) {
            throw new IllegalStateException("Only the owning student manages the team");
        }
        return project;
    }
}
