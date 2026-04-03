package com.fotografla.backend.media.domain;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MediaAssetRepository extends JpaRepository<MediaAssetEntity, UUID> {
	List<MediaAssetEntity> findByEventIdOrderByUploadedAtDesc(UUID eventId);

	long countByVenueId(UUID venueId);

	long countByVenueIdAndUploadedAtAfter(UUID venueId, OffsetDateTime uploadedAt);

	@Query("select count(distinct m.eventId) from MediaAssetEntity m where m.venueId = :venueId")
	long countDistinctEventCountByVenueId(@Param("venueId") UUID venueId);
}
