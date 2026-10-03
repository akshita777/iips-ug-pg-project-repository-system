package com.iips.pms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@DiscriminatorValue("FACULTY")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Faculty extends User {
    @Column(name = "employee_id", unique = true)
    private String employeeId;

    private String department;

    @Column(name = "max_capacity")
    private Integer maxCapacity;
}
