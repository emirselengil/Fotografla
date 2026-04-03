package com.fotografla.backend.media.api;

import com.fotografla.backend.media.application.MediaService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.GetMapping;

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

    @PutMapping(value = "/upload", consumes = MediaType.ALL_VALUE)
    public ResponseEntity<Void> upload(
            @RequestParam("objectKey") String objectKey,
            HttpServletRequest request) throws IOException {
        mediaService.uploadObject(objectKey, request.getInputStream());
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @GetMapping("/object")
    public ResponseEntity<byte[]> object(@RequestParam("objectKey") String objectKey) {
        MediaService.MediaObjectResponse response = mediaService.readObject(objectKey);
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;

        try {
            mediaType = MediaType.parseMediaType(response.contentType());
        } catch (IllegalArgumentException ignored) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(response.bytes());
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
