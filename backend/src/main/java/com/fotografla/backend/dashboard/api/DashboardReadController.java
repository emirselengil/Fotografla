package com.fotografla.backend.dashboard.api;

import com.fotografla.backend.dashboard.application.DashboardReadService;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1")
public class DashboardReadController {

    private final DashboardReadService dashboardReadService;

    public DashboardReadController(DashboardReadService dashboardReadService) {
        this.dashboardReadService = dashboardReadService;
    }

    @GetMapping("/events/{eventId}/summary")
    public DashboardReadService.EventSummaryResponse eventSummary(@PathVariable UUID eventId) {
        return dashboardReadService.eventSummary(eventId);
    }

    @GetMapping("/venues/{venueId}/events")
    public List<DashboardReadService.VenueEventListItemResponse> venueEvents(@PathVariable UUID venueId) {
        return dashboardReadService.venueEvents(venueId);
    }

    @GetMapping("/events/{eventId}/media")
    public List<DashboardReadService.EventMediaListItemResponse> eventMedia(@PathVariable UUID eventId) {
        return dashboardReadService.eventMedia(eventId);
    }

    @GetMapping("/events/{eventId}/participants")
    public List<DashboardReadService.EventParticipantListItemResponse> eventParticipants(@PathVariable UUID eventId) {
        return dashboardReadService.eventParticipants(eventId);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }
}
