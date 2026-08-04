import { describe, it, expect } from 'vitest';
import { resolvePools } from './loadSchedule';
import { DAY_KEYS, POOL_KEYS } from './types';

/**
 * These tests guard the season changeover. `resolvePools` picks, per pool, the
 * generated schedule whose date range covers the date being rendered — so a bug
 * here means the app quietly serves last season's times.
 */
describe('resolvePools', () => {
  it('serves Summer through the last day it is valid', () => {
    for (const p of POOL_KEYS) {
      expect(resolvePools('2026-08-09')[p].season).toBe('Summer 2026');
    }
  });

  it('switches to Fall the day Fall starts', () => {
    for (const p of POOL_KEYS) {
      expect(resolvePools('2026-08-10')[p].season).toBe('Fall 2026');
    }
  });

  it('stays on Fall through the last day it is valid', () => {
    for (const p of POOL_KEYS) {
      expect(resolvePools('2026-10-11')[p].season).toBe('Fall 2026');
    }
  });

  it('resolves per date, not once at module load', () => {
    // The whole point of resolvePools being a function: two different dates in
    // the same process must give different seasons.
    expect(resolvePools('2026-08-09').king.season).not.toBe(
      resolvePools('2026-08-10').king.season,
    );
  });

  it('gives Fall real, non-empty schedules', () => {
    for (const p of POOL_KEYS) {
      const pool = resolvePools('2026-08-10')[p];
      const slots = Object.values(pool.schedule).flatMap((week) =>
        DAY_KEYS.flatMap((d) => week[d]),
      );
      expect(slots.length).toBeGreaterThan(0);
      for (const s of slots) {
        expect(s.start).toMatch(/^\d{2}:\d{2}$/);
        expect(s.end).toMatch(/^\d{2}:\d{2}$/);
      }
    }
  });

  it('falls back to the most recent season after the last one ends', () => {
    // Past the end of every generated PDF, the UI still needs something to
    // render (it shows a "most recent schedule" caveat alongside it).
    expect(resolvePools('2027-01-01').king.season).toBe('Fall 2026');
  });
});

/**
 * Late-starting programs. Both Fall PDFs say swim lessons skip the opening
 * weeks — but each note covers only *one* group of days ("Weekend Fall Swim
 * Lessons will start September 13" at King, "Weekday ... September 14" at
 * West). The parser has to honour that qualifier: blanking the program on every
 * day of the week would hide sessions that genuinely run.
 */
describe('swim-lesson late starts (Fall 2026)', () => {
  const isBlanked = (pool: 'king' | 'west', dateISO: string) =>
    resolvePools(dateISO)[pool].programClosures['swim-lessons']?.includes(dateISO) ?? false;

  it('hides King weekend lessons until they start on Sept 13', () => {
    expect(isBlanked('king', '2026-09-06')).toBe(true); // Sunday before
    expect(isBlanked('king', '2026-09-13')).toBe(false); // first Sunday they run
  });

  it('hides West weekday lessons until they start on Sept 14', () => {
    expect(isBlanked('west', '2026-09-11')).toBe(true); // Friday before
    expect(isBlanked('west', '2026-09-14')).toBe(false); // first Monday they run
  });

  it('does not blank days the note never covered', () => {
    // King's note is about weekends, so weekdays must stay untouched — and
    // vice-versa at West. This is what a qualifier-blind parser would break.
    expect(isBlanked('king', '2026-08-12')).toBe(false); // a Wednesday
    expect(isBlanked('west', '2026-08-15')).toBe(false); // a Saturday
  });
});
