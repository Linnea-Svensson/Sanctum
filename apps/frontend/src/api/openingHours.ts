// Client for the Feathers `opening-hours` service (REST + JWT).
// Reading is public; patching requires an admin token.

import { API_URL } from "../auth/api";

export interface OpeningHour {
  id: number;
  day: string; // 'monday' … 'sunday'
  label: string; // Swedish display name, e.g. 'Måndag'
  sortOrder: number;
  // SQLite stores booleans as 0/1, so accept either.
  closed: boolean | number;
  opens: string | null; // 'HH:MM'
  closes: string | null;
}

// Only these fields can be changed from the dashboard.
export type OpeningHourUpdate = {
  closed: boolean;
  opens: string | null;
  closes: string | null;
};

// Fetch all days, sorted Monday → Sunday.
export async function getOpeningHours(): Promise<OpeningHour[]> {
  const res = await fetch(`${API_URL}/opening-hours`);
  if (!res.ok) {
    throw new Error(`Kunde inte hämta öppettider (${res.status})`);
  }
  const data = (await res.json()) as OpeningHour[];
  return [...data].sort((a, b) => a.sortOrder - b.sortOrder);
}

// Update a single day's hours (admin only).
export async function updateOpeningHour(
  id: number,
  changes: OpeningHourUpdate,
  accessToken: string
): Promise<OpeningHour> {
  const res = await fetch(`${API_URL}/opening-hours/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(changes),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (data && typeof data.message === "string" && data.message) ||
      `Kunde inte spara öppettider (${res.status})`;
    throw new Error(message);
  }
  return data as OpeningHour;
}

export function isClosed(hour: OpeningHour): boolean {
  return !!hour.closed;
}

// Group consecutive days that share the same hours into ranges,
// e.g. [Mon closed, Tue closed, Wed closed] → "Måndag - Onsdag: Stängt".
export interface OpeningHourGroup {
  label: string; // "Måndag - Onsdag" or "Torsdag"
  value: string; // "Stängt" or "16:00 - 21:00"
}

function formatValue(hour: OpeningHour): string {
  if (isClosed(hour) || !hour.opens || !hour.closes) return "Stängt";
  return `${hour.opens} - ${hour.closes}`;
}

export function groupOpeningHours(hours: OpeningHour[]): OpeningHourGroup[] {
  const groups: OpeningHourGroup[] = [];
  for (const hour of hours) {
    const value = formatValue(hour);
    const last = groups[groups.length - 1];
    const prevHour = hours[hours.indexOf(hour) - 1];
    // Extend the previous group only if the value matches AND the days are
    // adjacent (so a gap in the data starts a fresh range).
    if (
      last &&
      last.value === value &&
      prevHour &&
      prevHour.sortOrder === hour.sortOrder - 1
    ) {
      // Replace the end of the range label with the current day.
      const start = last.label.split(" - ")[0];
      last.label = `${start} - ${hour.label}`;
    } else {
      groups.push({ label: hour.label, value });
    }
  }
  return groups;
}
