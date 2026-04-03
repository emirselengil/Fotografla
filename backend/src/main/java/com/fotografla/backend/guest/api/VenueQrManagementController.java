package com.fotografla.backend.guest.api;

import com.fotografla.backend.guest.application.VenueQrManagementService;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/venues/{venueId}/qr")
public class VenueQrManagementController {

    private final VenueQrManagementService venueQrManagementService;

    public VenueQrManagementController(VenueQrManagementService venueQrManagementService) {
        this.venueQrManagementService = venueQrManagementService;
    }

    @GetMapping
    public VenueQrManagementService.VenueQrDashboardResponse dashboard(@PathVariable UUID venueId) {
        return venueQrManagementService.dashboard(venueId);
    }

    @PostMapping("/generate")
    public VenueQrManagementService.VenueQrDashboardResponse generate(@PathVariable UUID venueId, Authentication authentication) {
        return venueQrManagementService.generate(venueId, currentUserId(authentication));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    private UUID currentUserId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof String principal)) {
            throw new IllegalArgumentException("Gecerli kullanici bulunamadi.");
        }
        return UUID.fromString(principal);
    }
}
