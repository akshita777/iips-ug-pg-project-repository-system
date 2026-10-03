package com.iips.pms.entity;

import jakarta.persistence.*;

@Entity
@DiscriminatorValue("ADMIN")
public class Administrator extends User {
    public Administrator() {}
}
