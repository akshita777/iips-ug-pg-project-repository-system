package com.iips.pms.entity;

import jakarta.persistence.*;

@Entity
@DiscriminatorValue("FACULTY")
public class Faculty extends User {
    @Column(name = "employee_id", unique = true)
    private String employeeId;

    private String department;

    @Column(name = "max_capacity")
    private Integer maxCapacity;

    public Faculty() {}

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public Integer getMaxCapacity() { return maxCapacity; }
    public void setMaxCapacity(Integer maxCapacity) { this.maxCapacity = maxCapacity; }
}
