package com.fotografla.backend.profile.api;

import com.fotografla.backend.profile.application.ProfileService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/users/me")
    public ProfileService.UserProfileResponse currentUser(Authentication authentication) {
        return profileService.currentUser(currentUserId(authentication));
    }

    @PatchMapping("/users/me")
    public ProfileService.UserProfileResponse updateCurrentUser(
            Authentication authentication,
            @Valid @RequestBody UpdateCurrentUserRequest request) {
        return profileService.updateCurrentUser(
                currentUserId(authentication),
                new ProfileService.UpdateCurrentUserCommand(
                        request.fullName(),
                        request.email(),
                        request.phoneE164(),
                        request.password()));
    }

    @GetMapping("/venues/{venueId}/profile")
    public ProfileService.SalonProfileResponse salonProfile(@PathVariable UUID venueId) {
        return profileService.salonProfile(venueId);
    }

    @PatchMapping("/venues/{venueId}/profile")
    public ProfileService.SalonProfileResponse updateSalonProfile(
            @PathVariable UUID venueId,
            @Valid @RequestBody UpdateSalonProfileRequest request) {
        return profileService.updateSalonProfile(
                venueId,
                new ProfileService.UpdateSalonProfileCommand(
                        request.fullName(),
                        request.email(),
                        request.phoneE164(),
                        request.password(),
                        request.salonName(),
                        request.city(),
                        request.monthlyPlanCode()));
    }

    @GetMapping("/couples/me")
    public ProfileService.CoupleProfileResponse coupleProfile(Authentication authentication) {
        return profileService.coupleProfile(currentUserId(authentication));
    }

    @PatchMapping("/couples/me")
    public ProfileService.CoupleProfileResponse updateCoupleProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateCoupleProfileRequest request) {
        return profileService.updateCoupleProfile(
                currentUserId(authentication),
                new ProfileService.UpdateCoupleProfileCommand(
                        request.fullName(),
                        request.email(),
                        request.phoneE164(),
                        request.password(),
                        request.groomName(),
                        request.brideName()));
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

    public record UpdateCurrentUserRequest(
            @NotBlank String fullName,
            @Email @NotBlank String email,
            String phoneE164,
            String password) {
    }

    public record UpdateSalonProfileRequest(
            @NotBlank String fullName,
            @Email @NotBlank String email,
            String phoneE164,
            String password,
            @NotBlank String salonName,
            @NotBlank String city,
            @NotBlank String monthlyPlanCode) {
    }

    public record UpdateCoupleProfileRequest(
            @NotBlank String fullName,
            @Email @NotBlank String email,
            String phoneE164,
            String password,
            @NotBlank String groomName,
            @NotBlank String brideName) {
    }
}
