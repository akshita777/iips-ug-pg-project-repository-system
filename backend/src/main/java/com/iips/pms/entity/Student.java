package com.iips.pms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@DiscriminatorValue("STUDENT")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student extends User {
    @Column(name = "roll_number", unique = true)
    private String rollNumber;

    private Integer semester;

    private String program;
}
