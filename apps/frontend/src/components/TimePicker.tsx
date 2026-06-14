import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

// A themed replacement for <input type="time">. The native time picker's
// dropdown can't be styled, so we render our own dark/gold two-column picker
// (hours + minutes) that matches the rest of the site and works on touch.

interface TimePickerProps {
  value: string; // "HH:MM" or "" when unset
  onChange: (value: string) => void;
  ariaLabel?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
// 5-minute steps — plenty for opening hours, keeps the list short.
const MINUTE_STEPS = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, "0")
);

const TimePicker = ({ value, onChange, ariaLabel }: TimePickerProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const hoursColRef = useRef<HTMLUListElement>(null);
  const minutesColRef = useRef<HTMLUListElement>(null);
  const selectedHourRef = useRef<HTMLButtonElement>(null);
  const selectedMinuteRef = useRef<HTMLButtonElement>(null);

  const [hour, minute] = value ? value.split(":") : ["", ""];

  // Keep an out-of-step stored minute (e.g. "03") selectable.
  const minutes =
    minute && !MINUTE_STEPS.includes(minute)
      ? [...MINUTE_STEPS, minute].sort()
      : MINUTE_STEPS;

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Centre the current selection in each column when the panel opens.
  useEffect(() => {
    if (!open) return;
    const centre = (ul: HTMLUListElement | null, btn: HTMLButtonElement | null) => {
      if (!ul || !btn) return;
      ul.scrollTop = btn.offsetTop - ul.clientHeight / 2 + btn.clientHeight / 2;
    };
    centre(hoursColRef.current, selectedHourRef.current);
    centre(minutesColRef.current, selectedMinuteRef.current);
  }, [open]);

  const colClass = "no-scrollbar max-h-56 flex-1 overflow-y-auto py-1";
  const itemClass =
    "block w-full px-3 py-2.5 text-center text-sm transition-colors";

  return (
    <div ref={rootRef} className="relative w-full sm:w-32">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-white/15 bg-neutral-900 px-3 py-3 text-base text-white outline-none transition-colors hover:border-white/30 focus:border-primary focus:ring-2 focus:ring-primary/40 sm:py-2.5"
      >
        <span className={value ? "" : "text-neutral-500"}>
          {value || "--:--"}
        </span>
        <Clock className="h-4 w-4 shrink-0 text-primary" />
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-2 flex w-full min-w-[8rem] overflow-hidden rounded-xl border border-white/10 bg-neutral-900 shadow-2xl">
          <ul ref={hoursColRef} className={colClass}>
            {HOURS.map((h) => {
              const selected = h === hour;
              return (
                <li key={h}>
                  <button
                    type="button"
                    ref={selected ? selectedHourRef : undefined}
                    onClick={() => onChange(`${h}:${minute || "00"}`)}
                    className={`${itemClass} ${
                      selected
                        ? "bg-primary font-medium text-white"
                        : "text-neutral-200 hover:bg-white/10"
                    }`}
                  >
                    {h}
                  </button>
                </li>
              );
            })}
          </ul>
          <span className="flex select-none items-center px-1 text-lg font-semibold text-neutral-400">
            :
          </span>
          <ul ref={minutesColRef} className={colClass}>
            {minutes.map((m) => {
              const selected = m === minute;
              return (
                <li key={m}>
                  <button
                    type="button"
                    ref={selected ? selectedMinuteRef : undefined}
                    onClick={() => onChange(`${hour || "00"}:${m}`)}
                    className={`${itemClass} ${
                      selected
                        ? "bg-primary font-medium text-white"
                        : "text-neutral-200 hover:bg-white/10"
                    }`}
                  >
                    {m}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TimePicker;
