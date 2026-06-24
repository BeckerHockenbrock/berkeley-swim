/**
 * Type definitions for the Berkeley Swim data contract.
 *
 * `schedule.json` conforms to {@link ScheduleData}. This is the schema the
 * future PDF parser must emit. Keep this file and `schedule.json` in sync —
 * the typed loader validates one against the other at compile time.
 */

/** ISO calendar date, `YYYY-MM-DD` (e.g. `"2026-06-24"`). */
export type IsoDate = string;

/** 24-hour wall-clock time, `HH:MM` (e.g. `"06:00"`, `"17:30"`). */
export type Time24 = string;

export const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
export type DayKey = (typeof DAY_KEYS)[number];

export const POOL_KEYS = ['king', 'west'] as const;
export type PoolKey = (typeof POOL_KEYS)[number];

export interface Meta {
  /** Human-readable season label, e.g. `"Summer 2026"`. */
  season: string;
  /** First date this schedule is in effect. */
  validFrom: IsoDate;
  /** Last date this schedule is in effect. */
  validThrough: IsoDate;
  /** Date the data was last confirmed/edited. */
  lastUpdated: IsoDate;
  /** IANA timezone the pools operate in. Always `"America/Los_Angeles"`. */
  timezone: string;
  /** Dates the pools are fully closed (holidays, maintenance). */
  closedDates: IsoDate[];
  /** Official City of Berkeley source page for each pool. */
  sources: Record<PoolKey, string>;
}

/** Program metadata, keyed by slug in {@link ScheduleData.programs}. */
export interface ProgramInfo {
  label: string;
  description: string;
  ages: string;
  cost: string;
  /** `false` until the value has been checked against the official catalog. */
  verified: boolean;
}

export type ProgramMap = Record<string, ProgramInfo>;

/** A single time slot. Replaces the old `"6:00am–7:30am**"` string format. */
export interface TimeSlot {
  start: Time24;
  end: Time24;
  /** `true` replaces the legacy `**` marker (limited lanes / space). */
  limited?: boolean;
}

/** One program's week, keyed by day. Every day key is always present. */
export type WeekSchedule = Record<DayKey, TimeSlot[]>;

/** A pool's full schedule, keyed by program slug. */
export type PoolSchedule = Record<string, WeekSchedule>;

export interface Pool {
  label: string;
  address: string;
  schedule: PoolSchedule;
}

export interface Lesson {
  level: string;
  title: string;
  description: string;
  prereq: string;
  cost: string;
  enrollLink: string;
}

export type LessonCategory = 'learn-to-swim' | 'preschool';
export type Lessons = Record<LessonCategory, Lesson[]>;

/** `null` means the price has not been confirmed yet → render "price to confirm". */
export type PassPrice = { resident: string; nonResident: string } | null;

export interface Pass {
  name: string;
  description: string;
  price: PassPrice;
  featured: boolean;
  /** `false` until the value has been checked against the official catalog. */
  verified: boolean;
  link: string;
}

export interface ScheduleData {
  meta: Meta;
  programs: ProgramMap;
  pools: Record<PoolKey, Pool>;
  lessons: Lessons;
  passes: Pass[];
}
