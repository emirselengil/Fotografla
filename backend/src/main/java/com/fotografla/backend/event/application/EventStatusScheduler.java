package com.fotografla.backend.event.application;

import com.fotografla.backend.event.domain.EventEntity;
import com.fotografla.backend.event.domain.EventRepository;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class EventStatusScheduler {

    private final EventRepository eventRepository;

    public EventStatusScheduler(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    @Transactional
    @Scheduled(fixedDelayString = "${app.event.status-sync-interval-ms:60000}")
    public void syncEventStatuses() {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

        List<EventEntity> eventsToActivate = eventRepository.findByStatusAndStartsAtLessThanEqual("planned", now);
        for (EventEntity event : eventsToActivate) {
            if (event.getEndsAt().isAfter(now)) {
                event.setStatus("active");
            } else {
                event.setStatus("completed");
            }
        }

        List<EventEntity> eventsToComplete = eventRepository.findByStatusAndEndsAtLessThanEqual("active", now);
        for (EventEntity event : eventsToComplete) {
            event.setStatus("completed");
        }
    }
}
