export type AuthRole = "admin" | "student";

export interface AuthState {
  role: AuthRole;
  studentName?: string;
  studentUsername?: string;
}

const AUTH_KEY = "examflow_auth";

export function getAuth(): AuthState | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthState;
  } catch {
    return null;
  }
}

export function setAuth(state: AuthState): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(state));
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_KEY);
}
