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
