import { useState } from 'react';
import { ExternalLink, Info, AlertTriangle } from 'lucide-react';
import { ScheduleTab } from './components/ScheduleTab';
import { LessonsTab } from './components/LessonsTab';
import { PassesTab } from './components/PassesTab';
import { getBerkeleyNow, getScheduleStatus, formatDate } from './lib/schedule';
import { meta } from './data/loadSchedule';

export default function App() {
  const [tab, setTab] = useState<'schedule' | 'lessons' | 'pass'>('schedule');

  const now = getBerkeleyNow();
  const status = getScheduleStatus(meta, now.dateISO);

  return (
    <div className="min-h-screen bg-[#eceae6] font-sans text-[#2a2a28] flex flex-col items-center sm:pb-20">
      <div className="w-full bg-[#1b1b1a] text-[#cfcdc7] font-mono text-[10px] sm:text-xs tracking-widest text-center py-2 sm:py-[7px] px-4 uppercase">
        Unofficial · Not affiliated with the City of Berkeley
      </div>

      <div className="w-full max-w-[1080px] bg-[#fbfbf9] sm:border border-[#d6d3cc] sm:mt-7 sm:rounded shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-5 sm:py-[22px] px-5 sm:px-8 border-b border-[#e4e1da] gap-5 sm:gap-0">
          <div className="flex items-center gap-[14px]">
            <div className="flex flex-col gap-0.5">
              <div className="text-[15px] sm:text-base font-bold">Berkeley Pools — unofficial schedule viewer</div>
              <div className="font-mono text-[10px] text-[#a09c93]">King Pool · West Campus Pool</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <a href="https://rec.berkeleyca.gov/CA/berkeley-ca/catalog" target="_blank" rel="noopener noreferrer" className="focus-ring h-9 sm:h-[30px] flex-1 sm:flex-none px-3 border border-[#cdc9c1] rounded-[3px] inline-flex items-center justify-center gap-1.5 font-mono text-[10px] sm:text-xs sm:text-[10px] text-[#a09c93] cursor-pointer no-underline hover:bg-[#f4f2ec] transition-colors">
              log in
              <ExternalLink size={12} className="sm:w-[11px] sm:h-[11px]" />
            </a>
            <a href="https://rec.berkeleyca.gov/CA/berkeley-ca/catalog" target="_blank" rel="noopener noreferrer" className="focus-ring h-9 sm:h-[30px] flex-1 sm:flex-none px-3 bg-[#3a3a37] rounded-[3px] inline-flex items-center justify-center gap-1.5 font-mono text-[10px] sm:text-xs sm:text-[10px] text-[#e9e7e1] cursor-pointer no-underline hover:bg-[#4a4a47] transition-colors">
              account
              <ExternalLink size={12} className="sm:w-[11px] sm:h-[11px]" />
            </a>
          </div>
        </header>

        {status.kind !== 'ok' && (
          <div className={`px-5 sm:px-8 py-3 sm:py-2.5 border-b flex gap-3 items-start sm:items-center ${
            status.kind === 'closed' ? 'bg-[#fceceb] text-[#8a2f27] border-[#f5d0cd]' : 'bg-[#fff5e6] text-[#8a5d19] border-[#ffe0b2]'
          }`}>
             <AlertTriangle size={18} className="shrink-0 mt-0.5 sm:mt-0 sm:w-4 sm:h-4" />
             <p className="text-xs sm:text-[13px] font-medium">
               {status.kind === 'closed' && `Both pools are closed today, ${formatDate(status.date)}.`}
               {status.kind === 'expired' && `This schedule expired on ${formatDate(status.validThrough)}. The times below may be outdated.`}
               {status.kind === 'upcoming' && `This schedule does not take effect until ${formatDate(status.validFrom)}.`}
             </p>
          </div>
        )}

        <div className="bg-[#e9f2ff] px-5 sm:px-8 py-3.5 sm:py-3 border-b border-[#c6dcf0] flex gap-3 text-[#1f4b7a] items-start sm:items-center">
           <Info size={18} className="shrink-0 mt-0.5 sm:mt-0 sm:w-4 sm:h-4" />
           <p className="text-xs sm:text-[13px] sm:text-xs leading-relaxed">
             <strong>Heads up:</strong> The action buttons below do not buy passes or log you in automatically. They simply direct you to the correct place on the official City of Berkeley CivicRec portal where you must log in and complete your transaction.
           </p>
        </div>

        <nav className="flex gap-0 px-3 sm:px-8 border-b border-[#e4e1da] overflow-x-auto whitespace-nowrap hide-scrollbar">
          <TabButton active={tab === 'schedule'} onClick={() => setTab('schedule')}>Schedule</TabButton>
          <TabButton active={tab === 'lessons'} onClick={() => setTab('lessons')}>Swim Lessons</TabButton>
          <TabButton active={tab === 'pass'} onClick={() => setTab('pass')}>Buy a Pass</TabButton>
        </nav>

        {tab === 'schedule' && <ScheduleTab />}
        {tab === 'lessons' && <LessonsTab />}
        {tab === 'pass' && <PassesTab />}
      </div>
      
      <footer className="mt-8 mb-4 text-center text-[11px] font-mono text-[#a8a49b]">
        Unofficial. Not affiliated with the City of Berkeley.
      </footer>
    </div>
  );
}

function TabButton({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`focus-ring appearance-none bg-transparent border-none cursor-pointer font-sans text-[15px] sm:text-sm font-semibold py-4 px-4 sm:px-[22px] border-b-2 -mb-[1px] whitespace-nowrap transition-colors ${
        active ? 'text-[#2a2a28] border-[#2a2a28]' : 'text-[#a09c93] border-transparent hover:text-[#5b574f]'
      }`}
    >
      {children}
    </button>
  );
}
