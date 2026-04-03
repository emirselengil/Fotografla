import { apiRequest } from "./api";
import type { EventResponse } from "./salon-api";

export type MediaListItemResponse = {
  id: string;
  type: "PHOTO" | "VIDEO";
  uploaderName: string;
  uploadedAt: string;
  url: string;
};

export type EventSummaryResponse = {
  eventId: string;
  eventName: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  participantCount: number;
  status: string;
  paymentApproved: boolean;
  venueId: string;
  venueName: string;
  venueCity: string;
  venuePlan: string;
  activeUsers: number;
};

export type ParticipantListItemResponse = {
  id: string;
  name: string;
  isAnonymous: boolean;
  joinedAt: string;
  uploadedPhotos: number;
  uploadedVideos: number;
};

export type CurrentCoupleLatestEventResponse = {
  found: boolean;
  coupleId: string;
  event?: {
    id: string;
    title: string;
    startsAt: string;
    endsAt: string;
    status: string;
  };
  timestamp: string;
};

export async function fetchEventMedia(eventId: string): Promise<MediaListItemResponse[]> {
  return apiRequest<MediaListItemResponse[]>(`/api/v1/events/${eventId}/media`);
}

export async function fetchEventParticipants(eventId: string): Promise<ParticipantListItemResponse[]> {
  return apiRequest<ParticipantListItemResponse[]>(`/api/v1/events/${eventId}/participants`);
}

export async function fetchEventSummary(eventId: string): Promise<EventSummaryResponse> {
  return apiRequest<EventSummaryResponse>(`/api/v1/events/${eventId}/summary`);
}

export async function fetchCurrentCoupleLatestEvent(): Promise<CurrentCoupleLatestEventResponse> {
  return apiRequest<CurrentCoupleLatestEventResponse>("/api/v1/events/me/latest");
}

export async function linkCurrentCoupleToEvent(accessCode: string): Promise<EventResponse> {
  return apiRequest<EventResponse>("/api/v1/events/me/link", {
    method: "POST",
    body: JSON.stringify({ accessCode: accessCode.trim().toUpperCase() }),
  });
}
