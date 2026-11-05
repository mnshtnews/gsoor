"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

/**
 * Word / Excel style text-colour picker for the CMS editor.
 *  - theme grid: 10 base colours with 5 lighter/darker shades each
 *  - standard colours row
 *  - favourites (saved in this browser, shown first, removable) and recently used colours
 *  - custom colour: native picker + HEX field, with a ★ button to save it as a favourite
 */

const FAVORITES_KEY = "jusoor.cms.favoriteColors.v1";
const RECENT_KEY = "jusoor.cms.recentColors.v1";
const MAX_FAVORITES = 24;
const MAX_RECENT = 10;
const DEFAULT_COLOR = "#17243a";

const THEME: { hex: string; name: string }[] = [
  { hex: "#17243a", name: "كحلي داكن" }, { hex: "#ffffff", name: "أبيض" }, { hex: "#44546a", name: "رمادي مزرق" }, { hex: "#e8eef7", name: "أزرق فاتح جدًا" },
  { hex: "#1555b8", name: "أزرق جسور" }, { hex: "#e07a1f", name: "برتقالي جسور" }, { hex: "#8a8f98", name: "رمادي" }, { hex: "#c9a227", name: "ذهبي" },
  { hex: "#2f855a", name: "أخضر" }, { hex: "#c0392b", name: "أحمر" },
];
const STANDARD: { hex: string; name: string }[] = [
  { hex: "#8b0000", name: "أحمر داكن" }, { hex: "#ff0000", name: "أحمر" }, { hex: "#ffa500", name: "برتقالي" }, { hex: "#ffd500", name: "أصفر" }, { hex: "#92d050", name: "أخضر فاتح" },
  { hex: "#00a651", name: "أخضر" }, { hex: "#00b0f0", name: "أزرق فاتح" }, { hex: "#0070c0", name: "أزرق" }, { hex: "#002060", name: "أزرق داكن" }, { hex: "#7030a0", name: "بنفسجي" },
];
/** Shade steps like Word: lighter 80/60/40 %, darker 25/50 %. */
const SHADE_STEPS: { mix: number; label: string }[] = [
  { mix: 0.8, label: "أفتح 80%" }, { mix: 0.6, label: "أفتح 60%" }, { mix: 0.4, label: "أفتح 40%" }, { mix: -0.25, label: "أغمق 25%" }, { mix: -0.5, label: "أغمق 50%" },
];

const HEX = /^#[0-9a-f]{6}$/i;
const normalize = (value: string): string | null => {
  const v = value.trim().replace(/^#?/, "#").toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(v)) return `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`;
  return HEX.test(v) ? v : null;
};
function shade(hex: string, mix: number): string {
  const n = parseInt(hex.slice(1), 16);
  const channels = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => Math.round(mix >= 0 ? c + (255 - c) * mix : c * (1 + mix)));
  return `#${channels.map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, "0")).join("")}`;
}
function readList(key: string): string[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "[]") as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string" && HEX.test(item)) : [];
  } catch { return []; }
}
function writeList(key: string, list: string[]) {
  try { window.localStorage.setItem(key, JSON.stringify(list)); } catch { /* private mode / quota: favourites just stay in memory */ }
}

export function ColorPalettePicker({ value, disabled, onPick, onClear }: { value: string | null; disabled?: boolean; onPick: (hex: string) => void; onClear: () => void }) {
  const [open, setOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [custom, setCustom] = useState(value ?? DEFAULT_COLOR);
  const [hexText, setHexText] = useState(value ?? DEFAULT_COLOR);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const current = value && HEX.test(value) ? value.toLowerCase() : null;

  useEffect(() => { setFavorites(readList(FAVORITES_KEY)); setRecent(readList(RECENT_KEY)); }, []);
  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent | TouchEvent) => { if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false); };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); rootRef.current?.querySelector<HTMLButtonElement>("button")?.focus(); } };
    document.addEventListener("mousedown", onDown); document.addEventListener("touchstart", onDown); document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("touchstart", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const pick = useCallback((hex: string) => {
    const color = hex.toLowerCase();
    onPick(color);
    setCustom(color); setHexText(color);
    setRecent((list) => { const next = [color, ...list.filter((item) => item !== color)].slice(0, MAX_RECENT); writeList(RECENT_KEY, next); return next; });
  }, [onPick]);

  const toggleFavorite = useCallback((hex: string) => {
    const color = hex.toLowerCase();
    setFavorites((list) => {
      const next = list.includes(color) ? list.filter((item) => item !== color) : [color, ...list].slice(0, MAX_FAVORITES);
      writeList(FAVORITES_KEY, next); return next;
    });
  }, []);

  const grid = useMemo(() => THEME.map((base) => ({ base, shades: SHADE_STEPS.map((step) => ({ hex: shade(base.hex, step.mix), name: `${base.name} — ${step.label}` })) })), []);
  const customHex = normalize(hexText);
  const customIsFavorite = !!customHex && favorites.includes(customHex);

  const Swatch = ({ hex, name, removable }: { hex: string; name: string; removable?: boolean }) => (
    <span className="rte-swatch-wrap">
      <button type="button" className={`rte-swatch${current === hex ? " is-selected" : ""}`} style={{ backgroundColor: hex }} title={`${name} (${hex})`} aria-label={`${name} ${hex}`} aria-pressed={current === hex} onClick={() => { pick(hex); setOpen(false); }} />
      {removable && <button type="button" className="rte-swatch-remove" aria-label={`إزالة ${hex} من المفضلة`} title="إزالة من المفضلة" onClick={() => toggleFavorite(hex)}>×</button>}
    </span>
  );

  return (
    <div className="rte-colorpicker" ref={rootRef}>
      <button type="button" className="rte-color-trigger" disabled={disabled} aria-haspopup="dialog" aria-expanded={open} aria-controls={panelId} title="لون الخط" onClick={() => setOpen((v) => !v)}>
        <span className="rte-color-glyph" aria-hidden="true">A<i style={{ backgroundColor: current ?? DEFAULT_COLOR }} /></span>
        <span className="rte-color-label">لون الخط</span><span className="rte-caret" aria-hidden="true">▾</span>
      </button>
      {open && <div className="rte-color-panel" id={panelId} role="dialog" aria-label="اختيار لون الخط">
        <button type="button" className="rte-color-auto" onClick={() => { onClear(); setOpen(false); }}><i aria-hidden="true" style={{ backgroundColor: DEFAULT_COLOR }} />تلقائي (لون النص الافتراضي)</button>

        <div className="rte-color-section">
          <h4>ألوان المفضلة <small>★ {favorites.length}/{MAX_FAVORITES}</small></h4>
          {favorites.length ? <div className="rte-swatch-row">{favorites.map((hex) => <Swatch key={hex} hex={hex} name="لون مفضّل" removable />)}</div>
            : <p className="rte-color-empty">لا توجد ألوان مفضّلة بعد. اختر لونًا مخصصًا واضغط ★ ليظهر هنا دائمًا.</p>}
        </div>

        <div className="rte-color-section">
          <h4>ألوان الموقع</h4>
          <div className="rte-theme-grid" role="group" aria-label="ألوان الموقع ودرجاتها">
            {grid.map(({ base }) => <Swatch key={base.hex} hex={base.hex} name={base.name} />)}
            {SHADE_STEPS.map((_, row) => grid.map(({ shades }) => <Swatch key={`${row}-${shades[row].hex}`} hex={shades[row].hex} name={shades[row].name} />))}
          </div>
        </div>

        <div className="rte-color-section">
          <h4>ألوان قياسية</h4>
          <div className="rte-swatch-row">{STANDARD.map((color) => <Swatch key={color.hex} hex={color.hex} name={color.name} />)}</div>
        </div>

        {recent.length > 0 && <div className="rte-color-section">
          <h4>استُخدمت مؤخرًا</h4>
          <div className="rte-swatch-row">{recent.map((hex) => <Swatch key={hex} hex={hex} name="لون حديث" />)}</div>
        </div>}

        <div className="rte-color-section rte-color-custom">
          <h4>لون مخصص</h4>
          <div className="rte-custom-row">
            <input type="color" aria-label="اختيار لون مخصص" value={customHex ?? custom} onChange={(event) => { setCustom(event.target.value); setHexText(event.target.value); }} />
            <input type="text" dir="ltr" inputMode="text" maxLength={7} spellCheck={false} aria-label="كود اللون HEX" placeholder="#1555b8" value={hexText} onChange={(event) => setHexText(event.target.value)} />
            <button type="button" className="rte-custom-apply" disabled={!customHex} onClick={() => { if (customHex) { pick(customHex); setOpen(false); } }}>تطبيق</button>
            <button type="button" className={`rte-custom-fav${customIsFavorite ? " is-on" : ""}`} disabled={!customHex} aria-pressed={customIsFavorite} aria-label={customIsFavorite ? "إزالة اللون من المفضلة" : "إضافة اللون إلى المفضلة"} title={customIsFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"} onClick={() => { if (customHex) toggleFavorite(customHex); }}>{customIsFavorite ? "★" : "☆"}</button>
          </div>
        </div>
      </div>}
    </div>
  );
}
