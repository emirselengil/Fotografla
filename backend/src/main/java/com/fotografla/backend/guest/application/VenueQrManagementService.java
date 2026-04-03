package com.fotografla.backend.guest.application;

import com.fotografla.backend.guest.domain.GuestSessionRepository;
import com.fotografla.backend.guest.domain.VenueQrCodeEntity;
import com.fotografla.backend.guest.domain.VenueQrCodeRepository;
import com.fotografla.backend.media.domain.MediaAssetRepository;
import com.fotografla.backend.venue.domain.VenueEntity;
import com.fotografla.backend.venue.domain.VenueRepository;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class VenueQrManagementService {

    private final VenueRepository venueRepository;
    private final VenueQrCodeRepository venueQrCodeRepository;
    private final GuestSessionRepository guestSessionRepository;
    private final MediaAssetRepository mediaAssetRepository;

    public VenueQrManagementService(
            VenueRepository venueRepository,
            VenueQrCodeRepository venueQrCodeRepository,
            GuestSessionRepository guestSessionRepository,
            MediaAssetRepository mediaAssetRepository) {
        this.venueRepository = venueRepository;
        this.venueQrCodeRepository = venueQrCodeRepository;
        this.guestSessionRepository = guestSessionRepository;
        this.mediaAssetRepository = mediaAssetRepository;
    }

    public VenueQrDashboardResponse dashboard(UUID venueId) {
        VenueEntity venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new IllegalArgumentException("Salon bulunamadi."));

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        OffsetDateTime dayStart = now.toLocalDate().atStartOfDay().atOffset(ZoneOffset.UTC);

        VenueQrCodeEntity activeQr = venueQrCodeRepository.findFirstByVenueIdAndStatusOrderByCreatedAtDesc(venueId, "active")
                .orElse(null);

        long totalScans = guestSessionRepository.countByVenueId(venueId);
        long scansToday = guestSessionRepository.countByVenueIdAndJoinedAtAfter(venueId, dayStart);
        long mediaTotal = mediaAssetRepository.countByVenueId(venueId);
        long albums = mediaAssetRepository.countDistinctEventCountByVenueId(venueId);
        long usageRate = totalScans == 0 ? 0 : Math.min(100, Math.round((mediaTotal * 100.0d) / totalScans));

        return new VenueQrDashboardResponse(
                venue.getId(),
                venue.getName(),
                activeQr == null ? null : activeQr.getCodeValue(),
                activeQr != null,
                totalScans,
                scansToday,
                albums,
                usageRate,
                mediaTotal);
    }

    public VenueQrDashboardResponse generate(UUID venueId, UUID actorUserId) {
        venueRepository.findById(venueId)
                .orElseThrow(() -> new IllegalArgumentException("Salon bulunamadi."));

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

        venueQrCodeRepository.findFirstByVenueIdAndStatusOrderByCreatedAtDesc(venueId, "active")
                .ifPresent(existing -> {
                    existing.setStatus("revoked");
                    existing.setRevokedAt(now);
                    existing.setRevokedReason("Regenerated");
                    venueQrCodeRepository.save(existing);
                });

        VenueQrCodeEntity qr = new VenueQrCodeEntity();
        qr.setVenueId(venueId);
        qr.setCodeValue("venue-" + venueId.toString().substring(0, 8) + "-" + UUID.randomUUID().toString().substring(0, 8));
        qr.setStatus("active");
        qr.setValidFrom(now);
        qr.setValidUntil(null);
        qr.setRevokedAt(null);
        qr.setRevokedReason(null);
        qr.setCreatedByUserId(actorUserId);

        venueQrCodeRepository.save(qr);

        return dashboard(venueId);
    }

    public record VenueQrDashboardResponse(
            UUID venueId,
            String venueName,
            String codeValue,
            boolean generated,
            long totalScans,
            long scansToday,
            long albumCount,
            long usageRatePercent,
            long mediaCount) {
    }
}
