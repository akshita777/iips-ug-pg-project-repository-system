package com.iips.pms.service;

import com.iips.pms.exception.ResourceNotFoundException;
import com.iips.pms.entity.Notification;
import com.iips.pms.entity.Project.ProjectStatus;
import com.iips.pms.entity.User;
import com.iips.pms.event.ProjectStatusEvent;
import com.iips.pms.repository.GuideAllocationRepository;
import com.iips.pms.repository.NotificationRepository;
import com.iips.pms.repository.ProjectRepository;
import com.iips.pms.repository.UserRepository;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final ProjectRepository projectRepository;
    private final GuideAllocationRepository allocationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               ProjectRepository projectRepository,
                               GuideAllocationRepository allocationRepository,
                               UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.projectRepository = projectRepository;
        this.allocationRepository = allocationRepository;
        this.userRepository = userRepository;
    }

    public List<Notification> inbox(String callerEmail) {
        User caller = userRepository.findByEmail(callerEmail).orElseThrow(() -> new ResourceNotFoundException("Record not found"));
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(caller.getId());
    }

    public long unreadCount(String callerEmail) {
        User caller = userRepository.findByEmail(callerEmail).orElseThrow(() -> new ResourceNotFoundException("Record not found"));
        return notificationRepository.countByRecipientIdAndReadFalse(caller.getId());
    }

    @Transactional
    public void markRead(Long id, String callerEmail) {
        User caller = userRepository.findByEmail(callerEmail).orElseThrow(() -> new ResourceNotFoundException("Record not found"));
        Notification notification = notificationRepository.findById(id).orElseThrow(
                () -> new com.iips.pms.exception.ResourceNotFoundException(
                        "Notification not found: " + id));
        if (!notification.getRecipient().getId().equals(caller.getId())) {
            throw new IllegalStateException("You can only read your own notifications");
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @EventListener
    @Transactional
    public void onProjectStatus(ProjectStatusEvent event) {
        var project = projectRepository.findById(event.projectId()).orElseThrow(() -> new ResourceNotFoundException("Record not found"));
        String text = "Project '" + project.getTitle() + "' moved to "
                + pretty(event.newStatus());
        saveFor(project.getStudent(), text, event);
        for (var allocation : allocationRepository.findByProjectId(event.projectId())) {
            saveFor(allocation.getFaculty(), text, event);
        }
    }

    private void saveFor(User recipient, String text, ProjectStatusEvent event) {
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setMessage(text);
        notification.setProjectId(event.projectId());
        notification.setProjectStatus(event.newStatus());
        notificationRepository.save(notification);
    }

    private String pretty(ProjectStatus status) {
        return status.name().charAt(0) + status.name().substring(1).toLowerCase().replace('_', ' ');
    }
}
