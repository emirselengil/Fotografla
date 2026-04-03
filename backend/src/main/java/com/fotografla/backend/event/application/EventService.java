package com.fotografla.backend.event.application;

import com.fotografla.backend.event.domain.EventEntity;
import com.fotografla.backend.event.domain.EventRepository;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class EventService {

    private static final List<String> ALLOWED_STATUS = List.of("planned", "active", "completed", "cancelled");

    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public EventResponse create(CreateEventCommand command, UUID actorUserId) {
        validateTimeline(command.startsAt(), command.endsAt());
        validatePax(command.paxPlanned());

        EventEntity entity = new EventEntity();
        entity.setVenueId(command.venueId());
        entity.setCoupleId(command.coupleId());
        entity.setTitle(command.title().trim());
        entity.setEventType(command.eventType().trim().toLowerCase(Locale.ROOT));
        entity.setStartsAt(command.startsAt());
        entity.setEndsAt(command.endsAt());
        entity.setPaxPlanned(command.paxPlanned());
        entity.setPackageName(command.packageName());
        entity.setStatus(command.status() == null ? "planned" : normalizeStatus(command.status()));
        entity.setPaymentStatus("pending");
        entity.setContactName(command.contactName());
        entity.setContactPhoneE164(command.contactPhoneE164());
        entity.setContactEmail(command.contactEmail());
        entity.setNotes(command.notes());
        entity.setPhotographerNeeded(Boolean.TRUE.equals(command.photographerNeeded()));
        entity.setCreatedByUserId(actorUserId);

        EventEntity saved = eventRepository.save(entity);
        return toResponse(saved);
    }

    public List<EventResponse> list(UUID venueId) {
        List<EventEntity> events = venueId == null
                ? eventRepository.findAllByOrderByStartsAtDesc()
                : eventRepository.findByVenueIdOrderByStartsAtDesc(venueId);

        return events.stream().map(this::toResponse).toList();
    }

    public EventResponse updateStatus(UUID eventId, String status) {
        EventEntity event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Etkinlik bulunamadi."));

        event.setStatus(normalizeStatus(status));
        event.setUpdatedAt(OffsetDateTime.now(ZoneOffset.UTC));

        EventEntity saved = eventRepository.save(event);
        return toResponse(saved);
    }

    public EventResponse findActive() {
        EventEntity activeEvent = eventRepository.findFirstByStatusOrderByStartsAtDesc("active")
                .orElse(null);
        if (activeEvent == null) {
            return null;
        }
        return toResponse(activeEvent);
    }

    private String normalizeStatus(String rawStatus) {
        String status = rawStatus == null ? "" : rawStatus.trim().toLowerCase(Locale.ROOT);
        if (!ALLOWED_STATUS.contains(status)) {
            throw new IllegalArgumentException("Gecersiz etkinlik durumu.");
        }
        return status;
    }

    private static void validateTimeline(OffsetDateTime startsAt, OffsetDateTime endsAt) {
        if (startsAt == null || endsAt == null || !endsAt.isAfter(startsAt)) {
            throw new IllegalArgumentException("Etkinlik bitis zamani baslangictan sonra olmalidir.");
        }
    }

    private static void validatePax(Integer paxPlanned) {
        if (paxPlanned == null || paxPlanned < 1 || paxPlanned > 5000) {
            throw new IllegalArgumentException("Kisi sayisi 1 ile 5000 arasinda olmalidir.");
        }
    }

    private EventResponse toResponse(EventEntity event) {
        return new EventResponse(
                event.getId(),
                event.getVenueId(),
                event.getCoupleId(),
                event.getTitle(),
                event.getEventType(),
                event.getStartsAt(),
                event.getEndsAt(),
                event.getPaxPlanned(),
                event.getPackageName(),
                event.getStatus(),
                event.getPaymentStatus(),
                event.getContactName(),
                event.getContactPhoneE164(),
                event.getContactEmail(),
                event.getNotes(),
                event.getPhotographerNeeded(),
                event.getCreatedAt(),
                event.getUpdatedAt());
    }

    public record CreateEventCommand(
            UUID venueId,
            UUID coupleId,
            String title,
            String eventType,
            OffsetDateTime startsAt,
            OffsetDateTime endsAt,
            Integer paxPlanned,
            String packageName,
            String status,
            String contactName,
            String contactPhoneE164,
            String contactEmail,
            String notes,
            Boolean photographerNeeded) {
    }

    public record EventResponse(
            UUID id,
            UUID venueId,
            UUID coupleId,
            String title,
            String eventType,
            OffsetDateTime startsAt,
            OffsetDateTime endsAt,
            Integer paxPlanned,
            String packageName,
            String status,
            String paymentStatus,
            String contactName,
            String contactPhoneE164,
            String contactEmail,
            String notes,
            Boolean photographerNeeded,
            OffsetDateTime createdAt,
            OffsetDateTime updatedAt) {
    }
}
