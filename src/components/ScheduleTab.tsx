import { useMemo, useState } from 'react';
import { ChevronDown, ExternalLink, Tag, MapPin } from 'lucide-react';
import { pools, programs } from '../data/loadSchedule';
import {
  DAY_KEYS,
  formatRange,
  getBerkeleyNow,
  getSlotStatus,
  minutesOf,
  type SlotStatus,
} from '../lib/schedule';
import { programIcon } from '../lib/programIcons';
import type { PoolKey, TimeSlot } from '../data/types';

const OFFICIAL_CATALOG = 'https://rec.berkeleyca.gov/CA/berkeley-ca/catalog';

const DAY_ABBR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
  live: { text: 'Open now', cls: 'text-[#1a7a43] bg-[#e7f6ec] border-[#bfe6cd]' },
  upcoming: { text: 'Upcoming', cls: 'text-[#51606e] bg-[#eef1f4] border-[#dde3e9]' },
  ended: { text: 'Ended', cls: 'text-[#9aa6b2] bg-[#f4f6f8] border-[#e3e8ee]' },
  scheduled: null,
};

export function ScheduleTab() {
  const now = getBerkeleyNow();
  const [pool, setPool] = useState<PoolKey>('king');
  const [day, setDay] = useState<number>(now.dayIndex);
  const [activity, setActivity] = useState<string>('all');
  const [openKey, setOpenKey] = useState<string | null>(null);

  const data = pools[pool];
  const dayKey = DAY_KEYS[day];
  const isToday = day === now.dayIndex;

  // Flatten every (program, slot) for this pool+day into one chronological list.
  const allRows = useMemo<Row[]>(() => {
    const rows: Row[] = [];
    for (const [slug, week] of Object.entries(data.schedule)) {
      const info = programs[slug];
      week[dayKey].forEach((slot, i) => {
        rows.push({
          key: `${slug}-${i}`,
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
  }, [data, dayKey, isToday, now.minutes]);

  // Distinct programs available this day, for the filter dropdown.
  const activitiesForDay = useMemo(() => {
    const seen = new Map<string, string>();
    for (const r of allRows) if (!seen.has(r.slug)) seen.set(r.slug, r.label);
    return [...seen.entries()];
  }, [allRows]);

  const rows = activity === 'all' ? allRows : allRows.filter((r) => r.slug === activity);
  const liveRows = isToday ? allRows.filter((r) => r.status === 'live') : [];

  const headingDay = isToday ? 'Today' : DAY_FULL[day];

  return (
    <section className="flex flex-col gap-5">
      {/* What this is — kept compact for clarity */}
      <p className="text-[13px] text-[#51606e] leading-relaxed">
        When Berkeley&apos;s two public pools are open for lap swim, family swim, lessons and more — the City&apos;s PDF schedules pulled into one readable place.
      </p>

      {/* Pool segmented control */}
      <div className="flex bg-white rounded-xl p-1 border border-[#dde3e9] shadow-sm">
        {(['king', 'west'] as const).map((p) => (
          <button
            key={p}
            onClick={() => { setPool(p); setOpenKey(null); }}
            aria-pressed={pool === p}
            className={`focus-ring flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[14px] font-semibold cursor-pointer transition-colors ${
              pool === p ? 'bg-[#2a5caa] text-white shadow-sm' : 'text-[#1f4b7a] hover:bg-[#f4f7fb]'
            }`}
          >
            <MapPin size={14} className="shrink-0" />
            {pools[p].label}
          </button>
        ))}
      </div>

      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4">
        {DAY_ABBR.map((lbl, i) => {
          const selected = day === i;
          const today = i === now.dayIndex;
          return (
            <button
              key={i}
              onClick={() => { setDay(i); setOpenKey(null); }}
              aria-pressed={selected}
              className={`focus-ring shrink-0 w-[56px] py-2 rounded-xl text-[13px] font-semibold border cursor-pointer transition-colors flex flex-col items-center gap-0.5 ${
                selected
                  ? 'bg-[#2a5caa] text-white border-[#2a5caa]'
                  : 'bg-white text-[#1f4b7a] border-[#dde3e9] hover:border-[#2a5caa]'
              }`}
            >
              {lbl}
              {today && <span className={`w-1 h-1 rounded-full ${selected ? 'bg-white' : 'bg-[#2a5caa]'}`} />}
            </button>
          );
        })}
      </div>

      {/* Happening Now */}
      {isToday && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-[22px] font-semibold uppercase tracking-wide text-[#16335c] leading-none">Happening Now</h2>
            <span className="w-2.5 h-2.5 rounded-full bg-[#33c27f] shadow-[0_0_0_3px_rgba(51,194,127,0.25)]" />
          </div>

          {liveRows.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-4 px-4 snap-x snap-mandatory">
              {liveRows.map((r) => (
                <HeroCard key={r.key} row={r} poolLabel={data.label} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#dde3e9] bg-white px-5 py-4 text-[14px] text-[#51606e] leading-relaxed">
              Nothing in the water at {data.label} right now. Check the schedule below for the next open block.
            </div>
          )}
        </div>
      )}

      {/* Day schedule */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-display text-[22px] font-semibold uppercase tracking-wide text-[#16335c] leading-none">
            {headingDay} · {data.label}
          </h2>
          {activitiesForDay.length > 1 && (
            <div className="relative">
              <select
                value={activity}
                onChange={(e) => { setActivity(e.target.value); setOpenKey(null); }}
                aria-label="Filter by activity"
                className="focus-ring appearance-none bg-white border border-[#dde3e9] rounded-lg pl-3 pr-8 py-1.5 text-[13px] font-semibold text-[#1f4b7a] cursor-pointer hover:border-[#2a5caa]"
              >
                <option value="all">All activities</option>
                {activitiesForDay.map(([slug, label]) => (
                  <option key={slug} value={slug}>{label}</option>
                ))}
              </select>
              <ChevronDown size={15} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9aa6b2]" />
            </div>
          )}
        </div>

        {rows.length === 0 ? (
          <div className="rounded-2xl border border-[#dde3e9] bg-white px-5 py-6 text-[14px] text-[#51606e]">
            No programs scheduled at {data.label} on {headingDay}.
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {rows.map((r) => (
              <ScheduleCard
                key={r.key}
                row={r}
                open={openKey === r.key}
                onToggle={() => setOpenKey(openKey === r.key ? null : r.key)}
              />
            ))}
          </div>
        )}

        {/* Limited legend */}
        <div className="flex items-center gap-2 text-[12px] text-[#51606e] mt-1">
          <span className="inline-flex items-center text-[10px] font-semibold uppercase tracking-wide text-[#8a6d1a] border border-[#e7cf86] bg-[#fdf6e3] rounded-full px-2 py-0.5">Limited</span>
          <span>Fewer lanes open — pool is shared with lessons, teams, or other programs.</span>
        </div>
      </div>
    </section>
  );
}

function HeroCard({ row, poolLabel }: { row: Row; poolLabel: string }) {
  return (
    <div className="snap-start shrink-0 w-[88%] sm:w-[360px] relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2a5caa] to-[#16335c] text-white shadow-md">
      {/* decorative waves */}
      <svg className="absolute inset-x-0 bottom-0 w-full opacity-20" viewBox="0 0 400 80" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 40 C 60 10, 120 70, 200 40 S 340 10, 400 40 L400 80 L0 80 Z" fill="white" />
        <path d="M0 55 C 70 30, 140 80, 200 55 S 330 30, 400 55 L400 80 L0 80 Z" fill="white" opacity="0.6" />
      </svg>
      <div className="relative p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider bg-white/15 border border-white/25 rounded px-2 py-0.5">{poolLabel}</span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide bg-[#33c27f] text-[#06351f] rounded-full px-2.5 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#06351f]" /> Open now
          </span>
        </div>
        <div>
          <div className="font-display text-[26px] font-semibold uppercase tracking-wide leading-none">{row.label}</div>
          <div className="text-[15px] font-medium text-white/90 mt-1.5">{formatRange(row.slot)}</div>
        </div>
        <p className="text-[13px] text-white/85 leading-relaxed">{row.desc}</p>
        <a
          href={OFFICIAL_CATALOG}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring mt-1 self-start inline-flex items-center gap-1.5 bg-white text-[#16335c] rounded-lg px-4 h-10 text-[14px] font-semibold no-underline hover:bg-[#eaf1fa] transition-colors"
        >
          Register on City site
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}

function ScheduleCard({ row, open, onToggle }: { row: Row; open: boolean; onToggle: () => void }) {
  const Icon = programIcon(row.slug);
  const pill = STATUS_PILL[row.status];
  const dim = row.status === 'ended';

  return (
    <div
      className={`rounded-2xl border bg-white transition-shadow ${
        row.status === 'live' ? 'border-[#bfe6cd] shadow-[0_1px_5px_rgba(51,194,127,0.15)]' : 'border-[#dde3e9]'
      } ${dim ? 'opacity-60' : ''}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="focus-ring appearance-none bg-transparent w-full text-left flex items-center gap-3 p-3.5 cursor-pointer"
      >
        <div className="h-11 w-11 shrink-0 rounded-xl bg-[#eaf1fa] text-[#2a5caa] flex items-center justify-center">
          <Icon size={20} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-semibold text-[#51606e]">{formatRange(row.slot)}</span>
            {row.slot.limited && (
              <span className="text-[10px] font-semibold uppercase tracking-wide text-[#8a6d1a] border border-[#e7cf86] bg-[#fdf6e3] rounded-full px-2 py-0.5">Limited</span>
            )}
          </div>
          <div className="text-[16px] font-bold text-[#16335c] leading-tight truncate">{row.label}</div>
          <div className="flex items-center gap-1 text-[12px] text-[#7a8794] mt-0.5">
            <Tag size={11} className="shrink-0" />
            <span className="truncate">Ages {row.ages}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {pill && (
            <span className={`text-[11px] font-semibold rounded-full px-2.5 py-1 border ${pill.cls}`}>{pill.text}</span>
          )}
          <ChevronDown size={18} className={`text-[#9aa6b2] transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {open && (
        <div className="px-3.5 pb-4 pl-[62px] flex flex-col gap-3">
          <p className="text-[14px] text-[#3a4651] leading-relaxed">{row.desc}</p>
          <div className="flex gap-6 flex-wrap text-[13px] text-[#51606e] pt-2 border-t border-[#eef1f4]">
            <div><span className="font-semibold text-[#1a1a1a]">Ages:</span> {row.ages}</div>
            <div><span className="font-semibold text-[#1a1a1a]">Cost:</span> {row.cost}</div>
          </div>
        </div>
      )}
    </div>
  );
}
