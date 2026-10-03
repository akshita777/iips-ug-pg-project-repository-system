package com.iips.pms.controller;

import com.iips.pms.dto.TeamAddRequest;
import com.iips.pms.entity.TeamMember;
import com.iips.pms.service.TeamService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/team")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @GetMapping
    public ResponseEntity<List<TeamMember>> list(@PathVariable Long projectId) {
        return ResponseEntity.ok(teamService.list(projectId));
    }

    @PostMapping
    public ResponseEntity<TeamMember> add(@PathVariable Long projectId,
                                          Authentication auth,
                                          @Valid @RequestBody TeamAddRequest req) {
        return ResponseEntity.ok(teamService.add(
                projectId, auth.getName(), req.studentId(), req.teamRole()));
    }

    @DeleteMapping("/{memberId}")
    public ResponseEntity<Void> remove(@PathVariable Long projectId,
                                        @PathVariable Long memberId,
                                        Authentication auth) {
        teamService.remove(projectId, auth.getName(), memberId);
        return ResponseEntity.ok().build();
    }
}
