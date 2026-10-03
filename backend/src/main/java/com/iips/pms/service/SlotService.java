package com.iips.pms.service;

import com.iips.pms.entity.Faculty;
import com.iips.pms.entity.ReviewSlot;
import com.iips.pms.entity.Student;
import com.iips.pms.entity.User;
import com.iips.pms.exception.ResourceNotFoundException;
import com.iips.pms.repository.ReviewSlotRepository;
import com.iips.pms.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SlotService {

    private final ReviewSlotRepository slotRepository;
    private final UserRepository userRepository;

    public SlotService(ReviewSlotRepository slotRepository, UserRepository userRepository) {
        this.slotRepository = slotRepository;
        this.userRepository = userRepository;
    }

    public List<ReviewSlot> mySlots(String callerEmail) {
        User caller = findUser(callerEmail);
        if (caller instanceof Faculty) {
            return slotRepository.findByFacultyIdOrderByStartsAtAsc(caller.getId());
        }
        return slotRepository.findByStudentIdOrderByStartsAtAsc(caller.getId());
    }

    public List<ReviewSlot> openSlots() {
        return slotRepository.findAll().stream()
                .filter(s -> s.getStatus() == ReviewSlot.SlotStatus.OPEN
                        && s.getStartsAt().isAfter(LocalDateTime.now()))
                .toList();
    }

    @Transactional
    public ReviewSlot offer(String callerEmail, LocalDateTime startsAt) {
        User caller = findUser(callerEmail);
        if (!(caller instanceof Faculty faculty)) {
            throw new IllegalStateException("Only guides offer review slots");
        }
        if (startsAt.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Slot must start in the future");
        }
        ReviewSlot slot = new ReviewSlot();
        slot.setFaculty(faculty);
        slot.setStartsAt(startsAt);
        slot.setStatus(ReviewSlot.SlotStatus.OPEN);
        return slotRepository.save(slot);
    }

    @Transactional
    public ReviewSlot book(Long slotId, String callerEmail) {
        User caller = findUser(callerEmail);
        if (!(caller instanceof Student student)) {
            throw new IllegalStateException("Only students book review slots");
        }
        ReviewSlot slot = slotRepository.findById(slotId).orElseThrow(
                () -> new ResourceNotFoundException("Slot not found: " + slotId));
        if (slot.getStatus() != ReviewSlot.SlotStatus.OPEN) {
            throw new IllegalStateException("This slot is no longer open");
        }
        slot.setStudent(student);
        slot.setStatus(ReviewSlot.SlotStatus.BOOKED);
        return slotRepository.save(slot);
    }

    @Transactional
    public ReviewSlot cancel(Long slotId, String callerEmail) {
        User caller = findUser(callerEmail);
        ReviewSlot slot = slotRepository.findById(slotId).orElseThrow(
                () -> new ResourceNotFoundException("Slot not found: " + slotId));
        boolean owner = slot.getFaculty().getEmail().equals(callerEmail)
                || (slot.getStudent() != null && slot.getStudent().getEmail().equals(callerEmail));
        if (!owner) {
            throw new IllegalStateException("Only the guide or the booking student cancels a slot");
        }
        slot.setStatus(ReviewSlot.SlotStatus.CANCELLED);
        return slotRepository.save(slot);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email).orElseThrow(
                () -> new ResourceNotFoundException("User not found: " + email));
    }
}
