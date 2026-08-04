import { useState, useEffect } from 'react';
import { Wrench, RotateCcw, ChevronUp, ChevronDown, Clock, Calendar } from 'lucide-react';
import { getBerkeleyNow, formatDate } from '../lib/schedule';

interface DevBarProps {
  overrideDate: Date | null;
  onOverrideChange: (date: Date | null) => void;
}

const PRESETS = [
  { label: 'Mon 7:00 AM', isoDate: '2026-07-27', time: '07:00' },
  { label: 'Wed 1:00 PM', isoDate: '2026-07-29', time: '13:00' },
  { label: 'Sat 10:00 AM', isoDate: '2026-08-01', time: '10:00' },
  { label: 'Sun 9:00 PM (Closed)', isoDate: '2026-08-02', time: '21:00' },
  // Season changeover: the first day the Fall schedule takes over from Summer.
  { label: 'Mon 7:00 AM (Fall)', isoDate: '2026-08-10', time: '07:00' },
];

export function DevBar({ overrideDate, onOverrideChange }: DevBarProps) {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  // Default input values derived from overrideDate or current Date
  const activeDate = overrideDate ?? new Date();
  const berkNow = getBerkeleyNow(activeDate);

  // Local state for input controls YYYY-MM-DD and HH:MM
  const [dateInput, setDateInput] = useState<string>(berkNow.dateISO);
  const [timeInput, setTimeInput] = useState<string>(() => {
    const h = String(Math.floor(berkNow.minutes / 60)).padStart(2, '0');
    const m = String(berkNow.minutes % 60).padStart(2, '0');
    return `${h}:${m}`;
  });

  // Sync inputs if overrideDate changes externally or is reset
  useEffect(() => {
    const cur = getBerkeleyNow(overrideDate ?? new Date());
    setDateInput(cur.dateISO);
    const h = String(Math.floor(cur.minutes / 60)).padStart(2, '0');
    const m = String(cur.minutes % 60).padStart(2, '0');
    setTimeInput(`${h}:${m}`);
  }, [overrideDate]);

  const applyCustomDateTime = (dStr: string, tStr: string) => {
    setDateInput(dStr);
    setTimeInput(tStr);
    if (!dStr || !tStr) return;
    const [y, m, d] = dStr.split('-').map(Number);
    const [hr, min] = tStr.split(':').map(Number);
    // Create local Date for specified date & time
    const custom = new Date(y, m - 1, d, hr, min, 0);
    onOverrideChange(custom);
  };

  const applyPreset = (isoDate: string, time: string) => {
    applyCustomDateTime(isoDate, time);
  };

  const handleReset = () => {
    onOverrideChange(null);
  };

  return (
    <div className="w-full bg-[#162338] text-white border-b border-[#2e3c52] text-[13px] sticky top-0 z-30 shadow-md">
      <div className="max-w-[680px] mx-auto px-4 py-2 flex flex-col gap-2">
        {/* Header line */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-mono text-[12px] font-bold text-[#e7c14a] uppercase tracking-wider">
            <Wrench size={14} className="shrink-0 text-[#e7c14a]" />
            <span>DEV MODE · Time Travel</span>
            {overrideDate ? (
              <span className="bg-[#e7c14a]/20 text-[#f3d987] px-2 py-0.5 rounded text-[10px] font-sans font-semibold normal-case">
                Simulating: {formatDate(berkNow.dateISO)} @ {timeInput}
              </span>
            ) : (
              <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-sans font-semibold normal-case">
                Live Real Time
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {overrideDate && (
              <button
                type="button"
                onClick={handleReset}
                className="focus-ring inline-flex items-center gap-1 px-2 py-1 rounded bg-[#2e3c52] hover:bg-[#3d4f6c] text-[11px] font-semibold text-white cursor-pointer transition-colors"
              >
                <RotateCcw size={12} />
                <span>Reset to Real Time</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="focus-ring p-1 rounded hover:bg-[#2e3c52] text-[#9aa6b2] hover:text-white cursor-pointer"
              aria-label={collapsed ? 'Expand dev bar' : 'Collapse dev bar'}
            >
              {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          </div>
        </div>

        {/* Collapsible controls */}
        {!collapsed && (
          <div className="flex flex-col gap-2.5 pt-1.5 border-t border-[#2e3c52]/60">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-1.5 text-[12px] text-[#a9b7c6]">
                <Calendar size={13} className="text-[#64748b]" />
                <span>Date:</span>
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => applyCustomDateTime(e.target.value, timeInput)}
                  className="bg-[#0f172a] text-white border border-[#334155] rounded px-2 py-1 text-[12px] font-mono focus:border-[#e7c14a] outline-none"
                />
              </label>

              <label className="flex items-center gap-1.5 text-[12px] text-[#a9b7c6]">
                <Clock size={13} className="text-[#64748b]" />
                <span>Time:</span>
                <input
                  type="time"
                  value={timeInput}
                  onChange={(e) => applyCustomDateTime(dateInput, e.target.value)}
                  className="bg-[#0f172a] text-white border border-[#334155] rounded px-2 py-1 text-[12px] font-mono focus:border-[#e7c14a] outline-none"
                />
              </label>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
              <span className="text-[#64748b] font-semibold">Presets:</span>
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p.isoDate, p.time)}
                  className="bg-[#1e293b] hover:bg-[#334155] text-[#cbd5e1] hover:text-white border border-[#334155] rounded px-2 py-1 font-medium cursor-pointer transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
