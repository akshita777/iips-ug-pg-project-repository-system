package com.iips.pms.entity;

import jakarta.persistence.*;

@Entity
@DiscriminatorValue("STUDENT")
public class Student extends User {
    @Column(name = "roll_number", unique = true)
    private String rollNumber;

    @Column(name = "program_code")
    private String programCode;

    @Column(name = "batch_year")
    private Integer batchYear;

    @Column
    private String section;

    private Integer semester;

    private String program;

    public Student() {}

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }
    public String getProgramCode() { return programCode; }
    public void setProgramCode(String programCode) { this.programCode = programCode; }
    public Integer getBatchYear() { return batchYear; }
    public void setBatchYear(Integer batchYear) { this.batchYear = batchYear; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }
    public String getProgram() { return program; }
    public void setProgram(String program) { this.program = program; }
}
