"use client";

import { useMemo, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { getAllSchedules } from "@/lib/loadSchedule";
import {
  BERKELEY_TIME_ZONE,
  closureForDate,
  currentActivities,
  isWithinSeason,
  nextActivity,
} from "@/lib/now";
import { useNow } from "@/lib/useNow";

const POOL_FILTERS = [
  { id: "all", label: "All" },
  { id: "king", label: "King" },
  { id: "west", label: "West" },
];

export default function Home() {
  const now = useNow();
  const [activePool, setActivePool] = useState("all");
  const loadedAt = useMemo(() => new Date(), []);
  const schedules = useMemo(() => getAllSchedules(), []);
  const visibleSchedules =
    activePool === "all"
      ? schedules
      : schedules.filter((schedule) => schedule.pool.id === activePool);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-surface/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div
              className="grid h-9 w-9 place-items-center rounded-lg bg-pool text-sm font-black text-white"
              aria-hidden="true"
            >
              BS
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">
                Berkeley Swim
              </p>
              <p className="text-sm text-muted">Right now</p>
            </div>
          </div>

          <div className="grid grid-cols-3 rounded-lg border border-slate-200 bg-slate-100 p-1">
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
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-4 py-5 sm:px-6 lg:py-8">
        <section className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
              Pool status
            </h1>
            <p className="mt-1 text-sm text-muted">
              {formatInTimeZone(now, BERKELEY_TIME_ZONE, "EEEE, MMMM d")}
            </p>
          </div>
          <p className="text-sm text-muted">
            Updated {minutesAgo(loadedAt, now)}
          </p>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          {visibleSchedules.map((schedule) => (
            <NowHero key={schedule.pool.id} schedule={schedule} now={now} />
          ))}
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-5 text-sm text-muted sm:px-6">
          Unofficial. Not affiliated with the City of Berkeley. Data scraped
          from berkeleyca.gov.
        </div>
      </footer>
    </div>
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
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-surface shadow-sm">
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
          <span
            className={`rounded-md px-2.5 py-1 text-sm font-semibold ${
              status.open
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            {status.label}
          </span>
        </div>

        <LaneGraphic open={status.open} />

        {status.open ? (
          <div className="space-y-2">
            {current.map((entry) => (
              <ActivityRow key={entryKey(entry)} entry={entry} />
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

function ActivityRow({ entry }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div>
        <p className="font-medium text-foreground">{entry.activity}</p>
        {entry.notes ? (
          <p className="mt-0.5 text-sm text-muted">{entry.notes}</p>
        ) : null}
      </div>
      <p className="shrink-0 text-sm font-semibold text-foreground">
        {formatClock(entry.startsAt)}-{formatClock(entry.endsAt)}
      </p>
    </div>
  );
}

function LaneGraphic({ open }) {
  const accent = open ? "bg-open" : "bg-closed";
  return (
    <div
      className="grid h-16 grid-cols-5 gap-1 rounded-lg border border-slate-200 bg-sky-50 p-2"
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

function nextTimeLabel(entry, now) {
  const today = formatInTimeZone(now, BERKELEY_TIME_ZONE, "yyyy-MM-dd");
  if (entry.date === today) {
    return `at ${formatClock(entry.startsAt)}`;
  }
  return `${formatInTimeZone(entry.startsAt, BERKELEY_TIME_ZONE, "EEE")} at ${formatClock(entry.startsAt)}`;
}

function minutesAgo(start, now) {
  const minutes = Math.max(0, Math.floor((now.getTime() - start.getTime()) / 60000));
  if (minutes === 0) return "less than a minute ago";
  if (minutes === 1) return "1 minute ago";
  return `${minutes} minutes ago`;
}

function formatClock(date) {
  return formatInTimeZone(date, BERKELEY_TIME_ZONE, "h:mm a");
}

function entryKey(entry) {
  return `${entry.pool.id}-${entry.day}-${entry.activity}-${entry.start}-${entry.end}`;
}
