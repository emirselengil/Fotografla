package com.fotografla.backend.dashboard.application;

import com.fotografla.backend.event.domain.EventEntity;
import com.fotografla.backend.event.domain.EventRepository;
import com.fotografla.backend.guest.domain.GuestSessionEntity;
import com.fotografla.backend.guest.domain.GuestSessionRepository;
import com.fotografla.backend.media.domain.MediaAssetEntity;
import com.fotografla.backend.media.domain.MediaAssetRepository;
import com.fotografla.backend.venue.domain.VenueEntity;
import com.fotografla.backend.venue.domain.VenueRepository;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class DashboardReadService {

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final MediaAssetRepository mediaAssetRepository;
    private final GuestSessionRepository guestSessionRepository;

    public DashboardReadService(
            EventRepository eventRepository,
            VenueRepository venueRepository,
            MediaAssetRepository mediaAssetRepository,
            GuestSessionRepository guestSessionRepository) {
        this.eventRepository = eventRepository;
        this.venueRepository = venueRepository;
        this.mediaAssetRepository = mediaAssetRepository;
        this.guestSessionRepository = guestSessionRepository;
    }

    public EventSummaryResponse eventSummary(UUID eventId) {
        EventEntity event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Etkinlik bulunamadi."));

        VenueEntity venue = venueRepository.findById(event.getVenueId())
                .orElseThrow(() -> new IllegalArgumentException("Salon bulunamadi."));

        List<GuestSessionEntity> sessions = guestSessionRepository.findByEventIdOrderByJoinedAtAsc(eventId);

        return new EventSummaryResponse(
                event.getId(),
                event.getTitle(),
                event.getStartsAt().toLocalDate().toString(),
                event.getStartsAt().toLocalTime().toString(),
                event.getEndsAt().toLocalTime().toString(),
                event.getPaxPlanned(),
                event.getStatus().toUpperCase(Locale.ROOT),
            "approved".equalsIgnoreCase(event.getPaymentStatus()),
                venue.getId(),
                venue.getName(),
                venue.getCity(),
                venue.getMonthlyPlanCode(),
                sessions.size());
    }

    public List<VenueEventListItemResponse> venueEvents(UUID venueId) {
        return eventRepository.findByVenueIdOrderByStartsAtDesc(venueId)
                .stream()
                .map(event -> new VenueEventListItemResponse(
                        event.getId(),
                        event.getTitle(),
                        event.getStartsAt(),
                        event.getEndsAt(),
                        event.getPaxPlanned(),
                        event.getStatus().toUpperCase(Locale.ROOT),
                    event.getAccessCode(),
                        event.getPackageName(),
                        "APPROVED".equalsIgnoreCase(event.getPaymentStatus())
                ))
                .toList();
    }

    public List<EventMediaListItemResponse> eventMedia(UUID eventId) {
        List<MediaAssetEntity> media = mediaAssetRepository.findByEventIdOrderByUploadedAtDesc(eventId);
        Map<UUID, GuestSessionEntity> sessionsById = new HashMap<>();
        for (GuestSessionEntity session : guestSessionRepository.findByEventIdOrderByJoinedAtAsc(eventId)) {
            sessionsById.put(session.getId(), session);
        }

        DateTimeFormatter hhmm = DateTimeFormatter.ofPattern("HH:mm");

        return media.stream().map(item -> {
            String uploaderName = "Anonim Misafir";
            if (item.getUploadedByGuestSessionId() != null) {
                GuestSessionEntity session = sessionsById.get(item.getUploadedByGuestSessionId());
                if (session != null && session.getGuestDisplayName() != null && !session.getGuestDisplayName().isBlank()) {
                    uploaderName = session.getGuestDisplayName();
                }
            } else if (item.getUploadedByUserId() != null) {
                uploaderName = "Kullanici";
            }

            return new EventMediaListItemResponse(
                    item.getId(),
                    item.getMediaType().toUpperCase(Locale.ROOT),
                    uploaderName,
                    item.getUploadedAt().atZoneSameInstant(ZoneOffset.UTC).format(hhmm),
                    "/api/v1/media/object?objectKey=" + URLEncoder.encode(item.getObjectKey(), StandardCharsets.UTF_8));
        }).toList();
    }

    public List<EventParticipantListItemResponse> eventParticipants(UUID eventId) {
        List<GuestSessionEntity> sessions = guestSessionRepository.findByEventIdOrderByJoinedAtAsc(eventId);
        List<MediaAssetEntity> media = mediaAssetRepository.findByEventIdOrderByUploadedAtDesc(eventId);

        Map<UUID, Counts> countsBySessionId = new HashMap<>();
        for (MediaAssetEntity item : media) {
            UUID sessionId = item.getUploadedByGuestSessionId();
            if (sessionId == null) {
                continue;
            }
            Counts counts = countsBySessionId.computeIfAbsent(sessionId, ignored -> new Counts());
            if ("photo".equalsIgnoreCase(item.getMediaType())) {
                counts.photos += 1;
            } else if ("video".equalsIgnoreCase(item.getMediaType())) {
                counts.videos += 1;
            }
        }

        DateTimeFormatter hhmm = DateTimeFormatter.ofPattern("HH:mm");
        List<EventParticipantListItemResponse> response = new ArrayList<>();

        for (GuestSessionEntity session : sessions) {
            Counts counts = countsBySessionId.getOrDefault(session.getId(), new Counts());
            boolean isAnonymous = Boolean.TRUE.equals(session.getIsAnonymous()) || session.getGuestDisplayName() == null || session.getGuestDisplayName().isBlank();
            String displayName = isAnonymous ? "Anonim Misafir" : session.getGuestDisplayName();

            response.add(new EventParticipantListItemResponse(
                    session.getId(),
                    displayName,
                    isAnonymous,
                    session.getJoinedAt().atZoneSameInstant(ZoneOffset.UTC).format(hhmm),
                    counts.photos,
                    counts.videos));
        }

        return response;
    }

    private static final class Counts {
        int photos;
        int videos;
    }

    public record EventSummaryResponse(
            UUID eventId,
            String eventName,
            String eventDate,
            String startTime,
            String endTime,
            Integer participantCount,
            String status,
            boolean paymentApproved,
            UUID venueId,
            String venueName,
            String venueCity,
            String venuePlan,
            int activeUsers) {
    }

    public record VenueEventListItemResponse(
            UUID id,
            String title,
            java.time.OffsetDateTime startsAt,
            java.time.OffsetDateTime endsAt,
            Integer pax,
            String status,
                String accessCode,
            String packageName,
            boolean paymentApproved) {
    }

    public record EventMediaListItemResponse(
            UUID id,
            String type,
            String uploaderName,
            String uploadedAt,
            String url) {
    }

    public record EventParticipantListItemResponse(
            UUID id,
            String name,
            boolean isAnonymous,
            String joinedAt,
            int uploadedPhotos,
            int uploadedVideos) {
    }
}
