import { addDays, compareAsc, isAfter, isBefore, isEqual } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { getSchedule } from "./loadSchedule";
import { BERKELEY_TIME_ZONE } from "./schema";

export { BERKELEY_TIME_ZONE };

export function currentActivity(pool, now = new Date()) {
  return currentActivities(pool, now)[0] ?? null;
}

export function currentActivities(pool, now = new Date()) {
  const schedule = resolveSchedule(pool);
  if (isClosedToday(schedule, now) || !isWithinSeason(schedule, now)) return [];
  return entriesForDate(schedule, now).filter((entry) =>
    isActiveAt(entry, now),
  );
}

export function nextActivity(pool, now = new Date()) {
  const schedule = resolveSchedule(pool);

  for (let offset = 0; offset < 14; offset += 1) {
    const date = addDays(now, offset);
    if (!isWithinSeason(schedule, date) || closureForDate(schedule, date)) {
      continue;
    }

    const next = entriesForDate(schedule, date)
      .filter((entry) => isAfter(entry.startsAt, now))
      .sort((a, b) => compareAsc(a.startsAt, b.startsAt))[0];

    if (next) return next;
  }

  return null;
}

export function isClosedToday(pool, now = new Date()) {
  return Boolean(closureForDate(resolveSchedule(pool), now));
}

export function closureForDate(pool, date = new Date()) {
  const schedule = resolveSchedule(pool);
  const dateKey = dateKeyInBerkeley(date);
  return schedule.closures.find((closure) => closure.date === dateKey) ?? null;
}

export function upcomingClosures(pool, now = new Date(), days = 14) {
  const schedule = resolveSchedule(pool);
  const startKey = dateKeyInBerkeley(now);
  const endKey = dateKeyInBerkeley(addDays(now, days));
  return schedule.closures
    .filter((closure) => closure.date >= startKey && closure.date <= endKey)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function isWithinSeason(pool, date = new Date()) {
  const schedule = resolveSchedule(pool);
  const dateKey = dateKeyInBerkeley(date);
  return (
    dateKey >= schedule.season.valid_from &&
    dateKey <= schedule.season.valid_through
  );
}

export function entriesForDate(pool, date = new Date()) {
  const schedule = resolveSchedule(pool);
  const dateKey = dateKeyInBerkeley(date);
  const day = dayNameInBerkeley(date);

  return schedule.schedule
    .filter((entry) => entry.day === day)
    .map((entry) => enrichEntry(entry, schedule, dateKey))
    .sort((a, b) => compareAsc(a.startsAt, b.startsAt));
}

export function dateKeyInBerkeley(date = new Date()) {
  return formatInTimeZone(date, BERKELEY_TIME_ZONE, "yyyy-MM-dd");
}

export function dayNameInBerkeley(date = new Date()) {
  return formatInTimeZone(date, BERKELEY_TIME_ZONE, "EEEE");
}

export function timeInBerkeley(date = new Date()) {
  return formatInTimeZone(date, BERKELEY_TIME_ZONE, "HH:mm");
}

function enrichEntry(entry, schedule, dateKey) {
  const startsAt = zonedDateTime(dateKey, entry.start);
  let endsAt = zonedDateTime(dateKey, entry.end);
  if (!isAfter(endsAt, startsAt)) {
    endsAt = addDays(endsAt, 1);
  }

  return {
    ...entry,
    pool: schedule.pool,
    date: dateKey,
    startsAt,
    endsAt,
  };
}

function zonedDateTime(dateKey, time) {
  return fromZonedTime(`${dateKey}T${time}:00`, BERKELEY_TIME_ZONE);
}

function isActiveAt(entry, now) {
  return (
    (isEqual(entry.startsAt, now) || isBefore(entry.startsAt, now)) &&
    isBefore(now, entry.endsAt)
  );
}

function resolveSchedule(pool) {
  if (typeof pool === "string") return getSchedule(pool);
  return pool;
}
