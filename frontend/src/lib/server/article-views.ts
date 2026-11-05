import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Lightweight "most read" counter for the public site.
 *
 * Counts are stored per article per UTC day in a small JSON file so the ranking can use a
 * rolling window (default: last 7 days) and survive process restarts. No database migration is
 * needed. Set ARTICLE_VIEWS_FILE to a path on a mounted volume to keep the counts across container
 * re-creations; otherwise the OS temp directory is used.
 *
 * It is intentionally single-instance: if the site is ever scaled to several Next.js replicas the
 * counter should move to the backend database.
 */
type DayCounts = Record<string, number>; // YYYY-MM-DD -> views
type Store = Record<string, DayCounts>; // articleId -> counts

const FILE = process.env.ARTICLE_VIEWS_FILE || path.join(os.tmpdir(), "jusoor-article-views.json");
const MAX_ARTICLES = 5000;
const KEEP_DAYS = 30;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

let store: Store | null = null;
let loading: Promise<Store> | null = null;
let flushTimer: ReturnType<typeof setTimeout> | null = null;

const dayKey = (date = new Date()) => date.toISOString().slice(0, 10);

async function load(): Promise<Store> {
  if (store) return store;
  loading ??= fs.readFile(FILE, "utf8").then((raw) => {
    const parsed = JSON.parse(raw) as Store;
    return parsed && typeof parsed === "object" ? parsed : {};
  }).catch(() => ({} as Store));
  store = await loading;
  return store;
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(async () => {
    flushTimer = null;
    if (!store) return;
    try {
      await fs.mkdir(path.dirname(FILE), { recursive: true });
      await fs.writeFile(FILE, JSON.stringify(store), "utf8");
    } catch {
      // Counting must never break the site; the next flush will retry.
    }
  }, 4000);
  flushTimer.unref?.();
}

function prune(current: Store) {
  const oldest = dayKey(new Date(Date.now() - KEEP_DAYS * 86_400_000));
  for (const [id, days] of Object.entries(current)) {
    for (const day of Object.keys(days)) if (day < oldest) delete days[day];
    if (Object.keys(days).length === 0) delete current[id];
  }
  const ids = Object.keys(current);
  if (ids.length > MAX_ARTICLES) {
    const totals = ids.map((id) => [id, Object.values(current[id]).reduce((a, b) => a + b, 0)] as const).sort((a, b) => a[1] - b[1]);
    for (const [id] of totals.slice(0, ids.length - MAX_ARTICLES)) delete current[id];
  }
}

export function isArticleId(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

export async function recordArticleView(id: string): Promise<void> {
  if (!isArticleId(id)) return;
  const current = await load();
  const key = id.toLowerCase();
  const days = (current[key] ??= {});
  const today = dayKey();
  days[today] = (days[today] ?? 0) + 1;
  prune(current);
  scheduleFlush();
}

/** Article ids ordered by views in the last `windowDays` days (most read first). */
export async function getMostReadIds(limit = 10, windowDays = 7, excludeId?: string): Promise<string[]> {
  const current = await load();
  const since = dayKey(new Date(Date.now() - (windowDays - 1) * 86_400_000));
  const exclude = excludeId?.toLowerCase();
  return Object.entries(current)
    .map(([id, days]) => [id, Object.entries(days).reduce((sum, [day, count]) => day >= since ? sum + count : sum, 0)] as const)
    .filter(([id, views]) => views > 0 && id !== exclude)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);
}
