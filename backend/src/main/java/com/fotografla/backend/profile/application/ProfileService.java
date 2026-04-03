package com.fotografla.backend.profile.application;

import com.fotografla.backend.auth.domain.UserEntity;
import com.fotografla.backend.auth.domain.UserRepository;
import com.fotografla.backend.couple.domain.CoupleEntity;
import com.fotografla.backend.couple.domain.CoupleRepository;
import com.fotografla.backend.venue.domain.VenueEntity;
import com.fotografla.backend.venue.domain.VenueRepository;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final VenueRepository venueRepository;
    private final CoupleRepository coupleRepository;
    private final PasswordEncoder passwordEncoder;

    public ProfileService(
            UserRepository userRepository,
            VenueRepository venueRepository,
            CoupleRepository coupleRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.venueRepository = venueRepository;
        this.coupleRepository = coupleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserProfileResponse currentUser(UUID userId) {
        UserEntity user = findUser(userId);
        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhoneE164(),
                user.getRole(),
                Boolean.TRUE.equals(user.getIsActive()));
    }

    public UserProfileResponse updateCurrentUser(UUID userId, UpdateCurrentUserCommand command) {
        UserEntity user = findUser(userId);

        String normalizedEmail = command.email().trim().toLowerCase();
        userRepository.findByEmailIgnoreCase(normalizedEmail)
                .filter(existing -> !existing.getId().equals(userId))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Email zaten baska bir kullanicida kayitli.");
                });

        user.setEmail(normalizedEmail);
        user.setFullName(command.fullName().trim());
        user.setPhoneE164(command.phoneE164());

        if (command.password() != null && !command.password().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(command.password()));
        }

        UserEntity saved = userRepository.save(user);
        return new UserProfileResponse(
                saved.getId(),
                saved.getEmail(),
                saved.getFullName(),
                saved.getPhoneE164(),
                saved.getRole(),
                Boolean.TRUE.equals(saved.getIsActive()));
    }

    public SalonProfileResponse salonProfile(UUID venueId) {
        VenueEntity venue = findVenue(venueId);
        UserEntity owner = findUser(venue.getOwnerUserId());

        return new SalonProfileResponse(
                venue.getId(),
                owner.getFullName(),
                owner.getEmail(),
                owner.getPhoneE164(),
                venue.getName(),
                venue.getCity(),
                venue.getMonthlyPlanCode());
    }

        public SalonProfileResponse salonProfileByOwnerUserId(UUID ownerUserId) {
                VenueEntity venue = venueRepository.findByOwnerUserId(ownerUserId)
                                .orElseThrow(() -> new IllegalArgumentException("Kullaniciya ait salon bulunamadi."));
                return salonProfile(venue.getId());
        }

    public SalonProfileResponse updateSalonProfile(UUID venueId, UpdateSalonProfileCommand command) {
        VenueEntity venue = findVenue(venueId);
        UserEntity owner = findUser(venue.getOwnerUserId());

        String normalizedEmail = command.email().trim().toLowerCase();
        userRepository.findByEmailIgnoreCase(normalizedEmail)
                .filter(existing -> !existing.getId().equals(owner.getId()))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Email zaten baska bir kullanicida kayitli.");
                });

        owner.setFullName(command.fullName().trim());
        owner.setEmail(normalizedEmail);
        owner.setPhoneE164(command.phoneE164());
        if (command.password() != null && !command.password().isBlank()) {
            owner.setPasswordHash(passwordEncoder.encode(command.password()));
        }

        venue.setName(command.salonName().trim());
        venue.setCity(command.city().trim());
        venue.setMonthlyPlanCode(command.monthlyPlanCode().trim().toUpperCase());

        userRepository.save(owner);
        VenueEntity savedVenue = venueRepository.save(venue);

        return new SalonProfileResponse(
                savedVenue.getId(),
                owner.getFullName(),
                owner.getEmail(),
                owner.getPhoneE164(),
                savedVenue.getName(),
                savedVenue.getCity(),
                savedVenue.getMonthlyPlanCode());
    }

    public CoupleProfileResponse coupleProfile(UUID userId) {
        UserEntity user = findUser(userId);
        CoupleEntity couple = coupleRepository.findByPrimaryUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Cift profili bulunamadi."));

        return new CoupleProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneE164(),
                couple.getId(),
                couple.getGroomName(),
                couple.getBrideName(),
                couple.getDisplayName());
    }

    public CoupleProfileResponse updateCoupleProfile(UUID userId, UpdateCoupleProfileCommand command) {
        UserEntity user = findUser(userId);
        CoupleEntity couple = coupleRepository.findByPrimaryUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Cift profili bulunamadi."));

        String normalizedEmail = command.email().trim().toLowerCase();
        userRepository.findByEmailIgnoreCase(normalizedEmail)
                .filter(existing -> !existing.getId().equals(userId))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Email zaten baska bir kullanicida kayitli.");
                });

        user.setFullName(command.fullName().trim());
        user.setEmail(normalizedEmail);
        user.setPhoneE164(command.phoneE164());
        if (command.password() != null && !command.password().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(command.password()));
        }

        couple.setGroomName(command.groomName().trim());
        couple.setBrideName(command.brideName().trim());
        couple.setDisplayName(couple.getGroomName() + " & " + couple.getBrideName());

        userRepository.save(user);
        CoupleEntity savedCouple = coupleRepository.save(couple);

        return new CoupleProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneE164(),
                savedCouple.getId(),
                savedCouple.getGroomName(),
                savedCouple.getBrideName(),
                savedCouple.getDisplayName());
    }

    private UserEntity findUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Kullanici bulunamadi."));
    }

    private VenueEntity findVenue(UUID venueId) {
        return venueRepository.findById(venueId)
                .orElseThrow(() -> new IllegalArgumentException("Salon bulunamadi."));
    }

    public record UpdateCurrentUserCommand(
            String fullName,
            String email,
            String phoneE164,
            String password) {
    }

    public record UpdateSalonProfileCommand(
            String fullName,
            String email,
            String phoneE164,
            String password,
            String salonName,
            String city,
            String monthlyPlanCode) {
    }

    public record UpdateCoupleProfileCommand(
            String fullName,
            String email,
            String phoneE164,
            String password,
            String groomName,
            String brideName) {
    }

    public record UserProfileResponse(
            UUID id,
            String email,
            String fullName,
            String phoneE164,
            String role,
            boolean active) {
    }

    public record SalonProfileResponse(
            UUID venueId,
            String fullName,
            String email,
            String phoneE164,
            String salonName,
            String city,
            String monthlyPlanCode) {
    }

    public record CoupleProfileResponse(
            UUID userId,
            String fullName,
            String email,
            String phoneE164,
            UUID coupleId,
            String groomName,
            String brideName,
            String displayName) {
    }
}
