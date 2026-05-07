"use client";

import { useMemo, useState } from "react";
import { addDays, compareAsc, isBefore, isEqual } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { getAllSchedules } from "@/lib/loadSchedule";
import {
  BERKELEY_TIME_ZONE,
  closureForDate,
  currentActivities,
  entriesForDate,
  isWithinSeason,
  nextActivity,
} from "@/lib/now";
import { useNow } from "@/lib/useNow";

const POOL_FILTERS = [
  { id: "all", label: "All" },
  { id: "king", label: "King" },
  { id: "west", label: "West" },
];

const ACTIVITY_STYLES = [
  {
    match: /lap/i,
    block: "border-sky-200 bg-sky-50 text-sky-900",
    stripe: "bg-pool",
  },
  {
    match: /family|recreation/i,
    block: "border-emerald-200 bg-emerald-50 text-emerald-900",
    stripe: "bg-open",
  },
  {
    match: /lesson|barracuda|masters/i,
    block: "border-violet-200 bg-violet-50 text-violet-900",
    stripe: "bg-violet-500",
  },
  {
    match: /zumba|exercise|senior/i,
    block: "border-amber-200 bg-amber-50 text-amber-950",
    stripe: "bg-amber-500",
  },
];

const DEFAULT_ACTIVITY_STYLE = {
  block: "border-slate-200 bg-slate-50 text-slate-900",
  stripe: "bg-slate-400",
};

export function NowView() {
  const now = useNow();
  const [activePool, setActivePool] = useState("all");
  const loadedAt = useMemo(() => new Date(), []);
  const schedules = useMemo(() => getAllSchedules(), []);
  const visibleSchedules =
    activePool === "all"
      ? schedules
      : schedules.filter((schedule) => schedule.pool.id === activePool);

  return (
    <>
      <ViewHeader
        title="Pool status"
        subtitle={formatInTimeZone(now, BERKELEY_TIME_ZONE, "EEEE, MMMM d")}
        meta={`Updated ${minutesAgo(loadedAt, now)}`}
      />

      <div className="grid grid-cols-3 rounded-lg border border-slate-200 bg-slate-100 p-1 print:hidden sm:w-fit">
        {POOL_FILTERS.map((filter) => {
          const selected = activePool === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              className={`min-h-9 rounded-md px-4 text-sm font-medium transition ${
                selected
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
              aria-pressed={selected}
              onClick={() => setActivePool(filter.id)}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        {visibleSchedules.map((schedule) => (
          <NowHero key={schedule.pool.id} schedule={schedule} now={now} />
        ))}
      </section>
    </>
  );
}

export function TodayView() {
  const now = useNow();
  const schedules = useMemo(() => getAllSchedules(), []);

  return (
    <>
      <ViewHeader
        title="Today"
        subtitle={formatInTimeZone(now, BERKELEY_TIME_ZONE, "EEEE, MMMM d")}
        meta="Both pools"
      />

      <section className="grid gap-4 lg:grid-cols-2">
        {schedules.map((schedule) => (
          <TodayPool key={schedule.pool.id} schedule={schedule} now={now} />
        ))}
      </section>
    </>
  );
}

export function WeekView() {
  const now = useNow();
  const schedules = useMemo(() => getAllSchedules(), []);
  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(now, index)),
    [now],
  );

  return (
    <>
      <ViewHeader
        title="Week"
        subtitle={`${formatInTimeZone(
          weekDates[0],
          BERKELEY_TIME_ZONE,
          "MMM d",
        )} - ${formatInTimeZone(
          weekDates[6],
          BERKELEY_TIME_ZONE,
          "MMM d",
        )}`}
        meta="Next 7 days"
      />

      <section className="overflow-x-auto pb-2 print:overflow-visible">
        <div className="grid min-w-[980px] grid-cols-7 gap-3 print-grid print:min-w-0 print:gap-2">
          {weekDates.map((date) => (
            <WeekDay
              key={formatInTimeZone(date, BERKELEY_TIME_ZONE, "yyyy-MM-dd")}
              date={date}
              schedules={schedules}
              now={now}
            />
          ))}
        </div>
      </section>
    </>
  );
}

function ViewHeader({ title, subtitle, meta }) {
  return (
    <section className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between print:mb-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal text-foreground sm:text-3xl print:text-2xl">
          {title}
        </h1>
        <p className="mt-1 text-sm text-muted">{subtitle}</p>
      </div>
      {meta ? <p className="text-sm text-muted">{meta}</p> : null}
    </section>
  );
}

function NowHero({ schedule, now }) {
  const current = currentActivities(schedule, now);
  const next = nextActivity(schedule, now);
  const closure = closureForDate(schedule, now);
  const inSeason = isWithinSeason(schedule, now);
  const status = getStatus({ current, closure, inSeason });
  const primary = current[0];

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-surface shadow-sm print:break-inside-avoid print:shadow-none">
      <div
        className={`h-2 ${status.open ? "bg-open" : "bg-closed"}`}
        aria-hidden="true"
      />
      <div className="flex min-h-64 flex-col gap-5 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted">
              {schedule.pool.name}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal text-foreground">
              {status.open
                ? `${primary.activity} until ${formatClock(primary.endsAt)}`
                : "Closed"}
            </h2>
          </div>
          <StatusBadge open={status.open} label={status.label} />
        </div>

        <LaneGraphic open={status.open} />

        {status.open ? (
          <div className="space-y-2">
            {current.map((entry) => (
              <ActivityRow key={entryKey(entry)} entry={entry} now={now} />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            {status.reason}
          </p>
        )}

        <div className="mt-auto border-t border-slate-200 pt-4">
          <p className="text-sm font-medium text-muted">Next up</p>
          <p className="mt-1 text-base font-semibold text-foreground">
            {next
              ? `${next.activity} ${nextTimeLabel(next, now)}`
              : "No upcoming sessions in this schedule"}
          </p>
        </div>
      </div>
    </article>
  );
}

function TodayPool({ schedule, now }) {
  const closure = closureForDate(schedule, now);
  const inSeason = isWithinSeason(schedule, now);
  const entries = entriesForDate(schedule, now);

  return (
    <article className="rounded-lg border border-slate-200 bg-surface shadow-sm print:break-inside-avoid print:shadow-none">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {schedule.pool.name}
          </h2>
          <p className="mt-1 text-sm text-muted">{schedule.pool.address}</p>
        </div>
        <StatusBadge
          open={!closure && inSeason && currentActivities(schedule, now).length > 0}
          label={
            closure || !inSeason
              ? "Closed"
              : currentActivities(schedule, now).length > 0
                ? "Open"
                : "Quiet"
          }
        />
      </div>

      <div className="space-y-3 p-4">
        {closure ? (
          <ClosedNotice reason={closure.reason} />
        ) : !inSeason ? (
          <ClosedNotice reason="outside the current season" />
        ) : entries.length === 0 ? (
          <ClosedNotice reason="No activities listed today" />
        ) : (
          entries.map((entry) => (
            <ActivityRow key={entryKey(entry)} entry={entry} now={now} />
          ))
        )}
      </div>
    </article>
  );
}

function WeekDay({ date, schedules, now }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-surface print:break-inside-avoid">
      <div className="border-b border-slate-200 p-3">
        <h2 className="text-sm font-semibold text-foreground">
          {formatInTimeZone(date, BERKELEY_TIME_ZONE, "EEE")}
        </h2>
        <p className="text-xs text-muted">
          {formatInTimeZone(date, BERKELEY_TIME_ZONE, "MMM d")}
        </p>
      </div>
      <div className="space-y-4 p-3">
        {schedules.map((schedule) => (
          <WeekPoolDay
            key={`${schedule.pool.id}-${formatInTimeZone(
              date,
              BERKELEY_TIME_ZONE,
              "yyyy-MM-dd",
            )}`}
            schedule={schedule}
            date={date}
            now={now}
          />
        ))}
      </div>
    </article>
  );
}

function WeekPoolDay({ schedule, date, now }) {
  const closure = closureForDate(schedule, date);
  const inSeason = isWithinSeason(schedule, date);
  const entries = entriesForDate(schedule, date);

  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-normal text-muted">
        {schedule.pool.id === "king" ? "King" : "West"}
      </h3>
      {closure ? (
        <MiniClosed reason={closure.reason} />
      ) : !inSeason ? (
        <MiniClosed reason="Out of season" />
      ) : entries.length === 0 ? (
        <MiniClosed reason="No sessions" />
      ) : (
        entries.map((entry) => (
          <ActivityBlock key={entryKey(entry)} entry={entry} now={now} />
        ))
      )}
    </section>
  );
}

function ActivityRow({ entry, now }) {
  const active = isEntryActive(entry, now);
  const past = isEntryPast(entry, now);
  const style = activityStyle(entry.activity);

  return (
    <div
      className={`relative overflow-hidden rounded-lg border p-3 ${
        active
          ? "border-open bg-emerald-50 shadow-sm"
          : past
            ? "border-slate-200 bg-slate-50 text-slate-500"
            : style.block
      }`}
    >
      <div
        className={`absolute inset-y-0 left-0 w-1 ${active ? "bg-open" : style.stripe}`}
        aria-hidden="true"
      />
      <div className="flex items-start justify-between gap-3 pl-1">
        <div className={past ? "line-through decoration-slate-400" : ""}>
          <p className="font-medium">{entry.activity}</p>
          {entry.notes ? (
            <p className="mt-0.5 text-sm text-muted">{entry.notes}</p>
          ) : null}
        </div>
        <p
          className={`shrink-0 text-sm font-semibold ${
            past ? "line-through decoration-slate-400" : ""
          }`}
        >
          {formatClock(entry.startsAt)}-{formatClock(entry.endsAt)}
        </p>
      </div>
      {active ? (
        <p className="mt-2 pl-1 text-xs font-semibold uppercase tracking-normal text-emerald-700">
          Happening now
        </p>
      ) : null}
    </div>
  );
}

function ActivityBlock({ entry, now }) {
  const active = isEntryActive(entry, now);
  const past = isEntryPast(entry, now);
  const style = activityStyle(entry.activity);

  return (
    <div
      className={`rounded-md border p-2 text-xs ${
        active
          ? "border-open bg-emerald-50 text-emerald-950 ring-2 ring-emerald-200"
          : past
            ? "border-slate-200 bg-slate-50 text-slate-500"
            : style.block
      }`}
    >
      <p className={`font-semibold ${past ? "line-through" : ""}`}>
        {entry.activity}
      </p>
      <p className={past ? "mt-1 line-through" : "mt-1"}>
        {formatClock(entry.startsAt)}-{formatClock(entry.endsAt)}
      </p>
      {entry.notes ? <p className="mt-1 text-muted">{entry.notes}</p> : null}
    </div>
  );
}

function StatusBadge({ open, label }) {
  return (
    <span
      className={`rounded-md px-2.5 py-1 text-sm font-semibold ${
        open ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
      }`}
    >
      {label}
    </span>
  );
}

function ClosedNotice({ reason }) {
  return (
    <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
      Closed: {reason}
    </p>
  );
}

function MiniClosed({ reason }) {
  return (
    <p className="rounded-md border border-slate-200 bg-slate-50 p-2 text-xs text-muted">
      {reason}
    </p>
  );
}

function LaneGraphic({ open }) {
  const accent = open ? "bg-open" : "bg-closed";
  return (
    <div
      className="grid h-16 grid-cols-5 gap-1 rounded-lg border border-slate-200 bg-sky-50 p-2 print:hidden"
      aria-hidden="true"
    >
      {[0, 1, 2, 3, 4].map((lane) => (
        <div key={lane} className="relative overflow-hidden rounded-md bg-white">
          <div className={`absolute inset-x-0 top-1 h-1 ${accent}`} />
          <div className="absolute inset-x-0 top-1/2 h-px bg-sky-200" />
          <div className={`absolute inset-x-0 bottom-1 h-1 ${accent}`} />
        </div>
      ))}
    </div>
  );
}

function getStatus({ current, closure, inSeason }) {
  if (closure) {
    return {
      open: false,
      label: "Closed",
      reason: closure.reason,
    };
  }

  if (!inSeason) {
    return {
      open: false,
      label: "Closed",
      reason: "outside the current season",
    };
  }

  if (current.length === 0) {
    return {
      open: false,
      label: "Closed",
      reason: "outside operating hours",
    };
  }

  return {
    open: true,
    label: "Open",
    reason: "",
  };
}

function activityStyle(activity) {
  return (
    ACTIVITY_STYLES.find((style) => style.match.test(activity)) ??
    DEFAULT_ACTIVITY_STYLE
  );
}

function isEntryActive(entry, now) {
  return (
    (isEqual(entry.startsAt, now) || isBefore(entry.startsAt, now)) &&
    isBefore(now, entry.endsAt)
  );
}

function isEntryPast(entry, now) {
  return isBefore(entry.endsAt, now) || isEqual(entry.endsAt, now);
}

function nextTimeLabel(entry, now) {
  const today = formatInTimeZone(now, BERKELEY_TIME_ZONE, "yyyy-MM-dd");
  if (entry.date === today) {
    return `at ${formatClock(entry.startsAt)}`;
  }
  return `${formatInTimeZone(entry.startsAt, BERKELEY_TIME_ZONE, "EEE")} at ${formatClock(entry.startsAt)}`;
}

function minutesAgo(start, now) {
  const minutes = Math.max(
    0,
    Math.floor((now.getTime() - start.getTime()) / 60000),
  );
  if (minutes === 0) return "less than a minute ago";
  if (minutes === 1) return "1 minute ago";
  return `${minutes} minutes ago`;
}

function formatClock(date) {
  return formatInTimeZone(date, BERKELEY_TIME_ZONE, "h:mm a");
}

function entryKey(entry) {
  return `${entry.pool.id}-${entry.date}-${entry.day}-${entry.activity}-${entry.start}-${entry.end}`;
}
