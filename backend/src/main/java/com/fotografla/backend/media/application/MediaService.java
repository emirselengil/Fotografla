package com.fotografla.backend.media.application;

import com.fotografla.backend.event.domain.EventEntity;
import com.fotografla.backend.event.domain.EventRepository;
import com.fotografla.backend.guest.domain.GuestSessionEntity;
import com.fotografla.backend.guest.domain.GuestSessionRepository;
import com.fotografla.backend.media.domain.MediaAssetEntity;
import com.fotografla.backend.media.domain.MediaAssetRepository;
import com.fotografla.backend.media.domain.MediaUploadObjectEntity;
import com.fotografla.backend.media.domain.MediaUploadObjectRepository;
import java.io.InputStream;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class MediaService {

    private static final List<String> ALLOWED_MEDIA_TYPES = List.of("photo", "video");

    private final EventRepository eventRepository;
    private final GuestSessionRepository guestSessionRepository;
    private final MediaAssetRepository mediaAssetRepository;
    private final MediaUploadObjectRepository mediaUploadObjectRepository;

    public MediaService(
            EventRepository eventRepository,
            GuestSessionRepository guestSessionRepository,
            MediaAssetRepository mediaAssetRepository,
            MediaUploadObjectRepository mediaUploadObjectRepository) {
        this.eventRepository = eventRepository;
        this.guestSessionRepository = guestSessionRepository;
        this.mediaAssetRepository = mediaAssetRepository;
        this.mediaUploadObjectRepository = mediaUploadObjectRepository;
    }

    public PresignResponse presign(PresignCommand command) {
        EventEntity event = eventRepository.findById(command.eventId())
                .orElseThrow(() -> new IllegalArgumentException("Etkinlik bulunamadi."));

        validateMediaType(command.mediaType());
        validateSize(command.sizeBytes());

        if (command.guestSessionId() != null) {
            GuestSessionEntity guestSession = guestSessionRepository.findById(command.guestSessionId())
                    .orElseThrow(() -> new IllegalArgumentException("Misafir oturumu bulunamadi."));
            if (!event.getId().equals(guestSession.getEventId())) {
                throw new IllegalArgumentException("Misafir oturumu bu etkinlige ait degil.");
            }
        }

        String dateSegment = OffsetDateTime.now(ZoneOffset.UTC).format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        String safeFile = sanitizeFilename(command.originalFilename());
        String objectKey = "events/" + event.getId() + "/" + dateSegment + "/" + UUID.randomUUID() + "-" + safeFile;
        String uploadUrl = "/api/v1/media/upload?objectKey=" + URLEncoder.encode(objectKey, StandardCharsets.UTF_8);

        return new PresignResponse(
                objectKey,
                "PUT",
                uploadUrl,
                OffsetDateTime.now(ZoneOffset.UTC).plusMinutes(15),
                "db-temp");
    }

    public void uploadObject(String objectKey, InputStream inputStream) {
        try {
            byte[] bytes = inputStream.readAllBytes();

            MediaUploadObjectEntity uploadObject = new MediaUploadObjectEntity();
            uploadObject.setObjectKey(objectKey);
            uploadObject.setMimeType("application/octet-stream");
            uploadObject.setSizeBytes((long) bytes.length);
            uploadObject.setContentBytes(bytes);

            mediaUploadObjectRepository.save(uploadObject);
        } catch (java.io.IOException exception) {
            throw new IllegalArgumentException("Dosya veritabani gecici alanina yazilamadi.", exception);
        }
    }

    public MediaObjectResponse readObject(String objectKey) {
        return mediaAssetRepository.findFirstByObjectKeyOrderByUploadedAtDesc(objectKey)
                .map(asset -> {
                    if (asset.getContentBytes() != null && asset.getContentBytes().length > 0) {
                        return new MediaObjectResponse(asset.getContentBytes(), asset.getMimeType());
                    }

                    throw new IllegalArgumentException("Medya icerigi veritabaninda bulunamadi.");
                })
                .orElseThrow(() -> new IllegalArgumentException("Medya kaydi bulunamadi."));
    }

    public CompleteResponse complete(CompleteCommand command) {
        EventEntity event = eventRepository.findById(command.eventId())
                .orElseThrow(() -> new IllegalArgumentException("Etkinlik bulunamadi."));

        validateMediaType(command.mediaType());
        validateSize(command.sizeBytes());

        UUID resolvedGuestSessionId = null;
        UUID resolvedUserId = command.uploadedByUserId();

        if (command.guestSessionId() != null) {
            GuestSessionEntity guestSession = guestSessionRepository.findById(command.guestSessionId())
                    .orElseThrow(() -> new IllegalArgumentException("Misafir oturumu bulunamadi."));
            if (!event.getId().equals(guestSession.getEventId())) {
                throw new IllegalArgumentException("Misafir oturumu bu etkinlige ait degil.");
            }
            resolvedGuestSessionId = guestSession.getId();
        }

        if (resolvedGuestSessionId == null && resolvedUserId == null) {
            throw new IllegalArgumentException("Yukleyen bilgisi gerekli (guestSessionId veya user). ");
        }

        MediaUploadObjectEntity uploadedObject = mediaUploadObjectRepository.findById(command.objectKey())
            .orElseThrow(() -> new IllegalArgumentException("Dosya yuklemesi bulunamadi. Lutfen tekrar deneyin."));

        MediaAssetEntity entity = new MediaAssetEntity();
        entity.setVenueId(event.getVenueId());
        entity.setEventId(event.getId());
        entity.setUploadedByGuestSessionId(resolvedGuestSessionId);
        entity.setUploadedByUserId(resolvedUserId);
        entity.setMediaType(command.mediaType().trim().toLowerCase(Locale.ROOT));
        entity.setStorageProvider("db-inline");
        entity.setObjectKey(command.objectKey());
        entity.setOriginalFilename(command.originalFilename());
        entity.setMimeType(command.mimeType());
        entity.setContentBytes(uploadedObject.getContentBytes());
        entity.setSizeBytes(command.sizeBytes());
        entity.setWidthPx(command.widthPx());
        entity.setHeightPx(command.heightPx());
        entity.setDurationSeconds(command.durationSeconds());
        entity.setChecksumSha256(command.checksumSha256());
        entity.setIsPublic(true);
        entity.setModerationStatus("approved");
        entity.setCapturedAt(command.capturedAt());

        MediaAssetEntity saved = mediaAssetRepository.save(entity);
        mediaUploadObjectRepository.deleteById(command.objectKey());

        return new CompleteResponse(
                saved.getId(),
                saved.getEventId(),
                saved.getVenueId(),
                saved.getObjectKey(),
                saved.getMediaType(),
                saved.getUploadedAt());
    }

    private static void validateMediaType(String mediaType) {
        String normalized = mediaType == null ? "" : mediaType.trim().toLowerCase(Locale.ROOT);
        if (!ALLOWED_MEDIA_TYPES.contains(normalized)) {
            throw new IllegalArgumentException("Gecersiz medya tipi.");
        }
    }

    private static void validateSize(Long sizeBytes) {
        if (sizeBytes == null || sizeBytes <= 0 || sizeBytes > 1024L * 1024L * 1024L) {
            throw new IllegalArgumentException("Dosya boyutu gecersiz.");
        }
    }

    private static String sanitizeFilename(String filename) {
        if (filename == null || filename.isBlank()) {
            return "upload.bin";
        }
        String cleaned = filename.trim().replaceAll("[^a-zA-Z0-9._-]", "_");
        return cleaned.length() > 120 ? cleaned.substring(cleaned.length() - 120) : cleaned;
    }

    public record PresignCommand(
            UUID eventId,
            UUID guestSessionId,
            String originalFilename,
            String mimeType,
            Long sizeBytes,
            String mediaType) {
    }

    public record PresignResponse(
            String objectKey,
            String method,
            String uploadUrl,
            OffsetDateTime expiresAt,
            String storageProvider) {
    }

    public record CompleteCommand(
            UUID eventId,
            UUID guestSessionId,
            UUID uploadedByUserId,
            String objectKey,
            String originalFilename,
            String mimeType,
            Long sizeBytes,
            String mediaType,
            Integer widthPx,
            Integer heightPx,
            BigDecimal durationSeconds,
            String checksumSha256,
            OffsetDateTime capturedAt) {
    }

    public record CompleteResponse(
            UUID mediaAssetId,
            UUID eventId,
            UUID venueId,
            String objectKey,
            String mediaType,
            OffsetDateTime uploadedAt) {
    }

    public record MediaObjectResponse(byte[] bytes, String contentType) {
    }
}
