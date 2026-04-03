import { apiRequest } from "./api";

const DEFAULT_VENUE_ID = process.env.NEXT_PUBLIC_DEFAULT_VENUE_ID ?? "33333333-3333-3333-3333-333333333333";

export type UserProfileResponse = {
  id: string;
  email: string;
  fullName: string;
  phoneE164: string | null;
  role: string;
  active: boolean;
};

export type CoupleProfileResponse = {
  userId: string;
  fullName: string;
  email: string;
  phoneE164: string | null;
  coupleId: string;
  groomName: string;
  brideName: string;
  displayName: string;
};

export type SalonProfileResponse = {
  venueId: string;
  fullName: string;
  email: string;
  phoneE164: string | null;
  salonName: string;
  city: string;
  monthlyPlanCode: string;
};

export function getDefaultVenueId(): string {
  return DEFAULT_VENUE_ID;
}

export async function fetchCurrentUser(): Promise<UserProfileResponse> {
  return apiRequest<UserProfileResponse>("/api/v1/users/me");
}

export async function updateCurrentUser(payload: {
  fullName: string;
  email: string;
  phoneE164?: string;
  password?: string;
}): Promise<UserProfileResponse> {
  return apiRequest<UserProfileResponse>("/api/v1/users/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function fetchCoupleProfile(): Promise<CoupleProfileResponse> {
  return apiRequest<CoupleProfileResponse>("/api/v1/couples/me");
}

export async function updateCoupleProfile(payload: {
  fullName: string;
  email: string;
  phoneE164?: string;
  password?: string;
  groomName: string;
  brideName: string;
}): Promise<CoupleProfileResponse> {
  return apiRequest<CoupleProfileResponse>("/api/v1/couples/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function fetchSalonProfile(venueId: string): Promise<SalonProfileResponse> {
  return apiRequest<SalonProfileResponse>(`/api/v1/venues/${venueId}/profile`);
}

export async function updateSalonProfile(
  venueId: string,
  payload: {
    fullName: string;
    email: string;
    phoneE164?: string;
    password?: string;
    salonName: string;
    city: string;
    monthlyPlanCode: string;
  }
): Promise<SalonProfileResponse> {
  return apiRequest<SalonProfileResponse>(`/api/v1/venues/${venueId}/profile`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
