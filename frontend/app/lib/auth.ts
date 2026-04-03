const TOKEN_KEY = "fotografla_token";
const ROLE_KEY = "fotografla_role";
const FULL_NAME_KEY = "fotografla_full_name";

export function persistAuth(token: string, role: string, fullName?: string): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
  if (fullName && fullName.trim()) {
    localStorage.setItem(FULL_NAME_KEY, fullName.trim());
  }
}

export function clearAuth(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(FULL_NAME_KEY);
}

export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(TOKEN_KEY);
}

export function getRole(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(ROLE_KEY);
}

export function getStoredUserName(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(FULL_NAME_KEY);
}

export function setStoredUserName(fullName: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const value = fullName.trim();
  if (value) {
    localStorage.setItem(FULL_NAME_KEY, value);
  }
}
