import { apiRequest } from "./api";

const DEFAULT_VENUE_ID = process.env.NEXT_PUBLIC_DEFAULT_VENUE_ID ?? "33333333-3333-3333-3333-333333333333";
const DEFAULT_COUPLE_ID = process.env.NEXT_PUBLIC_DEFAULT_COUPLE_ID ?? "44444444-4444-4444-4444-444444444444";

export type VenueEventItemResponse = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  pax: number;
  status: "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  packageName?: string;
  paymentApproved: boolean;
};

export type CreateEventRequest = {
  venueId: string;
  coupleId: string;
  title: string;
  eventType: string;
  startsAt: string;
  endsAt: string;
  paxPlanned: number;
  packageName?: string;
  status?: "planned" | "active" | "completed" | "cancelled";
  contactName?: string;
  contactPhoneE164?: string;
  contactEmail?: string;
  notes?: string;
  photographerNeeded?: boolean;
};

export type EventResponse = {
  id: string;
  venueId: string;
  coupleId: string;
  title: string;
  eventType: string;
  startsAt: string;
  endsAt: string;
  paxPlanned: number;
  packageName?: string;
  status: "planned" | "active" | "completed" | "cancelled";
  paymentStatus: string;
  contactName?: string;
  contactPhoneE164?: string;
  contactEmail?: string;
  notes?: string;
  photographerNeeded: boolean;
};

export type VenueQrDashboardResponse = {
  venueId: string;
  venueName: string;
  codeValue: string | null;
  generated: boolean;
  totalScans: number;
  scansToday: number;
  albumCount: number;
  usageRatePercent: number;
  mediaCount: number;
};

export function getDefaultVenueId(): string {
  return DEFAULT_VENUE_ID;
}

export function getDefaultCoupleId(): string {
  return DEFAULT_COUPLE_ID;
}

export async function fetchVenueEvents(venueId: string): Promise<VenueEventItemResponse[]> {
  return apiRequest<VenueEventItemResponse[]>(`/api/v1/venues/${venueId}/events`);
}

export async function createEvent(payload: CreateEventRequest): Promise<EventResponse> {
  return apiRequest<EventResponse>("/api/v1/events", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateEventStatus(eventId: string, status: "planned" | "active" | "completed" | "cancelled"): Promise<EventResponse> {
  return apiRequest<EventResponse>(`/api/v1/events/${eventId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function fetchVenueQrDashboard(venueId: string): Promise<VenueQrDashboardResponse> {
  return apiRequest<VenueQrDashboardResponse>(`/api/v1/venues/${venueId}/qr`);
}

export async function generateVenueQr(venueId: string): Promise<VenueQrDashboardResponse> {
  return apiRequest<VenueQrDashboardResponse>(`/api/v1/venues/${venueId}/qr/generate`, {
    method: "POST",
  });
}
