/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ExternalLink, Info } from 'lucide-react';
import { ScheduleTab } from './components/ScheduleTab';
import { LessonsTab } from './components/LessonsTab';
import { PassesTab } from './components/PassesTab';

export default function App() {
  const [tab, setTab] = useState<'schedule' | 'lessons' | 'pass'>('schedule');

  return (
    <div className="min-h-screen bg-[#eceae6] font-sans text-[#2a2a28] flex flex-col items-center sm:pb-20">
      <div className="w-full bg-[#1b1b1a] text-[#cfcdc7] font-mono text-[10px] sm:text-xs tracking-widest text-center py-2 sm:py-[7px] px-4 uppercase">
        blueprint — real schedule data wired in · visuals & branding still TBD
      </div>

      <div className="w-full max-w-[1080px] bg-[#fbfbf9] sm:border border-[#d6d3cc] sm:mt-7 sm:rounded shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-5 sm:py-[22px] px-5 sm:px-8 border-b border-[#e4e1da] gap-5 sm:gap-0">
          <div className="flex items-center gap-[14px]">
            <div className="w-10 h-10 shrink-0 border-2 border-dashed border-[#b9b5ad] rounded-full flex items-center justify-center font-mono text-[9px] text-[#9c988f]">
              LOGO
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="text-[15px] sm:text-base font-bold">City of Berkeley Aquatics</div>
              <div className="font-mono text-[10px] text-[#a09c93]">King Pool · West Campus Pool</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <a href="https://rec.berkeleyca.gov/CA/berkeley-ca/catalog" target="_blank" rel="noopener noreferrer" className="h-9 sm:h-[30px] flex-1 sm:flex-none px-3 border border-[#cdc9c1] rounded-[3px] inline-flex items-center justify-center gap-1.5 font-mono text-[10px] sm:text-xs sm:text-[10px] text-[#a09c93] cursor-pointer no-underline hover:bg-[#f4f2ec] transition-colors">
              log in
              <ExternalLink size={12} className="sm:w-[11px] sm:h-[11px]" />
            </a>
            <a href="https://rec.berkeleyca.gov/CA/berkeley-ca/catalog" target="_blank" rel="noopener noreferrer" className="h-9 sm:h-[30px] flex-1 sm:flex-none px-3 bg-[#3a3a37] rounded-[3px] inline-flex items-center justify-center gap-1.5 font-mono text-[10px] sm:text-xs sm:text-[10px] text-[#e9e7e1] cursor-pointer no-underline hover:bg-[#4a4a47] transition-colors">
              account
              <ExternalLink size={12} className="sm:w-[11px] sm:h-[11px]" />
            </a>
          </div>
        </header>

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

      <div className="max-w-[1080px] w-full mt-4 sm:mt-[22px] px-4 sm:px-1 font-mono text-[10px] text-[#a8a49b] flex gap-4 sm:gap-6 flex-wrap pb-8 sm:pb-0">
        <div>■ solid block = placeholder content</div>
        <div>▦ hatched = image placeholder</div>
        <div>real text = confirmed from schedule PDFs</div>
      </div>
    </div>
  );
}

function TabButton({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`appearance-none bg-transparent border-none cursor-pointer font-sans text-[15px] sm:text-sm font-semibold py-4 px-4 sm:px-[22px] border-b-2 -mb-[1px] whitespace-nowrap transition-colors ${
        active ? 'text-[#2a2a28] border-[#2a2a28]' : 'text-[#a09c93] border-transparent hover:text-[#5b574f]'
      }`}
    >
      {children}
    </button>
  );
}
