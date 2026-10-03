package com.iips.pms.entity;

import jakarta.persistence.*;

@Entity
@DiscriminatorValue("COORDINATOR")
public class Coordinator extends User {
    @Column(name = "employee_id", unique = true)
    private String employeeId;

    private String department;

    public Coordinator() {}

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
}
