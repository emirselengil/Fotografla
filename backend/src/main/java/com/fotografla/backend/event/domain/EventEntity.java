package com.fotografla.backend.event.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "events")
public class EventEntity {

    @Id
    private UUID id;

    @Column(name = "venue_id", nullable = false)
    private UUID venueId;

    @Column(name = "couple_id", nullable = false)
    private UUID coupleId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @Column(name = "starts_at", nullable = false)
    private OffsetDateTime startsAt;

    @Column(name = "ends_at", nullable = false)
    private OffsetDateTime endsAt;

    @Column(name = "pax_planned", nullable = false)
    private Integer paxPlanned;

    @Column(name = "package_name")
    private String packageName;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "payment_status", nullable = false)
    private String paymentStatus;

    @Column(name = "contact_name")
    private String contactName;

    @Column(name = "contact_phone_e164")
    private String contactPhoneE164;

    @Column(name = "contact_email", columnDefinition = "citext")
    private String contactEmail;

    @Column(name = "notes")
    private String notes;

    @Column(name = "photographer_needed", nullable = false)
    private Boolean photographerNeeded;

    @Column(name = "created_by_user_id", nullable = false)
    private UUID createdByUserId;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    void prePersist() {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (status == null) {
            status = "planned";
        }
        if (paymentStatus == null) {
            paymentStatus = "pending";
        }
        if (photographerNeeded == null) {
            photographerNeeded = false;
        }
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = OffsetDateTime.now(ZoneOffset.UTC);
    }
}
