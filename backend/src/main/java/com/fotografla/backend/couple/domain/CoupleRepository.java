package com.fotografla.backend.couple.domain;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CoupleRepository extends JpaRepository<CoupleEntity, UUID> {
    Optional<CoupleEntity> findByPrimaryUserId(UUID primaryUserId);
}
