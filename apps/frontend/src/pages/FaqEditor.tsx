import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HelpCircle, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { TOKEN_KEY } from "../auth/AuthProvider";
import { faqsKey } from "../api/useFaqs";
import { createFaq, deleteFaq, getFaqs, updateFaq } from "../api/faqs";

// Editable copy of a FAQ. `id` is null for entries not yet saved; `key` is a
// stable React key (real entries reuse their id, new ones get a temp counter).
interface Item {
  key: string;
  id: number | null;
  question: string;
  answer: string;
}

const FaqEditor = () => {
  const queryClient = useQueryClient();

  const {
    data,
    isPending,
    error: loadError,
  } = useQuery({
    queryKey: faqsKey,
    queryFn: getFaqs,
  });

  const [items, setItems] = useState<Item[]>([]);
  const [editing, setEditing] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const nextKey = useRef(0);

  // Seed/refresh the editable copy whenever fresh data arrives from the cache.
  useEffect(() => {
    if (data) {
      setItems(
        data.map((faq) => ({
          key: `faq-${faq.id}`,
          id: faq.id,
          question: faq.question,
          answer: faq.answer,
        })),
      );
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: async (payload: { items: Item[]; baselineIds: number[] }) => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) throw new Error("Du är inte inloggad.");

      // Drop entries with no question — treated as "not added".
      const valid = payload.items.filter((i) => i.question.trim() !== "");

      // Delete entries that existed before but are gone now.
      const keptIds = new Set(
        valid.map((i) => i.id).filter((id): id is number => id != null),
      );
      for (const id of payload.baselineIds) {
        if (!keptIds.has(id)) await deleteFaq(id, token);
      }

      // Create new entries, update existing ones; position sets sortOrder.
      for (let i = 0; i < valid.length; i++) {
        const item = valid[i];
        const body = {
          question: item.question.trim(),
          answer: item.answer.trim(),
          sortOrder: i + 1,
        };
        if (item.id == null) await createFaq(body, token);
        else await updateFaq(item.id, body, token);
      }
    },
    onSuccess: () => {
      setSavedAt(new Date().toLocaleTimeString("sv-SE"));
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: faqsKey });
    },
  });

  const baseline = (data ?? []).map((f) => ({
    id: f.id,
    question: f.question,
    answer: f.answer,
  }));
  const current = items.map((i) => ({
    id: i.id,
    question: i.question,
    answer: i.answer,
  }));
  const dirty = JSON.stringify(baseline) !== JSON.stringify(current);

  const updateItem = (key: string, changes: Partial<Item>) => {
    setItems((prev) =>
      prev.map((it) => (it.key === key ? { ...it, ...changes } : it)),
    );
    setSavedAt(null);
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { key: `new-${nextKey.current++}`, id: null, question: "", answer: "" },
    ]);
    setSavedAt(null);
  };

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((it) => it.key !== key));
    setSavedAt(null);
  };

  const openEditor = () => {
    setSavedAt(null);
    setEditing(true);
  };

  const cancelEditor = () => {
    if (data) {
      setItems(
        data.map((faq) => ({
          key: `faq-${faq.id}`,
          id: faq.id,
          question: faq.question,
          answer: faq.answer,
        })),
      );
    }
    mutation.reset();
    setEditing(false);
  };

  const handleSave = () => {
    mutation.mutate({ items, baselineIds: baseline.map((b) => b.id) });
  };

  const errorMessage =
    (loadError instanceof Error && loadError.message) ||
    (mutation.error instanceof Error && mutation.error.message) ||
    null;

  const inputClass =
    "w-full rounded-xl border border-white/15 bg-neutral-900 px-3 py-2.5 text-base text-white outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/40";

  return (
    <>
      {/* Preview — the saved questions, as shown on the start page. */}
      <section className="rounded-2xl border border-white/10 bg-black/40 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <HelpCircle className="h-5 w-5 text-primary" />
            Vanliga frågor
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
        ) : (data ?? []).length === 0 ? (
          <p className="mt-4 text-neutral-500">Inga frågor ännu.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2.5">
            {(data ?? []).map((faq) => (
              <li
                key={faq.id}
                className="border-b border-white/5 pb-2.5 text-neutral-300 last:border-0 last:pb-0"
              >
                {faq.question}
              </li>
            ))}
          </ul>
        )}

        {savedAt && !editing && (
          <p className="mt-4 text-sm text-green-400">Sparat {savedAt}</p>
        )}
      </section>

      {/* Editor — only visible after pressing "Ändra". */}
      {editing && (
        <section className="mt-4 rounded-2xl border border-white/10 bg-neutral-900/60 p-4 sm:p-6">
          <div className="flex flex-col gap-4">
            {items.map((item, index) => (
              <div
                key={item.key}
                className="rounded-2xl border border-white/10 bg-black/40 p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-sm text-neutral-500">
                    Fråga {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    aria-label={`Ta bort fråga ${index + 1}`}
                    className="flex items-center gap-1.5 rounded-full px-2 py-1 text-sm text-neutral-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                    Ta bort
                  </button>
                </div>
                <input
                  type="text"
                  value={item.question}
                  placeholder="Fråga"
                  onChange={(e) =>
                    updateItem(item.key, { question: e.target.value })
                  }
                  className={inputClass}
                />
                <textarea
                  value={item.answer}
                  placeholder="Svar"
                  rows={3}
                  onChange={(e) =>
                    updateItem(item.key, { answer: e.target.value })
                  }
                  className={`${inputClass} mt-3 resize-y`}
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addItem}
            className="mt-4 flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-neutral-200 transition-colors hover:border-primary hover:text-primary"
          >
            <Plus className="h-4 w-4" />
            Lägg till fråga
          </button>

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

export default FaqEditor;
