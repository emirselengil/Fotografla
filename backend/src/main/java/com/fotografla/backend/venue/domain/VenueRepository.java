package com.fotografla.backend.venue.domain;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VenueRepository extends JpaRepository<VenueEntity, UUID> {
	Optional<VenueEntity> findByOwnerUserId(UUID ownerUserId);
}
