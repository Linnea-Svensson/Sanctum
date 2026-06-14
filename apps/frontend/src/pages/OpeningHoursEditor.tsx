import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, Pencil, Save, X } from "lucide-react";
import { TOKEN_KEY } from "../auth/AuthProvider";
import TimePicker from "../components/TimePicker";
import { openingHoursKey } from "../api/useOpeningHours";
import {
  getOpeningHours,
  groupOpeningHours,
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

  const {
    data,
    isPending,
    error: loadError,
  } = useQuery({
    queryKey: openingHoursKey,
    queryFn: getOpeningHours,
  });

  // The fetched rows are the saved baseline; `rows` holds in-progress edits.
  const original = (data ?? []).map(toRow);
  const [rows, setRows] = useState<Row[]>([]);
  const [editing, setEditing] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // Preview reflects the saved values (grouped like the public site).
  const groups = data ? groupOpeningHours(data) : [];

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
          token,
        );
      }
    },
    onSuccess: () => {
      setSavedAt(new Date().toLocaleTimeString("sv-SE"));
      // Collapse back to the preview, which refreshes from the refetch below.
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: openingHoursKey });
    },
  });

  const updateRow = (id: number, changes: Partial<Row>) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...changes } : row)),
    );
    setSavedAt(null);
  };

  const dirty = rows.some(
    (row, i) => original[i] && !rowsEqual(row, original[i]),
  );

  const openEditor = () => {
    setSavedAt(null);
    setEditing(true);
  };

  const cancelEditor = () => {
    if (data) setRows(data.map(toRow)); // discard unsaved edits
    mutation.reset();
    setEditing(false);
  };

  const handleSave = () => {
    const changed = rows.filter(
      (row, i) => original[i] && !rowsEqual(row, original[i]),
    );
    mutation.mutate(changed);
  };

  const errorMessage =
    (loadError instanceof Error && loadError.message) ||
    (mutation.error instanceof Error && mutation.error.message) ||
    null;

  return (
    <>
      {/* Preview — the saved hours, grouped like on the start page. */}
      <section className="rounded-2xl border border-white/10 bg-black/40 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Clock className="h-5 w-5 text-primary" />
            Öppettider
          </h2>
          <button
            type="button"
            onClick={editing ? cancelEditor : openEditor}
            className="flex shrink-0 items-center gap-2 rounded-full border-2 border-primary px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white"
          >
            {editing ? (
              <>
                <X className="h-4 w-4" />
                Stäng
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4" />
                Ändra
              </>
            )}
          </button>
        </div>

        {isPending ? (
          <p className="mt-4 text-neutral-400">Laddar…</p>
        ) : (
          <div className="mt-4 flex flex-col gap-2.5">
            {groups.map((group) => (
              <div
                key={group.label}
                className="flex items-center justify-between border-b border-white/5 pb-2.5 last:border-0 last:pb-0"
              >
                <span className="text-neutral-300">{group.label}</span>
                <span className="font-medium">{group.value}</span>
              </div>
            ))}
          </div>
        )}

        {savedAt && !editing && (
          <p className="mt-4 text-sm text-green-400">Sparat {savedAt}</p>
        )}
      </section>

      {/* Editor — only visible after pressing "Ändra". */}
      {editing && (
        <section className="mt-4 rounded-2xl border border-white/10 bg-neutral-900/60 p-4 sm:p-6">
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

          {errorMessage && <p className="mt-4 text-red-400">{errorMessage}</p>}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={!dirty || mutation.isPending}
              className="flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 font-medium text-white transition-colors hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {mutation.isPending ? "Sparar…" : "Spara ändringar"}
            </button>
            <button
              type="button"
              onClick={cancelEditor}
              disabled={mutation.isPending}
              className="rounded-full border border-white/20 px-6 py-2.5 font-medium text-neutral-300 transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              Avbryt
            </button>
          </div>
        </section>
      )}
    </>
  );
};

export default OpeningHoursEditor;
