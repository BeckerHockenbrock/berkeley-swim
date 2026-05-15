"use client";

import { useCallback, useMemo } from "react";
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
  upcomingClosures,
} from "@/lib/now";
import { useNow } from "@/lib/useNow";
import {
  FILTER_KEY,
  FILTER_TIP_KEY,
  POOL_KEY,
  useStoredState,
} from "@/lib/preferences";
import {
  ACTIVITY_FILTERS,
  DEFAULT_ACTIVITY_FILTER,
  entryMatchesFilter,
  isActivityFilterId,
} from "@/lib/filters";

const POOL_FILTERS = [
  { id: "all", label: "All" },
  { id: "king", label: "King" },
  { id: "west", label: "West" },
];

const POOL_IDS = ["all", "king", "west"];

function isPoolFilterId(value) {
  return POOL_IDS.includes(value);
}

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
  const [activePool, setActivePool] = useStoredState(
    POOL_KEY,
    "all",
    isPoolFilterId,
  );
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

      <PoolToggle activePool={activePool} onChange={setActivePool} />

      <ClosureBanner schedules={visibleSchedules} now={now} />

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
  const allSchedules = useMemo(() => getAllSchedules(), []);
  const [activePool, setActivePool] = useStoredState(
    POOL_KEY,
    "all",
    isPoolFilterId,
  );
  const [activeFilter, setActiveFilter] = useStoredState(
    FILTER_KEY,
    DEFAULT_ACTIVITY_FILTER,
    isActivityFilterId,
  );

  const schedules =
    activePool === "all"
      ? allSchedules
      : allSchedules.filter((schedule) => schedule.pool.id === activePool);

  const meta =
    activePool === "all"
      ? "Both pools"
      : activePool === "king"
        ? "King Pool"
        : "West Campus Pool";

  return (
    <>
      <ViewHeader
        title="Today"
        subtitle={formatInTimeZone(now, BERKELEY_TIME_ZONE, "EEEE, MMMM d")}
        meta={meta}
      />

      <Toolbar
        activePool={activePool}
        onPoolChange={setActivePool}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <ClosureBanner schedules={schedules} now={now} />

      <section className="grid gap-4 lg:grid-cols-2">
        {schedules.map((schedule) => (
          <TodayPool
            key={schedule.pool.id}
            schedule={schedule}
            now={now}
            filterId={activeFilter}
          />
        ))}
      </section>
    </>
  );
}

export function WeekView() {
  const now = useNow();
  const allSchedules = useMemo(() => getAllSchedules(), []);
  const [activePool, setActivePool] = useStoredState(
    POOL_KEY,
    "all",
    isPoolFilterId,
  );
  const [activeFilter, setActiveFilter] = useStoredState(
    FILTER_KEY,
    DEFAULT_ACTIVITY_FILTER,
    isActivityFilterId,
  );
  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(now, index)),
    [now],
  );

  const schedules =
    activePool === "all"
      ? allSchedules
      : allSchedules.filter((schedule) => schedule.pool.id === activePool);

  const minWidthClass = schedules.length > 1 ? "min-w-[980px]" : "min-w-[560px]";

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

      <Toolbar
        activePool={activePool}
        onPoolChange={setActivePool}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <ClosureBanner schedules={schedules} now={now} />

      <section className="overflow-x-auto pb-2 print:overflow-visible">
        <div
          className={`grid ${minWidthClass} grid-cols-7 gap-3 print-grid print:min-w-0 print:gap-2`}
        >
          {weekDates.map((date) => (
            <WeekDay
              key={formatInTimeZone(date, BERKELEY_TIME_ZONE, "yyyy-MM-dd")}
              date={date}
              schedules={schedules}
              now={now}
              filterId={activeFilter}
            />
          ))}
        </div>
      </section>
    </>
  );
}

function Toolbar({
  activePool,
  onPoolChange,
  activeFilter,
  onFilterChange,
}) {
  const [tipDismissed, setTipDismissed, tipHydrated] = useStoredState(
    FILTER_TIP_KEY,
    false,
  );
  const showTip = tipHydrated && !tipDismissed && activeFilter === "all";
  const dismissTip = useCallback(() => setTipDismissed(true), [setTipDismissed]);

  return (
    <div className="flex flex-col gap-3 print:hidden">
      <div className="flex flex-wrap items-center gap-3">
        <PoolToggle activePool={activePool} onChange={onPoolChange} />
      </div>
      {showTip ? <FilterTip onDismiss={dismissTip} /> : null}
      <FilterChips
        activeFilter={activeFilter}
        onChange={(id) => {
          onFilterChange(id);
          if (id !== "all") dismissTip();
        }}
      />
    </div>
  );
}

function ClosureBanner({ schedules, now }) {
  const items = schedules.flatMap((schedule) =>
    upcomingClosures(schedule, now, 14).map((closure) => ({
      key: `${schedule.pool.id}-${closure.date}`,
      pool: schedule.pool,
      closure,
    })),
  );

  if (items.length === 0) return null;

  items.sort((a, b) => a.closure.date.localeCompare(b.closure.date));

  return (
    <aside
      className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 print:hidden"
      role="region"
      aria-label="Upcoming pool closures"
    >
      <p className="font-semibold">Upcoming closures (next 14 days)</p>
      <ul className="mt-2 space-y-1">
        {items.map(({ key, pool, closure }) => (
          <li key={key}>
            {pool.name} closed {formatClosureDate(closure.date)} ({closure.reason})
          </li>
        ))}
      </ul>
    </aside>
  );
}

function formatClosureDate(dateKey) {
  const noonUtc = new Date(`${dateKey}T12:00:00Z`);
  return formatInTimeZone(noonUtc, BERKELEY_TIME_ZONE, "EEEE MMMM d");
}

function PoolToggle({ activePool, onChange }) {
  return (
    <div
      className="grid grid-cols-3 rounded-lg border border-slate-200 bg-slate-100 p-1 print:hidden sm:w-fit"
      role="group"
      aria-label="Pool"
    >
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
            onClick={() => onChange(filter.id)}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}

function FilterChips({ activeFilter, onChange }) {
  return (
    <div
      className="-mx-1 flex flex-wrap items-center gap-2 px-1"
      role="group"
      aria-label="Activity filter"
    >
      {ACTIVITY_FILTERS.map((filter) => {
        const selected = activeFilter === filter.id;
        return (
          <button
            key={filter.id}
            type="button"
            className={`min-h-9 rounded-full border px-3 text-sm font-medium transition ${
              selected
                ? "border-pool bg-pool text-white shadow-sm"
                : "border-slate-200 bg-surface text-muted hover:border-slate-300 hover:text-foreground"
            }`}
            aria-pressed={selected}
            onClick={() => onChange(filter.id)}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}

function FilterTip({ onDismiss }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">
      <p>
        <span aria-hidden="true">{"\u{1F4A1} "}</span>
        Tap a chip below to filter by activity.
      </p>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-normal text-sky-800 hover:bg-sky-100"
        aria-label="Dismiss tip"
      >
        Got it
      </button>
    </div>
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
        ) : status.offSeason ? (
          <OffSeasonNotice />
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

function TodayPool({ schedule, now, filterId = "all" }) {
  const closure = closureForDate(schedule, now);
  const inSeason = isWithinSeason(schedule, now);
  const allEntries = entriesForDate(schedule, now);
  const entries = allEntries.filter((entry) =>
    entryMatchesFilter(entry, filterId),
  );
  const filtered = filterId !== "all";

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
          <OffSeasonNotice />
        ) : allEntries.length === 0 ? (
          <ClosedNotice reason="No activities listed today" />
        ) : entries.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-muted">
            {filtered
              ? "No matching sessions today for this filter."
              : "No sessions today."}
          </p>
        ) : (
          entries.map((entry) => (
            <ActivityRow key={entryKey(entry)} entry={entry} now={now} />
          ))
        )}
      </div>
    </article>
  );
}

function WeekDay({ date, schedules, now, filterId = "all" }) {
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
            filterId={filterId}
          />
        ))}
      </div>
    </article>
  );
}

function WeekPoolDay({ schedule, date, now, filterId = "all" }) {
  const closure = closureForDate(schedule, date);
  const inSeason = isWithinSeason(schedule, date);
  const allEntries = entriesForDate(schedule, date);
  const entries = allEntries.filter((entry) =>
    entryMatchesFilter(entry, filterId),
  );
  const filtered = filterId !== "all";

  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-normal text-muted">
        {schedule.pool.id === "king" ? "King" : "West"}
      </h3>
      {closure ? (
        <MiniClosed reason={closure.reason} />
      ) : !inSeason ? (
        <MiniClosed reason="Out of season" />
      ) : allEntries.length === 0 ? (
        <MiniClosed reason="No sessions" />
      ) : entries.length === 0 ? (
        <MiniClosed reason={filtered ? "No matches" : "No sessions"} />
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
  const limitedLanes = hasLimitedLapLanes(entry);
  const extraNote = limitedLanes ? "" : entry.notes;

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
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{entry.activity}</p>
            {limitedLanes ? <LimitedLanesBadge /> : null}
          </div>
          {extraNote ? (
            <p className="mt-0.5 text-sm text-muted">{extraNote}</p>
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
  const limitedLanes = hasLimitedLapLanes(entry);
  const extraNote = limitedLanes ? "" : entry.notes;

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
      {limitedLanes ? (
        <p className="mt-1">
          <LimitedLanesBadge compact />
        </p>
      ) : null}
      {extraNote ? <p className="mt-1 text-muted">{extraNote}</p> : null}
    </div>
  );
}

function LimitedLanesBadge({ compact = false }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-amber-300 bg-amber-100 font-semibold uppercase tracking-normal text-amber-900 ${
        compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"
      }`}
      title="Some lap lanes shared with another activity"
    >
      Limited lap lanes
    </span>
  );
}

function hasLimitedLapLanes(entry) {
  return /limited lap lane/i.test(entry.notes ?? "");
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

function OffSeasonNotice() {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
      <p>Schedule between seasons - check back soon.</p>
      <a
        href="https://berkeleyca.gov"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block font-medium text-pool underline underline-offset-2 hover:text-sky-700"
      >
        Check the City of Berkeley page
      </a>
    </div>
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
      reason: "Schedule between seasons - check back soon",
      offSeason: true,
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
