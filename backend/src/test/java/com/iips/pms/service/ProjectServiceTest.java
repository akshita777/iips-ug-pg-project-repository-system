package com.iips.pms.service;

import com.iips.pms.entity.GuideAllocation;
import com.iips.pms.entity.Project;
import com.iips.pms.entity.Student;
import com.iips.pms.event.ProjectStatusEvent;
import com.iips.pms.repository.GuideAllocationRepository;
import com.iips.pms.repository.ProjectRepository;
import com.iips.pms.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private GuideAllocationRepository allocationRepository;
    @Mock
    private ApplicationEventPublisher events;

    @InjectMocks
    private ProjectService projectService;

    @Test
    void submitMovesDraftToSubmittedAndPublishesEvent() {
        Project project = new Project();
        project.setId(1L);
        project.setStatus(Project.ProjectStatus.DRAFT);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(projectRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Project saved = projectService.submit(1L);

        assertEquals(Project.ProjectStatus.SUBMITTED, saved.getStatus());
        ArgumentCaptor<ProjectStatusEvent> captor = ArgumentCaptor.forClass(ProjectStatusEvent.class);
        verify(events).publishEvent(captor.capture());
        assertEquals(Project.ProjectStatus.DRAFT, captor.getValue().oldStatus());
        assertEquals(Project.ProjectStatus.SUBMITTED, captor.getValue().newStatus());
    }

    @Test
    void submitFromApprovedStateIsRejected() {
        Project project = new Project();
        project.setId(1L);
        project.setStatus(Project.ProjectStatus.APPROVED);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));

        assertThrows(IllegalStateException.class, () -> projectService.submit(1L));
        verify(events, never()).publishEvent(any());
    }

    @Test
    void approveRequiresAllocatedGuide() {
        Student student = new Student();
        student.setId(7L);
        Project project = new Project();
        project.setId(1L);
        project.setStudent(student);
        project.setStatus(Project.ProjectStatus.UNDER_REVIEW);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(allocationRepository.findByProjectId(1L)).thenReturn(List.of());

        assertThrows(IllegalStateException.class, () -> projectService.approve(1L, "stranger@iips.edu"));
    }
}
