package com.fotografla.backend.event.domain;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<EventEntity, UUID> {
    Optional<EventEntity> findFirstByStatusOrderByStartsAtDesc(String status);
    Optional<EventEntity> findFirstByVenueIdAndStatusOrderByStartsAtDesc(UUID venueId, String status);
    Optional<EventEntity> findFirstByCoupleIdOrderByStartsAtDesc(UUID coupleId);
    Optional<EventEntity> findByAccessCode(String accessCode);
    boolean existsByAccessCode(String accessCode);
    List<EventEntity> findByVenueIdOrderByStartsAtDesc(UUID venueId);
    List<EventEntity> findAllByOrderByStartsAtDesc();
    List<EventEntity> findByStatusAndStartsAtLessThanEqual(String status, OffsetDateTime startsAt);
    List<EventEntity> findByStatusAndEndsAtLessThanEqual(String status, OffsetDateTime endsAt);
}
