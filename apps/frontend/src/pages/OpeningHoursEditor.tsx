import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, Save } from "lucide-react";
import { TOKEN_KEY } from "../auth/AuthProvider";
import TimePicker from "../components/TimePicker";
import { openingHoursKey } from "../api/useOpeningHours";
import {
  getOpeningHours,
  isClosed,
  updateOpeningHour,
  type OpeningHour,
} from "../api/openingHours";

// Editable copy of a day's row. Times are kept as strings so the inputs are
// controlled; "" means "no time set".
interface Row {
  id: number;
  label: string;
  closed: boolean;
  opens: string;
  closes: string;
}

function toRow(hour: OpeningHour): Row {
  return {
    id: hour.id,
    label: hour.label,
    closed: isClosed(hour),
    opens: hour.opens ?? "",
    closes: hour.closes ?? "",
  };
}

function rowsEqual(a: Row, b: Row): boolean {
  return a.closed === b.closed && a.opens === b.opens && a.closes === b.closes;
}

const OpeningHoursEditor = () => {
  const queryClient = useQueryClient();

  const { data, isPending, error: loadError } = useQuery({
    queryKey: openingHoursKey,
    queryFn: getOpeningHours,
  });

  // The fetched rows are the saved baseline; `rows` holds in-progress edits.
  const original = (data ?? []).map(toRow);
  const [rows, setRows] = useState<Row[]>([]);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // Seed/refresh the editable copy whenever fresh data arrives from the cache.
  useEffect(() => {
    if (data) setRows(data.map(toRow));
  }, [data]);

  const mutation = useMutation({
    mutationFn: async (changed: Row[]) => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) throw new Error("Du är inte inloggad.");
      // Only send the days that actually changed.
      for (const row of changed) {
        await updateOpeningHour(
          row.id,
          {
            closed: row.closed,
            opens: row.closed ? null : row.opens || null,
            closes: row.closed ? null : row.closes || null,
          },
          token
        );
      }
    },
    onSuccess: () => {
      setSavedAt(new Date().toLocaleTimeString("sv-SE"));
      // Refetch so the public site and this form reflect the saved values.
      queryClient.invalidateQueries({ queryKey: openingHoursKey });
    },
  });

  const updateRow = (id: number, changes: Partial<Row>) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...changes } : row))
    );
    setSavedAt(null);
  };

  const dirty = rows.some((row, i) => original[i] && !rowsEqual(row, original[i]));

  const handleSave = () => {
    const changed = rows.filter(
      (row, i) => original[i] && !rowsEqual(row, original[i])
    );
    mutation.mutate(changed);
  };

  const errorMessage =
    (loadError instanceof Error && loadError.message) ||
    (mutation.error instanceof Error && mutation.error.message) ||
    null;

  return (
    <div className="h-full w-full overflow-y-auto bg-neutral-950 text-white p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center gap-3 mb-2">
          <Clock className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-semibold">Öppettider</h1>
        </header>
        <p className="text-neutral-400 mb-8">
          Ändra tiderna nedan. Markera "Stängt" för dagar utan öppet. Tiderna
          uppdateras på hemsidan när du sparar.
        </p>

        {isPending ? (
          <p className="text-neutral-400">Laddar…</p>
        ) : (
          <div className="flex flex-col gap-3">
            {rows.map((row) => (
              <div
                key={row.id}
                className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/40 px-4 py-4 sm:flex-row sm:items-center sm:gap-4"
              >
                <span className="text-lg font-medium sm:w-24 sm:text-base">
                  {row.label}
                </span>

                <label className="flex w-fit cursor-pointer select-none items-center gap-2.5 py-1 text-sm text-neutral-300">
                  <input
                    type="checkbox"
                    checked={row.closed}
                    onChange={(e) =>
                      updateRow(row.id, { closed: e.target.checked })
                    }
                    className="h-5 w-5 cursor-pointer rounded accent-primary"
                  />
                  Stängt
                </label>

                {row.closed ? (
                  <span className="text-neutral-500 sm:ml-auto">Stängt</span>
                ) : (
                  <div className="flex w-full items-center gap-3 sm:ml-auto sm:w-auto">
                    <TimePicker
                      ariaLabel={`Öppnar ${row.label}`}
                      value={row.opens}
                      onChange={(v) => updateRow(row.id, { opens: v })}
                    />
                    <span className="text-neutral-500">–</span>
                    <TimePicker
                      ariaLabel={`Stänger ${row.label}`}
                      value={row.closes}
                      onChange={(v) => updateRow(row.id, { closes: v })}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {errorMessage && <p className="mt-4 text-red-400">{errorMessage}</p>}

        <div className="flex items-center gap-4 mt-8">
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || mutation.isPending || isPending}
            className="flex items-center gap-2 rounded-full bg-primary text-white px-6 py-2.5 font-medium hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {mutation.isPending ? "Sparar…" : "Spara ändringar"}
          </button>
          {savedAt && !dirty && (
            <span className="text-sm text-green-400">Sparat {savedAt}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpeningHoursEditor;
