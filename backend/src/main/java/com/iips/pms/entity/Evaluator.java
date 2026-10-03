package com.iips.pms.entity;

import jakarta.persistence.*;

@Entity
@DiscriminatorValue("EVALUATOR")
public class Evaluator extends User {
    @Column(name = "employee_id", unique = true)
    private String employeeId;

    private String organization;

    @Column(name = "is_external")
    private boolean external;

    public Evaluator() {}

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    public String getOrganization() { return organization; }
    public void setOrganization(String organization) { this.organization = organization; }
    public boolean isExternal() { return external; }
    public void setExternal(boolean external) { this.external = external; }
}
