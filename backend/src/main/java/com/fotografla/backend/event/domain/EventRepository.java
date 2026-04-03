package com.fotografla.backend.event.domain;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<EventEntity, UUID> {
    Optional<EventEntity> findFirstByStatusOrderByStartsAtDesc(String status);
    Optional<EventEntity> findFirstByVenueIdAndStatusOrderByStartsAtDesc(UUID venueId, String status);
    List<EventEntity> findByVenueIdOrderByStartsAtDesc(UUID venueId);
    List<EventEntity> findAllByOrderByStartsAtDesc();
}
