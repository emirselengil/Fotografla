import { apiRequest } from "./api";

const DEFAULT_EVENT_ID = process.env.NEXT_PUBLIC_DEFAULT_EVENT_ID ?? "66666666-6666-6666-6666-666666666666";
const DEFAULT_VENUE_ID = process.env.NEXT_PUBLIC_DEFAULT_VENUE_ID ?? "33333333-3333-3333-3333-333333333333";

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

export function getDefaultEventId(): string {
  return DEFAULT_EVENT_ID;
}

export function getDefaultVenueId(): string {
  return DEFAULT_VENUE_ID;
}

export async function fetchEventMedia(eventId: string): Promise<MediaListItemResponse[]> {
  return apiRequest<MediaListItemResponse[]>(`/api/v1/events/${eventId}/media`);
}

export async function fetchEventParticipants(eventId: string): Promise<ParticipantListItemResponse[]> {
  return apiRequest<ParticipantListItemResponse[]>(`/api/v1/events/${eventId}/participants`);
}

export async function fetchEventSummary(eventId: string): Promise<EventSummaryResponse> {
  return apiRequest<EventSummaryResponse>(`/api/v1/events/${eventId}/summary`);
}
