import { useQuery } from "@tanstack/react-query";
import {
  getOpeningHours,
  groupOpeningHours,
  type OpeningHour,
  type OpeningHourGroup,
} from "./openingHours";

// Shared query key so reads and the dashboard mutation stay in sync.
export const openingHoursKey = ["opening-hours"] as const;

// Shown until the backend responds (and as a fallback if it errors), so the
// public site never renders an empty opening-hours block.
const FALLBACK_GROUPS: OpeningHourGroup[] = [
  { label: "Måndag - Onsdag", value: "Stängt" },
  { label: "Torsdag - Fredag", value: "16:00 - 21:00" },
  { label: "Lördag - Söndag", value: "12:00 - 17:00" },
];

interface UseOpeningHours {
  hours: OpeningHour[];
  groups: OpeningHourGroup[];
  loading: boolean;
  error: string | null;
}

// Reads opening hours via TanStack Query. `groups` always has content thanks
// to the fallback, so callers can render it directly.
export function useOpeningHours(): UseOpeningHours {
  const { data, isPending, error } = useQuery({
    queryKey: openingHoursKey,
    queryFn: getOpeningHours,
  });

  const hours = data ?? [];
  const groups = hours.length > 0 ? groupOpeningHours(hours) : FALLBACK_GROUPS;

  return {
    hours,
    groups,
    loading: isPending,
    error: error instanceof Error ? error.message : null,
  };
}
