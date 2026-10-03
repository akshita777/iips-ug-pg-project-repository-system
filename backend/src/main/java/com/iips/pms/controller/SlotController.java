package com.iips.pms.controller;

import com.iips.pms.dto.SlotRequest;
import com.iips.pms.entity.ReviewSlot;
import com.iips.pms.service.SlotService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/slots")
public class SlotController {

    private final SlotService slotService;

    public SlotController(SlotService slotService) {
        this.slotService = slotService;
    }

    @GetMapping("/mine")
    public ResponseEntity<List<ReviewSlot>> mine(Authentication auth) {
        return ResponseEntity.ok(slotService.mySlots(auth.getName()));
    }

    @GetMapping("/open")
    public ResponseEntity<List<ReviewSlot>> open() {
        return ResponseEntity.ok(slotService.openSlots());
    }

    @PostMapping
    public ResponseEntity<ReviewSlot> offer(Authentication auth,
                                            @Valid @RequestBody SlotRequest req) {
        return ResponseEntity.ok(slotService.offer(auth.getName(), req.startsAt()));
    }

    @PostMapping("/{id}/book")
    public ResponseEntity<ReviewSlot> book(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(slotService.book(id, auth.getName()));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ReviewSlot> cancel(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(slotService.cancel(id, auth.getName()));
    }
}
