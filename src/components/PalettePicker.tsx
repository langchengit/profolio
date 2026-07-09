import { useEffect, useId, useRef, useState } from 'react';
import { Check, Palette } from 'lucide-react';
import { useTheme } from '../lib/theme';
import { PRESETS, normalizeForTheme, useAccent } from '../lib/accent';

export function PalettePicker() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const theme = useTheme((s) => s.theme);
  const activeId = useAccent((s) => s.id);
  const triad = useAccent((s) => s.triad);
  const setPreset = useAccent((s) => s.setPreset);
  const setCustom = useAccent((s) => s.setCustom);

  // Seed the custom picker with whatever base color is currently active.
  const customValue = triad[0];

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change accent color"
        aria-expanded={open}
        aria-controls={panelId}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text backdrop-blur transition hover:border-accent hover:text-accent"
      >
        <Palette size={18} />
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Accent color"
          className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-border bg-surface-strong p-4 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.6)] backdrop-blur-xl"
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">
            Accent color
          </p>

          <div className="grid grid-cols-3 gap-2.5">
            {PRESETS.map((p) => {
              const selected = activeId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPreset(p.id)}
                  title={p.name}
                  aria-label={p.name}
                  aria-pressed={selected}
                  className={`relative flex h-12 items-center justify-center rounded-xl border transition ${
                    selected
                      ? 'border-accent ring-2 ring-accent/40'
                      : 'border-border hover:border-border-strong'
                  }`}
                  style={{ background: normalizeForTheme(p.triad[0], theme) }}
                >
                  {selected && (
                    <Check size={18} className="text-white drop-shadow" strokeWidth={3} />
                  )}
                </button>
              );
            })}
          </div>

          <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5 transition hover:border-border-strong">
            <span className="flex items-center gap-2 text-sm text-text">
              <span
                className="h-5 w-5 rounded-full border border-border-strong"
                style={{ background: normalizeForTheme(customValue, theme) }}
              />
              Custom
              {activeId === 'custom' && (
                <Check size={14} className="text-accent" strokeWidth={3} />
              )}
            </span>
            <span className="font-mono text-xs uppercase text-muted">
              {customValue}
            </span>
            <input
              type="color"
              value={customValue}
              onChange={(e) => setCustom(e.target.value)}
              aria-label="Pick a custom accent color"
              className="sr-only"
            />
          </label>
        </div>
      )}
    </div>
  );
}
