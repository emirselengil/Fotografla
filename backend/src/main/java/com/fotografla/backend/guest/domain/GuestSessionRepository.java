package com.fotografla.backend.guest.domain;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GuestSessionRepository extends JpaRepository<GuestSessionEntity, UUID> {
	List<GuestSessionEntity> findByEventIdOrderByJoinedAtAsc(UUID eventId);

	long countByVenueId(UUID venueId);

	long countByVenueIdAndJoinedAtAfter(UUID venueId, OffsetDateTime joinedAt);
}
