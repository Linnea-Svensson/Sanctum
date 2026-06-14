// Client for the Feathers `faqs` service (REST + JWT).
// Reading is public; create/update/delete require an admin token.

import { API_URL } from "../auth/api";

export interface Faq {
  id: number;
  question: string;
  answer: string;
  sortOrder: number;
}

export type FaqInput = {
  question: string;
  answer: string;
  sortOrder: number;
};

// Fetch all FAQs, sorted by their display order.
export async function getFaqs(): Promise<Faq[]> {
  const res = await fetch(`${API_URL}/faqs`);
  if (!res.ok) throw new Error(`Kunde inte hämta vanliga frågor (${res.status})`);
  const data = (await res.json()) as Faq[];
  return [...data].sort((a, b) => a.sortOrder - b.sortOrder);
}

function authHeaders(accessToken: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
}

async function parseOrThrow(res: Response): Promise<Faq> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (data && typeof data.message === "string" && data.message) ||
      `Kunde inte spara vanliga frågor (${res.status})`;
    throw new Error(message);
  }
  return data as Faq;
}

export async function createFaq(
  input: FaqInput,
  accessToken: string
): Promise<Faq> {
  const res = await fetch(`${API_URL}/faqs`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(input),
  });
  return parseOrThrow(res);
}

export async function updateFaq(
  id: number,
  input: Partial<FaqInput>,
  accessToken: string
): Promise<Faq> {
  const res = await fetch(`${API_URL}/faqs/${id}`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(input),
  });
  return parseOrThrow(res);
}

export async function deleteFaq(id: number, accessToken: string): Promise<void> {
  const res = await fetch(`${API_URL}/faqs/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Kunde inte ta bort frågan (${res.status})`);
}
