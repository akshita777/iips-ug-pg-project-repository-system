package com.iips.pms.service;

import com.iips.pms.entity.Project;
import com.iips.pms.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CopyCheckService {

    private static final double FLAG_THRESHOLD = 0.5;

    private final ProjectRepository projectRepository;

    public CopyCheckService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public List<Map<String, Object>> similarTo(Long projectId) {
        Project project = projectRepository.findById(projectId).orElseThrow(
                () -> new com.iips.pms.exception.ResourceNotFoundException(
                        "Project not found: " + projectId));
        Set<String> words = tokens(project);
        List<Map<String, Object>> flags = new ArrayList<>();
        for (Project other : projectRepository.findAll()) {
            if (other.getId().equals(projectId)) {
                continue;
            }
            double score = jaccard(words, tokens(other));
            if (score >= FLAG_THRESHOLD) {
                Map<String, Object> flag = new LinkedHashMap<>();
                flag.put("projectId", other.getId());
                flag.put("title", other.getTitle());
                flag.put("score", Math.round(score * 100.0) / 100.0);
                flags.add(flag);
            }
        }
        return flags;
    }

    private Set<String> tokens(Project project) {
        String text = (project.getTitle() == null ? "" : project.getTitle()) + " "
                + (project.getAbstractText() == null ? "" : project.getAbstractText());
        Map<String, Integer> counts = new HashMap<>();
        for (String word : text.toLowerCase().split("[^a-z0-9]+")) {
            if (word.length() > 3) {
                counts.merge(word, 1, Integer::sum);
            }
        }
        return counts.keySet().stream().collect(Collectors.toSet());
    }

    private double jaccard(Set<String> a, Set<String> b) {
        if (a.isEmpty() || b.isEmpty()) {
            return 0.0;
        }
        long shared = a.stream().filter(b::contains).count();
        return (double) shared / (a.size() + b.size() - shared);
    }
}
