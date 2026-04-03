package com.fotografla.backend.auth.application;

import com.fotografla.backend.auth.domain.UserEntity;
import com.fotografla.backend.auth.domain.UserRepository;
import com.fotografla.backend.auth.security.JwtService;
import com.fotografla.backend.couple.domain.CoupleEntity;
import com.fotografla.backend.couple.domain.CoupleRepository;
import com.fotografla.backend.venue.domain.VenueEntity;
import com.fotografla.backend.venue.domain.VenueRepository;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final VenueRepository venueRepository;
    private final CoupleRepository coupleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            VenueRepository venueRepository,
            CoupleRepository coupleRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.venueRepository = venueRepository;
        this.coupleRepository = coupleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public Map<String, Object> register(
            String email,
            String password,
            String fullName,
            String phone,
            String role,
            String salonName,
            String city,
            String monthlyPlanCode,
            String groomName,
            String brideName) {
        userRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
            throw new IllegalArgumentException("Email zaten kayitli.");
        });

        String normalizedRole = role == null ? "guest" : role.trim().toLowerCase();
        if (!(normalizedRole.equals("salon_owner") || normalizedRole.equals("couple_admin") || normalizedRole.equals("staff") || normalizedRole.equals("guest"))) {
            throw new IllegalArgumentException("Gecersiz rol.");
        }

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

        UserEntity user = new UserEntity();
        user.setId(UUID.randomUUID());
        user.setEmail(email.trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setFullName(fullName.trim());
        user.setPhoneE164(phone);
        user.setRole(normalizedRole);
        user.setIsActive(true);
        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        userRepository.save(user);
        createRoleSpecificProfile(user, salonName, city, monthlyPlanCode, groomName, brideName);

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());

        return Map.of(
                "token", token,
                "user", Map.of(
                        "id", user.getId(),
                        "email", user.getEmail(),
                        "fullName", user.getFullName(),
                        "role", user.getRole()));
    }

    private void createRoleSpecificProfile(
            UserEntity user,
            String salonName,
            String city,
            String monthlyPlanCode,
            String groomName,
            String brideName) {
        if ("salon_owner".equals(user.getRole())) {
            if (isBlank(salonName) || isBlank(city) || isBlank(monthlyPlanCode)) {
                throw new IllegalArgumentException("Salon kaydi icin salon bilgileri zorunludur.");
            }

            VenueEntity venue = new VenueEntity();
            venue.setOwnerUserId(user.getId());
            venue.setName(salonName.trim());
            venue.setCity(city.trim());
            venue.setMonthlyPlanCode(normalizePlanCode(monthlyPlanCode));
            venue.setSlug(createSlug(venue.getName(), user.getId()));
            venue.setQrStatus("active");
            venueRepository.save(venue);
            return;
        }

        if ("couple_admin".equals(user.getRole())) {
            if (isBlank(groomName) || isBlank(brideName)) {
                throw new IllegalArgumentException("Cift kaydi icin damat ve gelin adlari zorunludur.");
            }

            CoupleEntity couple = new CoupleEntity();
            couple.setPrimaryUserId(user.getId());
            couple.setGroomName(groomName.trim());
            couple.setBrideName(brideName.trim());
            couple.setDisplayName(couple.getGroomName() + " & " + couple.getBrideName());
            coupleRepository.save(couple);
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String normalizePlanCode(String planCode) {
        return planCode.trim().toUpperCase().replace('-', '_').replace(' ', '_');
    }

    private String createSlug(String salonName, UUID userId) {
        String normalized = salonName.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim()
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");

        String base = normalized.isBlank() ? "salon" : normalized;
        return base + "-" + userId.toString().substring(0, 8);
    }

    public Map<String, Object> login(String email, String password) {
        UserEntity user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("Kullanici bulunamadi."));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new IllegalArgumentException("Kullanici pasif.");
        }

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Sifre hatali.");
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());

        return Map.of(
                "token", token,
                "user", Map.of(
                        "id", user.getId(),
                        "email", user.getEmail(),
                        "fullName", user.getFullName(),
                        "role", user.getRole()));
    }
}
