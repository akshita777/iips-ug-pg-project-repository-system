package com.iips.pms.entity;

import jakarta.persistence.*;

@Entity
@DiscriminatorValue("STUDENT")
public class Student extends User {
    @Column(name = "roll_number", unique = true)
    private String rollNumber;

    private Integer semester;

    private String program;

    public Student() {}

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }
    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }
    public String getProgram() { return program; }
    public void setProgram(String program) { this.program = program; }
}
