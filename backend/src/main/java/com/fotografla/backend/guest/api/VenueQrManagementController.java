package com.fotografla.backend.guest.api;

import com.fotografla.backend.guest.application.VenueQrManagementService;
import com.fotografla.backend.guest.application.VenueQrPrintService;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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
    private final VenueQrPrintService venueQrPrintService;

    public VenueQrManagementController(
            VenueQrManagementService venueQrManagementService,
            VenueQrPrintService venueQrPrintService) {
        this.venueQrManagementService = venueQrManagementService;
        this.venueQrPrintService = venueQrPrintService;
    }

    @GetMapping
    public VenueQrManagementService.VenueQrDashboardResponse dashboard(@PathVariable UUID venueId) {
        return venueQrManagementService.dashboard(venueId);
    }

    @PostMapping("/generate")
    public VenueQrManagementService.VenueQrDashboardResponse generate(@PathVariable UUID venueId, Authentication authentication) {
        return venueQrManagementService.generate(venueId, currentUserId(authentication));
    }

    @GetMapping(value = "/png", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> qrPng(@PathVariable UUID venueId) throws IOException {
        byte[] png = venueQrPrintService.renderQrPng(venueId);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"fotografla-qr.png\"")
                .body(png);
    }

    @GetMapping(value = "/card.png", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> qrCardPng(@PathVariable UUID venueId) throws IOException {
        byte[] png = venueQrPrintService.renderQrCardPng(venueId);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"fotografla-salon-qr-kart.png\"")
                .body(png);
    }

    @GetMapping(value = "/print", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> qrPrintPdf(@PathVariable UUID venueId) throws IOException {
        byte[] pdf = venueQrPrintService.renderPrintPdf(venueId);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"fotografla-salon-qr.pdf\"")
                .body(pdf);
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
