import { clearAuth, getToken } from "./auth";

export type ApiError = {
  error?: string;
  message?: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export class ApiRequestError extends Error {
  readonly status: number;
  readonly payload?: ApiError;

  constructor(message: string, status: number, payload?: ApiError) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.payload = payload;
  }
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers ?? {});
  headers.set("Content-Type", "application/json");

  if (!headers.has("Authorization")) {
    const token = getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let payload: ApiError | undefined;
    try {
      payload = (await response.json()) as ApiError;
    } catch {
      payload = undefined;
    }

    if (
      response.status === 401 &&
      !path.startsWith("/api/v1/auth/") &&
      typeof window !== "undefined"
    ) {
      clearAuth();
      window.location.replace("/?reason=session-expired");
    }

    const message = payload?.error ?? payload?.message ?? `Request failed with status ${response.status}`;
    throw new ApiRequestError(message, response.status, payload);
  }

  return (await response.json()) as T;
}
