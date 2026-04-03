package com.fotografla.backend.media.api;

import com.fotografla.backend.media.application.MediaService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/media")
public class MediaController {

    private final MediaService mediaService;

    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @PostMapping("/presign")
    public MediaService.PresignResponse presign(@Valid @RequestBody PresignRequest request) {
        return mediaService.presign(new MediaService.PresignCommand(
                request.eventId(),
                request.guestSessionId(),
                request.originalFilename(),
                request.mimeType(),
                request.sizeBytes(),
                request.mediaType()));
    }

    @PostMapping("/complete")
    public MediaService.CompleteResponse complete(@Valid @RequestBody CompleteRequest request, Authentication authentication) {
        UUID authenticatedUserId = null;
        if (authentication != null && authentication.getPrincipal() instanceof String principal) {
            try {
                authenticatedUserId = UUID.fromString(principal);
            } catch (IllegalArgumentException ignored) {
                authenticatedUserId = null;
            }
        }

        return mediaService.complete(new MediaService.CompleteCommand(
                request.eventId(),
                request.guestSessionId(),
                authenticatedUserId,
                request.objectKey(),
                request.originalFilename(),
                request.mimeType(),
                request.sizeBytes(),
                request.mediaType(),
                request.widthPx(),
                request.heightPx(),
                request.durationSeconds(),
                request.checksumSha256(),
                request.capturedAt()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    public record PresignRequest(
            @NotNull UUID eventId,
            UUID guestSessionId,
            @NotBlank String originalFilename,
            @NotBlank String mimeType,
            @NotNull Long sizeBytes,
            @NotBlank String mediaType) {
    }

    public record CompleteRequest(
            @NotNull UUID eventId,
            UUID guestSessionId,
            @NotBlank String objectKey,
            String originalFilename,
            @NotBlank String mimeType,
            @NotNull Long sizeBytes,
            @NotBlank String mediaType,
            Integer widthPx,
            Integer heightPx,
            BigDecimal durationSeconds,
            String checksumSha256,
            java.time.OffsetDateTime capturedAt) {
    }
}
