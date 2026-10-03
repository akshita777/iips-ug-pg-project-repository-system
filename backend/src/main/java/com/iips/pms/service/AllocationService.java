package com.iips.pms.service;

import com.iips.pms.exception.ResourceNotFoundException;
import com.iips.pms.dto.PreferenceRequest;
import com.iips.pms.entity.Faculty;
import com.iips.pms.entity.GuideAllocation;
import com.iips.pms.entity.GuidePreference;
import com.iips.pms.entity.Project;
import com.iips.pms.entity.Student;
import com.iips.pms.entity.User;
import com.iips.pms.repository.FacultyRepository;
import com.iips.pms.repository.GuideAllocationRepository;
import com.iips.pms.repository.GuidePreferenceRepository;
import com.iips.pms.repository.ProjectRepository;
import com.iips.pms.repository.UserRepository;
import com.iips.pms.service.allocation.AllocationStrategy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AllocationService {

    private final GuideAllocationRepository allocationRepository;
    private final GuidePreferenceRepository preferenceRepository;
    private final ProjectRepository projectRepository;
    private final FacultyRepository facultyRepository;
    private final UserRepository userRepository;
    private final AllocationStrategy strategy;

    public AllocationService(GuideAllocationRepository allocationRepository,
                             GuidePreferenceRepository preferenceRepository,
                             ProjectRepository projectRepository,
                             FacultyRepository facultyRepository,
                             UserRepository userRepository,
                             AllocationStrategy strategy) {
        this.allocationRepository = allocationRepository;
        this.preferenceRepository = preferenceRepository;
        this.projectRepository = projectRepository;
        this.facultyRepository = facultyRepository;
        this.userRepository = userRepository;
        this.strategy = strategy;
    }

    public List<GuideAllocation> listForCaller(String callerEmail) {
        User caller = userRepository.findByEmail(callerEmail).orElseThrow(() -> new ResourceNotFoundException("Record not found"));
        if ("COORDINATOR".equals(caller.getRole()) || "ADMIN".equals(caller.getRole())) {
            return allocationRepository.findAll();
        }
        if (caller instanceof Faculty) {
            return allocationRepository.findByFacultyId(caller.getId());
        }
        return allocationRepository.findByStudentId(caller.getId());
    }

    @Transactional
    public void savePreferences(String callerEmail, PreferenceRequest req) {
        User caller = userRepository.findByEmail(callerEmail).orElseThrow(() -> new ResourceNotFoundException("Record not found"));
        if (!(caller instanceof Student student)) {
            throw new IllegalStateException("Only students submit guide preferences");
        }
        Project project = projectRepository.findById(req.projectId()).orElseThrow(
                () -> new ResourceNotFoundException("Project not found: " + req.projectId()));
        if (!project.getStudent().getId().equals(student.getId())) {
            throw new IllegalStateException("You can only set preferences for your own project");
        }
        if (req.facultyIds() == null || req.facultyIds().isEmpty()) {
            throw new IllegalArgumentException("Preference list cannot be empty");
        }
        preferenceRepository.deleteByStudentId(student.getId());
        int rank = 1;
        for (Long facultyId : req.facultyIds()) {
            Faculty faculty = facultyRepository.findById(facultyId).orElseThrow(
                    () -> new ResourceNotFoundException("Faculty not found: " + facultyId));
            GuidePreference pref = new GuidePreference();
            pref.setStudent(student);
            pref.setFaculty(faculty);
            pref.setRank(rank++);
            preferenceRepository.save(pref);
        }
    }

    @Transactional
    public List<GuideAllocation> suggest() {
        List<Faculty> faculty = facultyRepository.findAll();
        if (faculty.isEmpty()) {
            throw new IllegalStateException("No guides available for allocation");
        }
        Map<Long, Integer> load = new HashMap<>();
        for (GuideAllocation existing : allocationRepository.findAll()) {
            if (existing.getStatus() == GuideAllocation.AllocationStatus.CONFIRMED
                    || existing.getStatus() == GuideAllocation.AllocationStatus.ACTIVE) {
                load.merge(existing.getFaculty().getId(), 1, Integer::sum);
            }
        }
        List<GuideAllocation> created = new ArrayList<>();
        for (Project project : projectRepository.findAll()) {
            boolean hasLive = allocationRepository.findByProjectId(project.getId()).stream()
                    .anyMatch(a -> a.getStatus() == GuideAllocation.AllocationStatus.CONFIRMED
                            || a.getStatus() == GuideAllocation.AllocationStatus.ACTIVE
                            || a.getStatus() == GuideAllocation.AllocationStatus.SUGGESTED);
            if (hasLive) {
                continue;
            }
            List<Long> prefs = preferenceRepository
                    .findByStudentIdOrderByRankAsc(project.getStudent().getId()).stream()
                    .map(p -> p.getFaculty().getId()).toList();
            Faculty picked = strategy.pickFor(project.getStudent(), prefs, faculty, load);
            load.merge(picked.getId(), 1, Integer::sum);
            GuideAllocation allocation = new GuideAllocation();
            allocation.setStudent(project.getStudent());
            allocation.setFaculty(picked);
            allocation.setProject(project);
            allocation.setStatus(GuideAllocation.AllocationStatus.SUGGESTED);
            created.add(allocationRepository.save(allocation));
        }
        return created;
    }

    @Transactional
    public GuideAllocation confirm(Long allocationId) {
        GuideAllocation allocation = findById(allocationId);
        if (allocation.getStatus() != GuideAllocation.AllocationStatus.SUGGESTED
                && allocation.getStatus() != GuideAllocation.AllocationStatus.OVERRIDDEN) {
            throw new IllegalStateException("Only suggested or adjusted allocations can be confirmed");
        }
        allocation.setStatus(GuideAllocation.AllocationStatus.CONFIRMED);
        return allocationRepository.save(allocation);
    }

    @Transactional
    public GuideAllocation override(Long allocationId, Long facultyId) {
        GuideAllocation allocation = findById(allocationId);
        Faculty faculty = facultyRepository.findById(facultyId).orElseThrow(
                () -> new ResourceNotFoundException("Faculty not found: " + facultyId));
        allocation.setFaculty(faculty);
        allocation.setStatus(GuideAllocation.AllocationStatus.OVERRIDDEN);
        return allocationRepository.save(allocation);
    }

    private GuideAllocation findById(Long id) {
        return allocationRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Allocation not found: " + id));
    }
}
