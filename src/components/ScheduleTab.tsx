import { useState } from 'react';
import { meta, pools, programs } from '../data/loadSchedule';
import {
  DAY_KEYS,
  formatDate,
  formatSlot,
  getBerkeleyNow,
  getHappeningNow,
} from '../lib/schedule';
import type { PoolKey } from '../data/types';

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function ScheduleTab() {
  const now = getBerkeleyNow();
  const [pool, setPool] = useState<PoolKey>('king');
  const [day, setDay] = useState<number>(now.dayIndex); // default to today (Berkeley)
  const [openProgram, setOpenProgram] = useState<string | null>(null);

  const data = pools[pool];
  const dayKey = DAY_KEYS[day];

  const programRows = Object.entries(data.schedule)
    .map(([slug, week]) => ({ slug, slots: week[dayKey] }))
    .filter((row) => row.slots.length > 0)
    .map((row) => {
      const info = programs[row.slug];
      return {
        slug: row.slug,
        label: info?.label ?? row.slug,
        slots: row.slots.map(formatSlot),
        desc: info?.description ?? 'Description coming soon.',
        ages: info?.ages ?? '—',
        cost: info?.cost ?? 'See catalog',
      };
    });

  const isToday = day === now.dayIndex;
  const { active, next } = isToday
    ? getHappeningNow(data.schedule, programs, dayKey, now.minutes)
    : { active: [], next: null };

  const dayName = dayLabels[day];
  const closedLabel = meta.closedDates.map(formatDate).join(' & ');

  return (
    <section className="px-5 sm:px-8 py-6 sm:py-[34px]">
      <div className="font-mono text-[11px] text-[#6f6b62] mb-1.5">TAB 01 · SCHEDULE</div>
      <div className="text-xl sm:text-[22px] font-bold mb-1">Summer Schedule</div>
      <div className="text-xs sm:text-[13px] text-[#6b675f] mb-5 sm:mb-6 leading-relaxed">June 8 – August 9, 2026 · all programs drop-in unless noted</div>

      {/* pool selector */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-2.5 mb-5 sm:mb-[18px]">
        <button
          onClick={() => setPool('king')}
          className={`focus-ring px-[18px] py-[11px] sm:py-[9px] rounded font-semibold text-[15px] sm:text-[13px] border cursor-pointer transition-colors ${pool === 'king' ? 'bg-[#3a3a37] text-[#e9e7e1] border-[#3a3a37]' : 'bg-white text-[#6b675f] border-[#d8d4cc] hover:bg-[#fbfbf9]'}`}
        >
          King Pool
        </button>
        <button
          onClick={() => setPool('west')}
          className={`focus-ring px-[18px] py-[11px] sm:py-[9px] rounded font-semibold text-[15px] sm:text-[13px] border cursor-pointer transition-colors ${pool === 'west' ? 'bg-[#3a3a37] text-[#e9e7e1] border-[#3a3a37]' : 'bg-white text-[#6b675f] border-[#d8d4cc] hover:bg-[#fbfbf9]'}`}
        >
          West Campus Pool
        </button>
      </div>

      {/* day selector */}
      <div className="flex overflow-x-auto gap-2 mb-[26px] sm:mb-[22px] flex-nowrap sm:flex-wrap pb-2 sm:pb-0 hide-scrollbar -mx-5 px-5 sm:mx-0 sm:px-0">
        {dayLabels.map((lbl, i) => (
          <button
            key={i}
            onClick={() => setDay(i)}
            aria-pressed={day === i}
            className={`focus-ring w-[52px] sm:w-12 shrink-0 h-[40px] sm:h-[34px] flex items-center cursor-pointer justify-center rounded text-[13px] sm:text-xs font-semibold border transition-colors ${day === i ? 'bg-[#33312d] text-[#e9e7e1] border-[#33312d]' : 'bg-white text-[#6b675f] border-[#d8d4cc] hover:bg-[#fbfbf9]'}`}
          >
            {lbl}
          </button>
        ))}
      </div>

      {/* HAPPENING NOW */}
      {isToday && (
          <div className="border border-[#33312d] rounded-md overflow-hidden mb-6 sm:mb-5">
            <div className="bg-[#33312d] text-[#e9e7e1] px-[14px] py-[11px] sm:py-[9px] flex items-center gap-[9px] font-mono text-[10px] sm:text-[11px] tracking-wider sm:tracking-widest rounded-t-[5px]">
              <span className="w-2 h-2 rounded-full bg-[#7fcaa0] shadow-[0_0_0_3px_rgba(127,202,160,0.25)] shrink-0"></span>
              <span className="truncate">HAPPENING NOW · {data.label} · {dayName}</span>
            </div>
            <div className="p-4 sm:p-5 bg-[#fbfbf9]">
              {active.length > 0 ? (
                <div className="flex flex-col gap-3.5 sm:gap-[9px]">
                  {active.map((a) => (
                    <div key={a.slug} className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#33312d] shrink-0"></span>
                      <div className="text-[15px] sm:text-[15px] font-semibold text-[#33312d] leading-tight">{a.label}</div>
                      <div className="font-mono text-[11px] sm:text-[12px] text-[#5b574f] border border-[#d8d4cc] bg-[#f4f2ec] rounded-full px-3 py-1 sm:py-[3px]">{a.time}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[13px] text-[#6b675f] leading-relaxed">
                  {next ? `Nothing in the water right now — next up: ${next.label} at ${next.time}.` : 'No more programs scheduled here today.'}
                </div>
              )}
            </div>
          </div>
      )}

      {/* program rows */}
      <div className="font-mono text-[10px] text-[#6f6b62] mb-3 sm:mb-2.5 leading-relaxed tracking-wide">click a program to see what it is</div>
      <div className="border border-[#e4e1da] rounded sm:rounded-[5px] overflow-hidden">
        {programRows.map((row) => {
          const isOpen = openProgram === row.slug;
          return (
            <div key={row.slug} className="border-t border-[#eeebe4] bg-[#fdfdfb] first:border-0 px-4 sm:px-5 transition-colors hover:bg-[#fafaf8]">
              <button
                type="button"
                onClick={() => setOpenProgram(isOpen ? null : row.slug)}
                aria-expanded={isOpen}
                className="focus-ring appearance-none bg-transparent w-full text-left flex items-start sm:grid sm:grid-cols-[22px_188px_1fr] gap-3 sm:gap-4 py-4 sm:py-5 cursor-pointer"
              >
                <span aria-hidden="true" className="font-mono text-[17px] text-[#6f6b62] leading-none mt-[2px] sm:mt-0 w-[22px] shrink-0">{isOpen ? '–' : '+'}</span>
                <span className="flex flex-col sm:flex-row sm:col-span-2 sm:grid sm:grid-cols-[188px_1fr] gap-2.5 sm:gap-4 flex-1 w-full">
                  <span className="text-[15px] sm:text-[14px] font-semibold text-[#33312d] underline decoration-[#cdc9c1] underline-offset-4 decoration-2 sm:decoration-1 leading-tight pr-4 sm:pr-0">{row.label}</span>
                  <span className="flex gap-2 flex-wrap">
                    {row.slots.map((s, i) => (
                       <span key={i} className="font-mono text-[11px] sm:text-[12px] text-[#5b574f] border border-[#d8d4cc] bg-[#f4f2ec] rounded-full px-3 py-1.5">{s}</span>
                    ))}
                  </span>
                </span>
              </button>
              {isOpen && (
                <div className="pb-5 pl-[34px] sm:pl-[38px] flex flex-col gap-3 sm:gap-2.5">
                  <div className="text-[14px] sm:text-[13px] text-[#5b574f] max-w-[640px] leading-relaxed">{row.desc}</div>
                  <div className="flex gap-4 sm:gap-6 flex-wrap font-mono text-[10px] sm:text-[11px] text-[#6f6b62] mt-1 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0 border-[#eeebe4]">
                    <div>ages · {row.ages}</div>
                    <div>cost · {row.cost}</div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mt-5 sm:mt-3.5 flex-wrap gap-2.5 sm:gap-2 bg-[#f4f2ec] sm:bg-transparent p-3 sm:p-0 rounded border border-[#e4e1da] sm:border-transparent">
        <div className="font-mono text-[10px] sm:text-[11px] text-[#6f6b62] leading-relaxed">** limited lap lanes / space available</div>
        {closedLabel && (
          <div className="font-mono text-[10px] sm:text-[11px] text-[#6f6b62] leading-relaxed">closed {closedLabel}</div>
        )}
      </div>
    </section>
  );
}
