package com.iips.pms.service;

import com.iips.pms.entity.Faculty;
import com.iips.pms.entity.GuideAllocation;
import com.iips.pms.entity.Project;
import com.iips.pms.entity.Student;
import com.iips.pms.repository.FacultyRepository;
import com.iips.pms.repository.GuideAllocationRepository;
import com.iips.pms.repository.GuidePreferenceRepository;
import com.iips.pms.repository.ProjectRepository;
import com.iips.pms.repository.UserRepository;
import com.iips.pms.service.allocation.AllocationStrategy;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AllocationServiceTest {

    @Mock
    private GuideAllocationRepository allocationRepository;
    @Mock
    private GuidePreferenceRepository preferenceRepository;
    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private FacultyRepository facultyRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private AllocationStrategy strategy;

    @InjectMocks
    private AllocationService allocationService;

    @Test
    void suggestCreatesSuggestedAllocationThroughStrategy() {
        Student student = new Student();
        student.setId(1L);
        Project project = new Project();
        project.setId(10L);
        project.setStudent(student);
        Faculty faculty = new Faculty();
        faculty.setId(20L);

        when(facultyRepository.findAll()).thenReturn(List.of(faculty));
        when(allocationRepository.findAll()).thenReturn(List.of());
        when(projectRepository.findAll()).thenReturn(List.of(project));
        when(allocationRepository.findByProjectId(10L)).thenReturn(List.of());
        when(preferenceRepository.findByStudentIdOrderByRankAsc(1L)).thenReturn(List.of());
        when(strategy.pickFor(eq(student), eq(List.of()), eq(List.of(faculty)), any()))
                .thenReturn(faculty);
        when(allocationRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        List<GuideAllocation> created = allocationService.suggest();

        assertEquals(1, created.size());
        assertEquals(GuideAllocation.AllocationStatus.SUGGESTED, created.get(0).getStatus());
        assertEquals(20L, created.get(0).getFaculty().getId());
    }

    @Test
    void confirmAcceptsSuggestedAllocation() {
        GuideAllocation allocation = new GuideAllocation();
        allocation.setId(5L);
        allocation.setStatus(GuideAllocation.AllocationStatus.SUGGESTED);
        when(allocationRepository.findById(5L)).thenReturn(Optional.of(allocation));
        when(allocationRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        GuideAllocation confirmed = allocationService.confirm(5L);

        assertEquals(GuideAllocation.AllocationStatus.CONFIRMED, confirmed.getStatus());
    }

    @Test
    void overrideReassignsGuideAndMarksOverridden() {
        GuideAllocation allocation = new GuideAllocation();
        allocation.setId(5L);
        allocation.setStatus(GuideAllocation.AllocationStatus.SUGGESTED);
        Faculty replacement = new Faculty();
        replacement.setId(30L);
        when(allocationRepository.findById(5L)).thenReturn(Optional.of(allocation));
        when(facultyRepository.findById(30L)).thenReturn(Optional.of(replacement));
        when(allocationRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        GuideAllocation result = allocationService.override(5L, 30L);

        assertEquals(GuideAllocation.AllocationStatus.OVERRIDDEN, result.getStatus());
        assertEquals(30L, result.getFaculty().getId());
    }
}
