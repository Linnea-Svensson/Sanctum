// Thin client for the Feathers authentication service (REST + JWT).
// No Feathers client dependency — just fetch against the configured API URL.

const API_URL = (
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3030"
).replace(/\/$/, "");

export interface AuthUser {
  id: number;
  email: string;
  // SQLite stores booleans as 0/1, so accept either.
  isAdmin: boolean | number;
  createdAt: string;
}

export interface AuthResult {
  accessToken: string;
  user: AuthUser;
}

async function authenticate(body: Record<string, unknown>): Promise<AuthResult> {
  const res = await fetch(`${API_URL}/authentication`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      (data && typeof data.message === "string" && data.message) ||
      `Inloggningen misslyckades (${res.status})`;
    throw new Error(message);
  }

  return data as AuthResult;
}

export function login(email: string, password: string): Promise<AuthResult> {
  return authenticate({ strategy: "local", email, password });
}

export function reauthenticate(accessToken: string): Promise<AuthResult> {
  return authenticate({ strategy: "jwt", accessToken });
}

export async function logout(accessToken: string): Promise<void> {
  // Best effort — clearing the local token is what actually signs the user out.
  await fetch(`${API_URL}/authentication`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  }).catch(() => undefined);
}
