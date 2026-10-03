package com.iips.pms.service.allocation;

import com.iips.pms.exception.ResourceNotFoundException;
import com.iips.pms.entity.Faculty;
import com.iips.pms.entity.Student;
import org.springframework.stereotype.Component;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Component
public class CapacityBalancingStrategy implements AllocationStrategy {

    @Override
    public Faculty pickFor(Student student, List<Long> preferredFacultyIds,
                           List<Faculty> available, Map<Long, Integer> currentLoad) {
        List<Faculty> withRoom = available.stream()
                .filter(f -> currentLoad.getOrDefault(f.getId(), 0)
                        < (f.getMaxCapacity() == null ? 10 : f.getMaxCapacity()))
                .toList();
        if (withRoom.isEmpty()) {
            throw new IllegalStateException("No guide has free capacity left");
        }
        if (preferredFacultyIds != null) {
            for (Long preferredId : preferredFacultyIds) {
                for (Faculty f : withRoom) {
                    if (f.getId().equals(preferredId)) {
                        return f;
                    }
                }
            }
        }
        return withRoom.stream()
                .min(Comparator.comparingInt(f -> currentLoad.getOrDefault(f.getId(), 0)))
                .orElseThrow(() -> new ResourceNotFoundException("Record not found"));
    }
}
