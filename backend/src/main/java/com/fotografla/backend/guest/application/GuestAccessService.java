package com.fotografla.backend.guest.application;

import com.fotografla.backend.event.domain.EventEntity;
import com.fotografla.backend.event.domain.EventRepository;
import com.fotografla.backend.guest.domain.GuestSessionEntity;
import com.fotografla.backend.guest.domain.GuestSessionRepository;
import com.fotografla.backend.guest.domain.VenueQrCodeEntity;
import com.fotografla.backend.guest.domain.VenueQrCodeRepository;
import com.fotografla.backend.venue.domain.VenueEntity;
import com.fotografla.backend.venue.domain.VenueRepository;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class GuestAccessService {

    private final VenueQrCodeRepository venueQrCodeRepository;
    private final GuestSessionRepository guestSessionRepository;
    private final EventRepository eventRepository;
        private final VenueRepository venueRepository;

    public GuestAccessService(
            VenueQrCodeRepository venueQrCodeRepository,
            GuestSessionRepository guestSessionRepository,
                        EventRepository eventRepository,
                        VenueRepository venueRepository) {
        this.venueQrCodeRepository = venueQrCodeRepository;
        this.guestSessionRepository = guestSessionRepository;
        this.eventRepository = eventRepository;
                this.venueRepository = venueRepository;
    }

    public QrResolveResponse resolve(String codeValue) {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

        VenueQrCodeEntity qr = venueQrCodeRepository.findActiveByCodeValue(codeValue, now)
                .orElseThrow(() -> new IllegalArgumentException("Gecerli QR kod bulunamadi."));

        VenueEntity venue = venueRepository.findById(qr.getVenueId())
                .orElseThrow(() -> new IllegalArgumentException("Salon bulunamadi."));

        EventEntity activeEvent = eventRepository
                .findFirstByVenueIdAndStatusOrderByStartsAtDesc(qr.getVenueId(), "active")
                .orElse(null);

        return new QrResolveResponse(
                qr.getId(),
                qr.getVenueId(),
                venue.getName(),
                qr.getCodeValue(),
                activeEvent == null ? null : activeEvent.getId(),
                activeEvent == null ? null : activeEvent.getTitle(),
                activeEvent != null);
    }

    public GuestSessionResponse createSession(CreateGuestSessionCommand command) {
        QrResolveResponse resolve = resolve(command.qrCodeValue());

        UUID eventId = command.eventId();
        if (eventId == null && resolve.activeEventId() != null) {
            eventId = resolve.activeEventId();
        }

        GuestSessionEntity session = new GuestSessionEntity();
        session.setVenueId(resolve.venueId());
        session.setEventId(eventId);
        session.setQrCodeId(resolve.qrCodeId());
        session.setGuestDisplayName(command.guestDisplayName());
        session.setIsAnonymous(Boolean.TRUE.equals(command.isAnonymous()));
        session.setDeviceFingerprintHash(command.deviceFingerprintHash());
        session.setIpHash(command.ipHash());

        GuestSessionEntity saved = guestSessionRepository.save(session);

        return new GuestSessionResponse(
                saved.getId(),
                saved.getVenueId(),
                saved.getEventId(),
                saved.getQrCodeId(),
                saved.getGuestDisplayName(),
                saved.getIsAnonymous(),
                saved.getJoinedAt(),
                saved.getLastSeenAt());
    }

    public record CreateGuestSessionCommand(
            String qrCodeValue,
            UUID eventId,
            String guestDisplayName,
            Boolean isAnonymous,
            String deviceFingerprintHash,
            String ipHash) {
    }

    public record QrResolveResponse(
            UUID qrCodeId,
            UUID venueId,
            String venueName,
            String codeValue,
            UUID activeEventId,
            String activeEventTitle,
            boolean hasActiveEvent) {
    }

    public record GuestSessionResponse(
            UUID id,
            UUID venueId,
            UUID eventId,
            UUID qrCodeId,
            String guestDisplayName,
            Boolean isAnonymous,
            OffsetDateTime joinedAt,
            OffsetDateTime lastSeenAt) {
    }
}
