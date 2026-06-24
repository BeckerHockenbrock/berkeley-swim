import { describe, it, expect } from 'vitest';
import {
  DAY_KEYS,
  formatSlot,
  formatTime,
  getBerkeleyNow,
  getHappeningNow,
  getScheduleStatus,
} from './schedule';
import type { Meta, PoolSchedule, ProgramMap, TimeSlot, WeekSchedule } from '../data/types';

/** Build a week with the given Monday slots and every other day empty. */
function weekWithMonday(mon: TimeSlot[]): WeekSchedule {
  const week = {} as WeekSchedule;
  for (const day of DAY_KEYS) week[day] = [];
  week.mon = mon;
  return week;
}

const programs: ProgramMap = {
  'lap-swim': { label: 'Lap Swim', description: '', ages: '', cost: '', verified: false },
  'community-swim': { label: 'Community Swim', description: '', ages: '', cost: '', verified: false },
};

const poolSchedule: PoolSchedule = {
  'lap-swim': weekWithMonday([
    { start: '06:00', end: '07:30', limited: true },
    { start: '17:30', end: '20:30' },
  ]),
  'community-swim': weekWithMonday([{ start: '13:00', end: '15:00' }]),
};

const meta: Meta = {
  season: 'Summer 2026',
  validFrom: '2026-06-08',
  validThrough: '2026-08-09',
  lastUpdated: '2026-06-24',
  timezone: 'America/Los_Angeles',
  closedDates: ['2026-06-19', '2026-07-03'],
  sources: { king: '', west: '' },
};

describe('getBerkeleyNow', () => {
  it('pins to Berkeley regardless of the supplied instant being UTC', () => {
    // 2026-06-24 00:30 PDT (UTC-7) — a Wednesday.
    const now = getBerkeleyNow(new Date('2026-06-24T07:30:00Z'));
    expect(now.dateISO).toBe('2026-06-24');
    expect(now.dayKey).toBe('wed');
    expect(now.dayIndex).toBe(2);
    expect(now.minutes).toBe(30);
  });

  it('rolls back to the previous Berkeley day when UTC has already ticked over', () => {
    // 2026-06-24 05:00 UTC is still 2026-06-23 22:00 in Berkeley.
    const now = getBerkeleyNow(new Date('2026-06-24T05:00:00Z'));
    expect(now.dateISO).toBe('2026-06-23');
    expect(now.dayKey).toBe('tue');
    expect(now.minutes).toBe(22 * 60);
  });
});

describe('getHappeningNow', () => {
  it('detects the program in the water right now', () => {
    const { active } = getHappeningNow(poolSchedule, programs, 'mon', 7 * 60); // 07:00
    expect(active).toHaveLength(1);
    expect(active[0].label).toBe('Lap Swim');
    expect(active[0].time).toBe('6:00am–7:30am'); // no ** in happening-now
  });

  it('detects the next program when nothing is active yet', () => {
    const { active, next } = getHappeningNow(poolSchedule, programs, 'mon', 10 * 60); // 10:00
    expect(active).toHaveLength(0);
    expect(next).not.toBeNull();
    expect(next?.label).toBe('Community Swim');
    expect(next?.time).toBe('1:00pm');
  });

  it('picks the soonest upcoming slot across programs', () => {
    const { next } = getHappeningNow(poolSchedule, programs, 'mon', 0); // midnight
    expect(next?.label).toBe('Lap Swim'); // 06:00 beats 13:00 and 17:30
    expect(next?.time).toBe('6:00am');
  });

  it('returns nothing active and no next after the last slot', () => {
    const { active, next } = getHappeningNow(poolSchedule, programs, 'mon', 22 * 60); // 22:00
    expect(active).toHaveLength(0);
    expect(next).toBeNull();
  });

  it('treats an empty day as no programs', () => {
    const { active, next } = getHappeningNow(poolSchedule, programs, 'tue', 12 * 60);
    expect(active).toHaveLength(0);
    expect(next).toBeNull();
  });
});

describe('getScheduleStatus', () => {
  it('is ok within the valid range', () => {
    expect(getScheduleStatus(meta, '2026-07-01')).toEqual({ kind: 'ok' });
  });

  it('flags dates after validThrough as expired', () => {
    expect(getScheduleStatus(meta, '2026-08-10')).toEqual({
      kind: 'expired',
      validThrough: '2026-08-09',
    });
  });

  it('flags a closed date even when inside the valid range', () => {
    expect(getScheduleStatus(meta, '2026-06-19')).toEqual({
      kind: 'closed',
      date: '2026-06-19',
    });
  });

  it('flags dates before validFrom as upcoming', () => {
    expect(getScheduleStatus(meta, '2026-06-01')).toEqual({
      kind: 'upcoming',
      validFrom: '2026-06-08',
    });
  });
});

describe('formatters', () => {
  it('formats 24h times into am/pm', () => {
    expect(formatTime('06:00')).toBe('6:00am');
    expect(formatTime('17:30')).toBe('5:30pm');
    expect(formatTime('00:15')).toBe('12:15am');
    expect(formatTime('12:00')).toBe('12:00pm');
  });

  it('appends ** only for limited slots', () => {
    expect(formatSlot({ start: '06:00', end: '07:30', limited: true })).toBe('6:00am–7:30am**');
    expect(formatSlot({ start: '07:30', end: '09:30' })).toBe('7:30am–9:30am');
  });
});
