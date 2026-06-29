import { useState } from 'react';
import { lessons } from '../data/loadSchedule';
import { ExternalLink, Waves, ArrowDown } from 'lucide-react';
import type { LessonCategory } from '../data/types';

export function LessonsTab() {
  const [cat, setCat] = useState<LessonCategory>('learn-to-swim');
  const cards = lessons.categories[cat];

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-[30px] font-semibold uppercase tracking-wide text-[#16335c] leading-none">Swim Lessons</h1>
        <p className="text-[14px] text-[#51606e] mt-2 leading-relaxed">
          This page just explains what each level covers, so you can find the right fit. The <strong className="font-semibold">Register</strong> button takes you straight to the swim-lessons-only section of the City&apos;s catalog to sign up.
        </p>
        <div className="flex gap-5 flex-wrap text-[13px] text-[#51606e] mt-3">
          <div><span className="font-semibold text-[#1a1a1a]">Offered at:</span> both pools</div>
          <div><span className="font-semibold text-[#1a1a1a]">Cost:</span> $44 – $88</div>
        </div>
      </div>

      {/* Program toggle */}
      <div className="flex gap-2.5">
        <button
          onClick={() => setCat('learn-to-swim')}
          aria-pressed={cat === 'learn-to-swim'}
          className={`focus-ring flex-1 flex flex-col gap-0.5 px-4 py-3 rounded-xl border cursor-pointer text-left transition-colors ${
            cat === 'learn-to-swim' ? 'bg-[#2a5caa] border-[#2a5caa]' : 'bg-white border-[#dde3e9] hover:border-[#2a5caa]'
          }`}
        >
          <span className={`text-[14px] font-semibold ${cat === 'learn-to-swim' ? 'text-white' : 'text-[#1f4b7a]'}`}>Learn-To-Swim</span>
          <span className={`text-[12px] ${cat === 'learn-to-swim' ? 'text-white/80' : 'text-[#51606e]'}`}>Ages 6–18</span>
        </button>
        <button
          onClick={() => setCat('preschool')}
          aria-pressed={cat === 'preschool'}
          className={`focus-ring flex-1 flex flex-col gap-0.5 px-4 py-3 rounded-xl border cursor-pointer text-left transition-colors ${
            cat === 'preschool' ? 'bg-[#2a5caa] border-[#2a5caa]' : 'bg-white border-[#dde3e9] hover:border-[#2a5caa]'
          }`}
        >
          <span className={`text-[14px] font-semibold ${cat === 'preschool' ? 'text-white' : 'text-[#1f4b7a]'}`}>Preschool Aquatics</span>
          <span className={`text-[12px] ${cat === 'preschool' ? 'text-white/80' : 'text-[#51606e]'}`}>Ages 3–5</span>
        </button>
      </div>

      <div className="text-[12px] font-semibold uppercase tracking-wider text-[#51606e] flex items-center gap-2 -mb-2">
        Find your level
        <ArrowDown size={13} className="text-[#9aa6b2]" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cards.map((c, i) => (
          <div key={i} className="border border-[#dde3e9] rounded-2xl p-4 bg-white flex flex-col">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-white bg-[#2a5caa] rounded px-2 py-0.5">{c.level}</div>
              <div className="text-[15px] font-bold text-[#16335c]">{c.title}</div>
            </div>
            <div className="text-[13px] text-[#3a4651] leading-relaxed mb-3">{c.description}</div>
            <div className="border-t border-[#eef1f4] pt-3 mt-auto flex flex-col gap-1.5">
              <div className="text-[12px] text-[#51606e] leading-relaxed">
                <span className="font-semibold text-[#1a1a1a]">Right for you if:</span> {c.prereq}
              </div>
              <div className="text-[13px] font-semibold text-[#16335c]">{c.cost}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Single shared registration CTA */}
      <div className="rounded-2xl border-2 border-[#2a5caa] bg-[#eaf1fa] p-5 flex flex-col gap-3">
        <div>
          <div className="text-[16px] font-bold text-[#16335c] mb-1">Ready to sign up?</div>
          <p className="text-[13px] text-[#3a4651] leading-relaxed">
            All swim-lesson levels are registered on one City catalog page. Open it, pick the level you matched above, and choose a session at King or West Campus.
          </p>
        </div>
        <a
          href={lessons.registerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring self-start inline-flex items-center justify-center gap-2 h-11 px-6 bg-[#2a5caa] rounded-lg text-[15px] font-semibold text-white no-underline hover:bg-[#224a89] transition-colors"
        >
          Register on City catalog
          <ExternalLink size={16} />
        </a>
      </div>

      <div className="rounded-xl border border-[#ecd9a0] bg-[#fff6e0] px-4 py-3 text-[13px] text-[#6b5410] leading-relaxed flex gap-2.5 items-start">
        <Waves size={16} className="shrink-0 mt-0.5" />
        <span>Summer registration opens April 9 (residents) and April 16 (non-residents). King Pool $44–$88 reflects resident/scholarship tiers; West Campus is a flat $88.</span>
      </div>
    </section>
  );
}
