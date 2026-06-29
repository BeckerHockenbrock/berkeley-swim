import catalogJson from './catalog.json';
import { POOL_KEYS, type Catalog, type PoolKey, type PoolSeason, type ResolvedPool } from './types';
import { getBerkeleyNow } from '../lib/schedule';

/**
 * Single source of truth for the app's data.
 *
 * - Static content (program descriptions, lessons, passes) lives in
 *   `catalog.json` and is hand-maintained.
 * - Schedules live in `schedules/<pool>-<season>.json`, each generated from a
 *   City PDF by `scripts/parse_schedules.py`. We load every one and pick, per
 *   pool, the schedule whose date range covers today (Berkeley time) — so King
 *   and West can be on different seasons during a changeover.
 */
const catalog = catalogJson as Catalog;

export const programs = catalog.programs;
export const lessons = catalog.lessons;
export const passes = catalog.passes;

// Eagerly import every generated schedule. Adding a PDF (→ a new JSON) is picked
// up here automatically with no code change.
const modules = import.meta.glob('./schedules/*.json', { eager: true }) as Record<
  string,
  { default: PoolSeason }
>;
const seasons: PoolSeason[] = Object.values(modules).map((m) => m.default);

const byDate = (a: string, b: string) => a.localeCompare(b);

function resolvePool(pool: PoolKey, todayISO: string): ResolvedPool {
  const mine = seasons.filter((s) => s.pool === pool);
  if (mine.length === 0) {
    throw new Error(`No schedule found for ${pool}. Did the parser run over pdfs/?`);
  }
  const active = mine
    .filter((s) => s.validFrom <= todayISO && todayISO <= s.validThrough)
    .sort((a, b) => byDate(b.validFrom, a.validFrom)); // most-recently-started wins
  const upcoming = mine
    .filter((s) => s.validFrom > todayISO)
    .sort((a, b) => byDate(a.validFrom, b.validFrom)); // soonest first
  const past = [...mine].sort((a, b) => byDate(b.validThrough, a.validThrough)); // most recent

  const chosen = active[0] ?? upcoming[0] ?? past[0];
  return {
    label: chosen.poolLabel,
    address: chosen.address,
    season: chosen.season,
    validFrom: chosen.validFrom,
    validThrough: chosen.validThrough,
    lastUpdated: chosen.lastUpdated,
    closedDates: chosen.closedDates,
    programClosures: chosen.programClosures ?? {},
    source: chosen.source,
    schedule: chosen.schedule,
  };
}

const today = getBerkeleyNow().dateISO;

export const pools = Object.fromEntries(
  POOL_KEYS.map((p) => [p, resolvePool(p, today)]),
) as Record<PoolKey, ResolvedPool>;
