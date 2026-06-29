import { useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { AlertTriangle, Waves, CalendarDays, Ticket, MapPin, Phone, MessageSquarePlus } from 'lucide-react';
import { ScheduleTab } from './components/ScheduleTab';
import { LessonsTab } from './components/LessonsTab';
import { PassesTab } from './components/PassesTab';
import { getBerkeleyNow, getScheduleStatus, formatDate } from './lib/schedule';
import { meta } from './data/loadSchedule';

const OFFICIAL_CATALOG = 'https://rec.berkeleyca.gov/CA/berkeley-ca/catalog';
const OFFICIAL_AQUATICS = 'https://berkeleyca.gov/community-recreation/parks-recreation/aquatics';
const FEEDBACK_MAILTO =
  'mailto:bhocken91@gmail.com?subject=' +
  encodeURIComponent('Berkeley Pools — bug / feature') +
  '&body=' +
  encodeURIComponent("What's wrong, or what would you like to see?\n\n");

const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TABS = [
  { key: 'schedule', label: 'Schedule', icon: CalendarDays },
  { key: 'lessons', label: 'Lessons', icon: Waves },
  { key: 'pass', label: 'Passes', icon: Ticket },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function App() {
  const [tab, setTab] = useState<TabKey>('schedule');

  const now = getBerkeleyNow();
  const status = getScheduleStatus(meta, now.dateISO);
  const todayLabel = `${FULL_DAYS[now.dayIndex]}, ${formatDate(now.dateISO)}`;

  return (
    <div className="min-h-screen bg-[#eef1f5] text-[#1a1a1a] font-sans flex flex-col">
      {/* Slim, always-present unofficial disclaimer */}
      <div className="w-full bg-[#16335c] text-[#cdd8e8]">
        <div className="max-w-[680px] mx-auto px-4 py-1.5 flex items-center justify-center gap-1.5 text-center">
          <AlertTriangle size={11} className="shrink-0 text-[#e7c14a]" />
          <span className="text-[11px] leading-snug">
            <strong className="font-semibold text-white">Unofficial.</strong> Not affiliated with the City of Berkeley.
          </span>
        </div>
      </div>

      {/* App header */}
      <header className="sticky top-0 z-20 w-full bg-white/95 backdrop-blur border-b border-[#dde3e9]">
        <div className="max-w-[680px] mx-auto px-4 py-3 flex items-center gap-3">
          <img src="/logo.png" alt="Berkeley Pools logo" className="h-11 w-11 shrink-0 object-contain" />
          <div className="flex flex-col leading-none">
            <div className="flex items-center gap-2">
              <span className="font-display text-[24px] font-semibold uppercase tracking-wide leading-none">Berkeley Pools</span>
            </div>
            <span className="text-[13px] text-[#51606e] mt-1.5">{todayLabel}</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full max-w-[680px] mx-auto px-4 pt-4 pb-28">
        {/* Staleness / closure notices */}
        {status.kind !== 'ok' && (
          <div
            className={`rounded-xl px-4 py-3 mb-4 flex gap-2.5 items-start ${
              status.kind === 'closed'
                ? 'bg-[#fbeceb] text-[#7c2229] border border-[#f0cfce]'
                : 'bg-[#fff6e0] text-[#6b5410] border border-[#ecd9a0]'
            }`}
          >
            <AlertTriangle size={17} className="shrink-0 mt-0.5" />
            <p className="text-[13px] font-medium leading-snug">
              {status.kind === 'closed' && `Both pools are closed today, ${formatDate(status.date)}.`}
              {status.kind === 'expired' && `This schedule expired on ${formatDate(status.validThrough)}. Times may be out of date — confirm on the official City catalog.`}
              {status.kind === 'upcoming' && `This schedule does not take effect until ${formatDate(status.validFrom)}.`}
            </p>
          </div>
        )}

        {tab === 'schedule' && <ScheduleTab />}
        {tab === 'lessons' && <LessonsTab />}
        {tab === 'pass' && <PassesTab />}

        {/* Footer */}
        <footer className="mt-10 pt-6 border-t border-[#dadfe6] flex flex-col gap-3 text-[13px] text-[#51606e]">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0 text-[#9aa6b2]" /><span>King Pool · 1700 Hopkins St</span></div>
            <div className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0 text-[#9aa6b2]" /><span>West Campus Pool · 2100 Browning St</span></div>
            <div className="flex items-start gap-2"><Phone size={14} className="mt-0.5 shrink-0 text-[#9aa6b2]" /><span>(510) 981-5150</span></div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <a href={OFFICIAL_CATALOG} target="_blank" rel="noopener noreferrer" className="text-[#2a5caa] no-underline hover:underline">City registration catalog ↗</a>
            <a href={OFFICIAL_AQUATICS} target="_blank" rel="noopener noreferrer" className="text-[#2a5caa] no-underline hover:underline">City of Berkeley Aquatics ↗</a>
          </div>

          <div>
            <div className="text-[12px] font-semibold uppercase tracking-wider text-[#51606e] mb-1.5">About</div>
            <p className="text-[13px] text-[#51606e] leading-relaxed max-w-[560px]">
              I&apos;m a lifeguard at King and West Campus, and people kept asking me the same thing on deck — when&apos;s the pool open? when&apos;s lap swim? The City only posts the schedules as PDFs that are rough to read on a phone, so I built this to put both pools&apos; hours in one place you can check before you head over. It&apos;s unofficial. If you catch something wrong, tell me and I&apos;ll fix it.
            </p>
          </div>

          <a
            href={FEEDBACK_MAILTO}
            className="focus-ring self-start inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-[#c2cad3] text-[13px] font-semibold text-[#1f4b7a] no-underline hover:border-[#2a5caa] hover:bg-[#f4f7fb] transition-colors"
          >
            <MessageSquarePlus size={15} className="shrink-0" />
            Report a bug or request a feature
          </a>

          <p className="text-[12px] text-[#7a8794] leading-relaxed">
            <strong className="font-semibold text-[#51606e]">Unofficial site.</strong> Not affiliated with, endorsed by, or operated by the City of Berkeley. Always verify times and fees on the official catalog. © {new Date().getFullYear()}
          </p>
        </footer>
      </main>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-[#dde3e9] pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-[680px] mx-auto px-2 grid grid-cols-3">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                aria-current={active ? 'page' : undefined}
                className={`focus-ring appearance-none bg-transparent border-none cursor-pointer flex flex-col items-center gap-1 py-2.5 transition-colors ${
                  active ? 'text-[#2a5caa]' : 'text-[#8a97a6] hover:text-[#51606e]'
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                <span className={`text-[11px] tracking-wide ${active ? 'font-semibold' : 'font-medium'}`}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <Analytics />
    </div>
  );
}
