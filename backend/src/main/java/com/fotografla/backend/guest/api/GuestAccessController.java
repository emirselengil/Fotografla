package com.fotografla.backend.guest.api;

import com.fotografla.backend.guest.application.GuestAccessService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/guest")
public class GuestAccessController {

    private final GuestAccessService guestAccessService;

    public GuestAccessController(GuestAccessService guestAccessService) {
        this.guestAccessService = guestAccessService;
    }

    @GetMapping("/resolve")
    public GuestAccessService.QrResolveResponse resolve(@RequestParam("code") String code) {
        return guestAccessService.resolve(code);
    }

    @PostMapping("/sessions")
    public GuestAccessService.GuestSessionResponse createSession(@Valid @RequestBody CreateGuestSessionRequest request) {
        return guestAccessService.createSession(new GuestAccessService.CreateGuestSessionCommand(
                request.qrCodeValue(),
                request.eventId(),
                request.guestDisplayName(),
                request.isAnonymous(),
                request.deviceFingerprintHash(),
                request.ipHash()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    public record CreateGuestSessionRequest(
            @NotBlank String qrCodeValue,
            UUID eventId,
            String guestDisplayName,
            Boolean isAnonymous,
            String deviceFingerprintHash,
            String ipHash) {
    }
}
