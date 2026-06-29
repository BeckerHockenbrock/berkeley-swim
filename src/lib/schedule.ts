import {
  DAY_KEYS,
  type DayKey,
  type IsoDate,
  type PoolSchedule,
  type ProgramMap,
  type ScheduleWindow,
  type Time24,
  type TimeSlot,
} from '../data/types';

export { DAY_KEYS };
export type { DayKey };

/** Maps `Date.getDay()` (Sun=0) onto our Monday-indexed week (Mon=0…Sun=6). */
export function toMondayIndex(jsDay: number): number {
  return (jsDay + 6) % 7;
}

/** `"06:00"` → 360 (minutes since midnight). No regex, no am/pm parsing. */
export function minutesOf(time: Time24): number {
  const [h, m] = time.split(':');
  return Number(h) * 60 + Number(m);
}

/** The current moment, pinned to Berkeley regardless of the device timezone. */
export interface BerkeleyNow {
  /** Monday-indexed day of week (Mon=0…Sun=6). */
  dayIndex: number;
  /** Day key for the schedule lookup. */
  dayKey: DayKey;
  /** Minutes since local midnight in Berkeley. */
  minutes: number;
  /** Calendar date in Berkeley, `YYYY-MM-DD`. */
  dateISO: IsoDate;
}

const BERKELEY_TZ = 'America/Los_Angeles';

const WEEKDAY_INDEX: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

/**
 * Derive the current Berkeley day-of-week, minutes-since-midnight and date.
 *
 * Uses `Intl.DateTimeFormat` with an explicit timezone so a device set to
 * another zone still shows the correct "Happening Now". `now` is injectable for
 * testing.
 */
export function getBerkeleyNow(now: Date = new Date()): BerkeleyNow {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: BERKELEY_TZ,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);

  const get = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((p) => p.type === type)?.value ?? '';

  const dayIndex = WEEKDAY_INDEX[get('weekday')] ?? 0;
  const minutes = Number(get('hour')) * 60 + Number(get('minute'));
  const dateISO = `${get('year')}-${get('month')}-${get('day')}`;

  return { dayIndex, dayKey: DAY_KEYS[dayIndex], minutes, dateISO };
}

export interface ActiveProgram {
  slug: string;
  label: string;
  /** Display range, e.g. `"6:00am–7:30am"`. */
  time: string;
}

export interface NextProgram {
  slug: string;
  label: string;
  /** Display start time, e.g. `"5:30pm"`. */
  time: string;
  /** Start minutes since midnight, used to pick the soonest. */
  minutes: number;
}

export interface HappeningNow {
  active: ActiveProgram[];
  next: NextProgram | null;
}

/**
 * Given a pool's schedule for a specific day and the current minute, return the
 * programs in the water right now and the next one to start. Pure: callers
 * decide whether the selected day actually is today.
 */
export function getHappeningNow(
  poolSchedule: PoolSchedule,
  programs: ProgramMap,
  dayKey: DayKey,
  minutes: number,
): HappeningNow {
  const active: ActiveProgram[] = [];
  let next: NextProgram | null = null;

  for (const [slug, week] of Object.entries(poolSchedule)) {
    const label = programs[slug]?.label ?? slug;

    for (const slot of week[dayKey]) {
      const start = minutesOf(slot.start);
      const end = minutesOf(slot.end);

      if (minutes >= start && minutes < end) {
        active.push({ slug, label, time: formatRange(slot) });
      } else if (start > minutes && (next === null || start < next.minutes)) {
        next = { slug, label, time: formatTime(slot.start), minutes: start };
      }
    }
  }

  return { active, next };
}

export type ScheduleStatus =
  | { kind: 'ok' }
  | { kind: 'upcoming'; validFrom: IsoDate }
  | { kind: 'expired'; validThrough: IsoDate }
  | { kind: 'closed'; date: IsoDate };

/**
 * Decide whether the loaded schedule is safe to trust for `dateISO`:
 * closed today, expired (past `validThrough`), not yet started, or ok.
 */
export function getScheduleStatus(win: ScheduleWindow, dateISO: IsoDate): ScheduleStatus {
  if (win.closedDates.includes(dateISO)) {
    return { kind: 'closed', date: dateISO };
  }
  if (dateISO > win.validThrough) {
    return { kind: 'expired', validThrough: win.validThrough };
  }
  if (dateISO < win.validFrom) {
    return { kind: 'upcoming', validFrom: win.validFrom };
  }
  return { kind: 'ok' };
}

/** `"06:00"` → `"6:00am"`, `"17:30"` → `"5:30pm"`. Display only. */
export function formatTime(time: Time24): string {
  const [hStr, m] = time.split(':');
  const h = Number(hStr);
  const period = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m}${period}`;
}

/** `{start,end}` → `"6:00am–7:30am"`. Display only. */
export function formatRange(slot: TimeSlot): string {
  return `${formatTime(slot.start)}–${formatTime(slot.end)}`;
}

/**
 * Where a single slot sits relative to the current Berkeley moment.
 * `'scheduled'` is used for any day other than today (no live/ended sense).
 */
export type SlotStatus = 'live' | 'upcoming' | 'ended' | 'scheduled';

/**
 * Classify a slot for the schedule card badge. Pure: the caller decides whether
 * the selected day is actually today and supplies the current minute.
 */
export function getSlotStatus(slot: TimeSlot, isToday: boolean, nowMinutes: number): SlotStatus {
  if (!isToday) return 'scheduled';
  const start = minutesOf(slot.start);
  const end = minutesOf(slot.end);
  if (nowMinutes >= start && nowMinutes < end) return 'live';
  if (nowMinutes < start) return 'upcoming';
  return 'ended';
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** `"2026-06-19"` → `"June 19"`. Display only; no timezone math. */
export function formatDate(dateISO: IsoDate): string {
  const [, month, day] = dateISO.split('-');
  return `${MONTHS[Number(month) - 1]} ${Number(day)}`;
}

/**
 * Add `days` calendar days to an ISO date. Pure UTC arithmetic so it never
 * drifts across daylight-saving boundaries. `"2026-12-31" + 1 → "2027-01-01"`.
 */
export function addDaysIso(dateISO: IsoDate, days: number): IsoDate {
  const [y, m, d] = dateISO.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}
