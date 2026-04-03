package com.fotografla.backend.event.api;

import com.fotografla.backend.event.application.EventService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping
    public ResponseEntity<EventService.EventResponse> create(
            @Valid @RequestBody CreateEventRequest request,
            Authentication authentication) {
        UUID actorUserId = UUID.fromString((String) authentication.getPrincipal());

        EventService.EventResponse response = eventService.create(
                new EventService.CreateEventCommand(
                        request.venueId(),
                        request.coupleId(),
                        request.title(),
                        request.eventType(),
                        request.startsAt(),
                        request.endsAt(),
                        request.paxPlanned(),
                        request.packageName(),
                        request.status(),
                        request.contactName(),
                        request.contactPhoneE164(),
                        request.contactEmail(),
                        request.notes(),
                        request.photographerNeeded()),
                actorUserId);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public List<EventService.EventResponse> list(@RequestParam(required = false) UUID venueId) {
        return eventService.list(venueId);
    }

    @GetMapping("/active")
    public Map<String, Object> getActiveEvent() {
        EventService.EventResponse activeEvent = eventService.findActive();

        if (activeEvent == null) {
            return Map.of(
                    "found", false,
                    "timestamp", OffsetDateTime.now().toString());
        }

        return Map.of(
                "found", true,
                "event", Map.of(
                "id", activeEvent.id(),
                "title", activeEvent.title(),
                "startsAt", activeEvent.startsAt(),
                "endsAt", activeEvent.endsAt(),
                "paxPlanned", activeEvent.paxPlanned(),
                "status", activeEvent.status()),
                "timestamp", OffsetDateTime.now().toString());
    }

    @PatchMapping("/{eventId}/status")
    public EventService.EventResponse updateStatus(
            @PathVariable UUID eventId,
            @Valid @RequestBody UpdateStatusRequest request) {
        return eventService.updateStatus(eventId, request.status());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    public record CreateEventRequest(
            @NotNull UUID venueId,
            @NotNull UUID coupleId,
            @NotBlank String title,
            @NotBlank String eventType,
            @NotNull OffsetDateTime startsAt,
            @NotNull OffsetDateTime endsAt,
            @NotNull Integer paxPlanned,
            String packageName,
            String status,
            String contactName,
            String contactPhoneE164,
            String contactEmail,
            String notes,
            Boolean photographerNeeded) {
    }

    public record UpdateStatusRequest(@NotBlank String status) {
    }
}
