package com.iips.pms.service.allocation;

import com.iips.pms.entity.Faculty;
import com.iips.pms.entity.Student;
import java.util.List;
import java.util.Map;

public interface AllocationStrategy {
    Faculty pickFor(Student student, List<Long> preferredFacultyIds,
                    List<Faculty> available, Map<Long, Integer> currentLoad);
}
