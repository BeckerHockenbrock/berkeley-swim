import { useMemo, useState, useEffect } from 'react';
import { ChevronDown, Tag, MapPin, CalendarOff, ArrowRight } from 'lucide-react';
import { resolvePools, programs } from '../data/loadSchedule';
import {
  DAY_KEYS,
  addDaysIso,
  formatDate,
  formatRange,
  formatTime,
  getBerkeleyNow,
  getScheduleStatus,
  getSlotStatus,
  minutesOf,
  type SlotStatus,
} from '../lib/schedule';
import { programIcon } from '../lib/programIcons';
import { POOL_KEYS, type DayKey, type PoolKey, type TimeSlot } from '../data/types';

const DAY_ABBR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

type ViewTab = 'king' | 'happening' | 'west';

interface Row {
  key: string;
  slug: string;
  label: string;
  slot: TimeSlot;
  status: SlotStatus;
  ages: string;
  cost: string;
  desc: string;
}

const STATUS_PILL: Record<SlotStatus, { text: string; cls: string } | null> = {
  live: { text: 'Open now', cls: 'is-live' },
  upcoming: { text: 'Upcoming', cls: 'is-upcoming' },
  ended: { text: 'Ended', cls: 'is-ended' },
  scheduled: null,
};

interface ScheduleTabProps {
  overrideDate?: Date | null;
}

export function ScheduleTab({ overrideDate }: ScheduleTabProps = {}) {
  const now = getBerkeleyNow(overrideDate ?? undefined);
  const pools = useMemo(() => resolvePools(now.dateISO), [now.dateISO]);
  const [activeTab, setActiveTab] = useState<ViewTab>('happening');
  const [pool, setPool] = useState<PoolKey>('king');
  const [day, setDay] = useState<number>(now.dayIndex);
  const [activity, setActivity] = useState<string>('all');
  const [openKey, setOpenKey] = useState<string | null>(null);

  useEffect(() => {
    setDay(now.dayIndex);
    setActivity('all');
    setOpenKey(null);
  }, [now.dayIndex]);

  const showPoolSchedule = (poolKey: PoolKey) => {
    setPool(poolKey);
    setActiveTab(poolKey === 'king' ? 'king' : 'west');
    setActivity('all');
    setOpenKey(null);
  };

  const showDay = (dayIndex: number) => {
    setDay(dayIndex);
    setActivity('all');
    setOpenKey(null);
  };

  const buildRows = useMemo(() => {
    return (poolKey: PoolKey, dKey: DayKey, dateISO: string, isToday: boolean): Row[] => {
      const sched = pools[poolKey].schedule;
      const closures = pools[poolKey].programClosures;
      const rows: Row[] = [];
      for (const [slug, week] of Object.entries(sched)) {
        if (closures[slug]?.includes(dateISO)) continue; // program cancelled this date
        const info = programs[slug];
        week[dKey].forEach((slot, i) => {
          rows.push({
            key: `${poolKey}-${slug}-${i}`,
            slug,
            label: info?.label ?? slug,
            slot,
            status: getSlotStatus(slot, isToday, now.minutes),
            ages: info?.ages ?? '—',
            cost: info?.cost ?? 'See catalog',
            desc: info?.description ?? 'Description coming soon.',
          });
        });
      }
      return rows.sort((a, b) => minutesOf(a.slot.start) - minutesOf(b.slot.start));
    };
  }, [pools, now.minutes]);

  // The next opening for a pool: an upcoming slot later today, or — if the pool
  // is done/closed for the day — the first session on the next open day. Skips
  // fully-closed dates (holidays) entirely.
  const findNextOpen = (pk: PoolKey) => {
    for (let offset = 0; offset <= 7; offset++) {
      const dayIndex = (now.dayIndex + offset) % 7;
      const dateISO = addDaysIso(now.dateISO, offset);
      if (dateISO > pools[pk].validThrough) break; // don't roll past the season end
      if (pools[pk].closedDates.includes(dateISO)) continue;
      const dayRows = buildRows(pk, DAY_KEYS[dayIndex], dateISO, offset === 0);
      const cand = offset === 0 ? dayRows.find((r) => r.status === 'upcoming') : dayRows[0];
      if (cand) return { row: cand, offset, dayIndex };
    }
    return null;
  };

  // Happening Now is always "right now" at both pools, independent of the
  // pool/day chosen below.
  const liveByPool = POOL_KEYS.map((pk) => {
    const status = getScheduleStatus(pools[pk], now.dateISO);
    const inRange = status.kind === 'ok' || status.kind === 'closed';
    const live =
      status.kind === 'ok'
        ? buildRows(pk, now.dayKey, now.dateISO, true).filter((r) => r.status === 'live')
        : [];
    return { poolKey: pk, label: pools[pk].label, status, live, nextOpen: inRange ? findNextOpen(pk) : null };
  });

  const anyPoolOpen = liveByPool.some((p) => p.live.length > 0);

  const nextDayLabel = (offset: number, dayIndex: number) =>
    offset === 0 ? 'today' : offset === 1 ? 'tomorrow' : DAY_FULL[dayIndex];

  // Schedule list: the selected pool + selected day.
  const dayKey = DAY_KEYS[day];
  const isToday = day === now.dayIndex;
  const selectedDateISO = addDaysIso(now.dateISO, day - now.dayIndex);
  const scheduleRows = buildRows(pool, dayKey, selectedDateISO, isToday);

  const activitiesForDay = useMemo(() => {
    const seen = new Map<string, string>();
    for (const r of scheduleRows) if (!seen.has(r.slug)) seen.set(r.slug, r.label);
    return [...seen.entries()];
  }, [scheduleRows]);

  const rows = activity === 'all' ? scheduleRows : scheduleRows.filter((r) => r.slug === activity);
  const headingDay = isToday ? 'Today' : DAY_FULL[day];

  // Freshness of the SELECTED pool's schedule (not a global claim).
  const poolStatus = getScheduleStatus(pools[pool], now.dateISO);
  const freshnessNote =
    poolStatus.kind === 'expired'
      ? `Showing ${pools[pool].label}'s most recent schedule (${pools[pool].season}) — confirm today's times on the official catalog.`
      : poolStatus.kind === 'upcoming'
        ? `${pools[pool].label}'s ${pools[pool].season} schedule starts ${formatDate(poolStatus.validFrom)}.`
        : null;

  return (
    <section className="schedule-shell" aria-label="Berkeley pool schedules">
      {activeTab === 'happening' && (
        <div className="schedule-view schedule-view-now">
          <header className="view-heading">
            <div>
              <p className="view-eyebrow">Berkeley pools</p>
              <h2>Happening now</h2>
            </div>
            <div
              className={`live-status ${anyPoolOpen ? 'has-live-sessions' : 'is-quiet'}`}
              aria-live="polite"
            >
              <span className="live-status-dot" aria-hidden="true" />
              <span>{anyPoolOpen ? 'Sessions in progress' : 'No sessions in progress'}</span>
            </div>
          </header>

          <div className="pool-overview-grid">
            {liveByPool.map(({ poolKey, label, status, live, nextOpen }) => (
              <article key={poolKey} className="pool-overview-card">
                <header className="pool-card-header">
                  <div className="pool-card-title">
                    <MapPin size={16} aria-hidden="true" />
                    <h3>{label}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => showPoolSchedule(poolKey)}
                    className="pool-card-action pressable focus-ring"
                    aria-label={`View ${label} schedule`}
                  >
                    <span>View schedule</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </button>
                </header>

                <div className="pool-card-content">
                  {live.length > 0 ? (
                    live.map((r) => <HeroCard key={r.key} row={r} />)
                  ) : status.kind === 'upcoming' ? (
                    <div className="pool-state-card is-upcoming">
                      <CalendarOff size={18} aria-hidden="true" />
                      <p>{pools[poolKey].season} schedule starts {formatDate(status.validFrom)}.</p>
                    </div>
                  ) : status.kind === 'expired' ? (
                    <div className="pool-state-card is-expired">
                      <CalendarOff size={18} aria-hidden="true" />
                      <p>No current schedule. Check the official catalog for the latest times.</p>
                    </div>
                  ) : nextOpen && nextOpen.offset > 0 ? (
                    <div className="pool-state-card is-closed">
                      <div className="pool-state-label">
                        <CalendarOff size={15} aria-hidden="true" />
                        <span>{status.kind === 'closed' ? 'Closed today' : 'Closed for the day'}</span>
                      </div>
                      <p>
                        Next: <strong>{nextOpen.row.label}</strong>{' '}
                        {nextDayLabel(nextOpen.offset, nextOpen.dayIndex)}
                        <span> · {formatTime(nextOpen.row.slot.start)}</span>
                      </p>
                    </div>
                  ) : nextOpen ? (
                    <div className="pool-state-card is-next">
                      <p>
                        Next: <strong>{nextOpen.row.label}</strong>
                        <span> · {formatTime(nextOpen.row.slot.start)}</span>
                      </p>
                    </div>
                  ) : (
                    <div className="pool-state-card is-empty">
                      <CalendarOff size={18} aria-hidden="true" />
                      <p>No upcoming sessions this week.</p>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {(activeTab === 'king' || activeTab === 'west') && (
        <div className="schedule-view schedule-view-pool">
          <header className="view-heading view-heading-schedule">
            <div>
              <p className="view-eyebrow">Daily schedule</p>
              <h2>{pools[pool].label}</h2>
              <p className="view-subheading">{headingDay}</p>
            </div>
          </header>

          <div className="schedule-controls">
            <div className="day-strip" role="group" aria-label="Choose a day">
              {DAY_ABBR.map((label, dayIndex) => {
                const selected = day === dayIndex;
                const today = dayIndex === now.dayIndex;
                return (
                  <button
                    key={dayIndex}
                    type="button"
                    onClick={() => showDay(dayIndex)}
                    aria-pressed={selected}
                    aria-label={`${DAY_FULL[dayIndex]}${today ? ', today' : ''}`}
                    className={`day-button pressable focus-ring ${selected ? 'is-selected' : ''} ${today ? 'is-today' : ''}`}
                  >
                    <span>{label}</span>
                    {today && <span className="today-dot" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>

            {activitiesForDay.length > 1 && (
              <div className="activity-filter">
                <select
                  value={activity}
                  onChange={(event) => {
                    setActivity(event.target.value);
                    setOpenKey(null);
                  }}
                  aria-label="Filter by activity"
                  className="pressable focus-ring"
                >
                  <option value="all">All activities</option>
                  {activitiesForDay.map(([slug, label]) => (
                    <option key={slug} value={slug}>{label}</option>
                  ))}
                </select>
                <ChevronDown size={16} aria-hidden="true" />
              </div>
            )}
          </div>

          {freshnessNote && (
            <aside className="schedule-notice">
              <CalendarOff size={17} aria-hidden="true" />
              <p>{freshnessNote}</p>
            </aside>
          )}

          {rows.length === 0 ? (
            <div className="pool-state-card schedule-empty-state is-empty">
              <CalendarOff size={20} aria-hidden="true" />
              <p>No programs scheduled at {pools[pool].label} on {headingDay}.</p>
            </div>
          ) : (
            <div className="schedule-list" role="list">
              {rows.map((row) => (
                <ScheduleCard
                  key={row.key}
                  row={row}
                  open={openKey === row.key}
                  onToggle={() => setOpenKey(openKey === row.key ? null : row.key)}
                />
              ))}
            </div>
          )}

          <aside className="schedule-legend">
            <span className="schedule-status-pill is-limited">Limited</span>
            <p>Fewer lanes are open because the pool is shared with lessons, teams, or other programs.</p>
          </aside>

          <p className="schedule-source">
            {pools[pool].season} · Times last checked {formatDate(pools[pool].lastUpdated)}, {pools[pool].lastUpdated.slice(0, 4)}.{' '}
            <a
              href={pools[pool].source}
              target="_blank"
              rel="noopener noreferrer"
            >
              Verify on the official {pools[pool].label} schedule
              <span aria-hidden="true"> ↗</span>
            </a>
          </p>
        </div>
      )}

      <div className="view-switcher-shell">
        <nav className="view-switcher" aria-label="Pool view navigation">
          <button
            type="button"
            onClick={() => showPoolSchedule('king')}
            aria-pressed={activeTab === 'king'}
            aria-label="King Pool"
            className={`view-switcher-button pressable focus-ring ${activeTab === 'king' ? 'is-active' : ''}`}
          >
            <MapPin size={17} aria-hidden="true" />
            <span>King</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('happening');
              setOpenKey(null);
            }}
            aria-pressed={activeTab === 'happening'}
            aria-label="Happening now"
            className={`view-switcher-button pressable focus-ring ${activeTab === 'happening' ? 'is-active' : ''}`}
          >
            <span
              className={`view-switcher-status-dot ${anyPoolOpen ? 'has-live-sessions' : 'is-quiet'}`}
              aria-hidden="true"
            />
            <span>Now</span>
          </button>

          <button
            type="button"
            onClick={() => showPoolSchedule('west')}
            aria-pressed={activeTab === 'west'}
            aria-label="West Campus Pool"
            className={`view-switcher-button pressable focus-ring ${activeTab === 'west' ? 'is-active' : ''}`}
          >
            <MapPin size={17} aria-hidden="true" />
            <span>West</span>
          </button>
        </nav>
      </div>
    </section>
  );
}

// Deliberately has no "Register" CTA: this app is a schedule viewer, not a
// signup surface. See archive/signup-ui/README.md before adding one back.
function HeroCard({ row }: { row: Row }) {
  return (
    <article className="now-session-card">
      <div className="now-session-status">
        <span aria-hidden="true" />
        <span>Open now</span>
      </div>
      <h4>{row.label}</h4>
      <p>{formatRange(row.slot)}</p>
    </article>
  );
}

function ScheduleCard({ row, open, onToggle }: { row: Row; open: boolean; onToggle: () => void }) {
  const Icon = programIcon(row.slug);
  const pill = STATUS_PILL[row.status];
  const dim = row.status === 'ended';
  const detailsId = `schedule-details-${row.key}`;

  return (
    <article
      role="listitem"
      className={`schedule-card is-${row.status} ${dim ? 'is-dimmed' : ''} ${open ? 'is-open' : ''}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={detailsId}
        className="schedule-card-button pressable focus-ring"
      >
        <div className="schedule-card-icon">
          <Icon size={21} strokeWidth={2} aria-hidden="true" />
        </div>
        <div className="schedule-card-summary">
          <div className="schedule-card-meta">
            <span>{formatRange(row.slot)}</span>
            {row.slot.limited && (
              <span className="schedule-status-pill is-limited">Limited</span>
            )}
          </div>
          <h3>{row.label}</h3>
          <div className="schedule-card-ages">
            <Tag size={12} aria-hidden="true" />
            <span>Ages {row.ages}</span>
          </div>
        </div>
        <div className="schedule-card-trailing">
          {pill && (
            <span className={`schedule-status-pill ${pill.cls}`}>{pill.text}</span>
          )}
          <ChevronDown size={18} className="schedule-card-chevron" aria-hidden="true" />
        </div>
      </button>
      {open && (
        <div id={detailsId} className="schedule-card-details">
          <p>{row.desc}</p>
          <div className="schedule-card-facts">
            <div><strong>Ages:</strong> {row.ages}</div>
            <div><strong>Cost:</strong> {row.cost}</div>
          </div>
        </div>
      )}
    </article>
  );
}
