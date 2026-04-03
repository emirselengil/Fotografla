package com.fotografla.backend.guest.domain;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VenueQrCodeRepository extends JpaRepository<VenueQrCodeEntity, UUID> {

  Optional<VenueQrCodeEntity> findFirstByVenueIdAndStatusOrderByCreatedAtDesc(UUID venueId, String status);

    @Query("""
            select q from VenueQrCodeEntity q
            where lower(q.codeValue) = lower(:codeValue)
              and q.status = 'active'
              and q.revokedAt is null
              and q.validFrom <= :now
              and (q.validUntil is null or q.validUntil >= :now)
            order by q.validFrom desc
            """)
    Optional<VenueQrCodeEntity> findActiveByCodeValue(@Param("codeValue") String codeValue, @Param("now") OffsetDateTime now);
}
