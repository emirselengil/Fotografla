package com.fotografla.backend.media.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.sql.Types;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;

@Getter
@Setter
@Entity
@Table(name = "media_assets")
public class MediaAssetEntity {

    @Id
    private UUID id;

    @Column(name = "venue_id", nullable = false)
    private UUID venueId;

    @Column(name = "event_id", nullable = false)
    private UUID eventId;

    @Column(name = "uploaded_by_guest_session_id")
    private UUID uploadedByGuestSessionId;

    @Column(name = "uploaded_by_user_id")
    private UUID uploadedByUserId;

    @Column(name = "media_type", nullable = false)
    private String mediaType;

    @Column(name = "storage_provider", nullable = false)
    private String storageProvider;

    @Column(name = "object_key", nullable = false)
    private String objectKey;

    @Column(name = "original_filename")
    private String originalFilename;

    @Column(name = "mime_type", nullable = false)
    private String mimeType;

    @Column(name = "size_bytes", nullable = false)
    private Long sizeBytes;

    @Column(name = "width_px")
    private Integer widthPx;

    @Column(name = "height_px")
    private Integer heightPx;

    @Column(name = "duration_seconds")
    private BigDecimal durationSeconds;

    @JdbcTypeCode(Types.CHAR)
    @Column(name = "checksum_sha256", length = 64)
    private String checksumSha256;

    @Column(name = "is_public", nullable = false)
    private Boolean isPublic;

    @Column(name = "moderation_status", nullable = false)
    private String moderationStatus;

    @Column(name = "captured_at")
    private OffsetDateTime capturedAt;

    @Column(name = "uploaded_at", nullable = false)
    private OffsetDateTime uploadedAt;

    @PrePersist
    void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (isPublic == null) {
            isPublic = true;
        }
        if (moderationStatus == null) {
            moderationStatus = "approved";
        }
        if (uploadedAt == null) {
            uploadedAt = OffsetDateTime.now(ZoneOffset.UTC);
        }
    }
}
