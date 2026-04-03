package com.fotografla.backend.venue.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "venues")
public class VenueEntity {

    @Id
    private UUID id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "owner_user_id", nullable = false)
    private UUID ownerUserId;

    @Column(name = "city", nullable = false)
    private String city;

    @Column(name = "slug", nullable = false)
    private String slug;

    @Column(name = "monthly_plan_code", nullable = false)
    private String monthlyPlanCode;

    @Column(name = "qr_status", nullable = false)
    private String qrStatus;

    @PrePersist
    void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (qrStatus == null || qrStatus.isBlank()) {
            qrStatus = "active";
        }
    }
}
