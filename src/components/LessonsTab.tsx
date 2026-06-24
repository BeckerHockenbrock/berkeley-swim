import { useState } from 'react';
import { lessons } from '../data/loadSchedule';
import { ExternalLink } from 'lucide-react';
import type { LessonCategory } from '../data/types';

export function LessonsTab() {
  const [cat, setCat] = useState<LessonCategory>('learn-to-swim');
  const cards = lessons[cat];

  return (
    <section className="px-5 sm:px-8 py-6 sm:py-[34px]">
      <div className="font-mono text-[11px] text-[#6f6b62] mb-1.5">TAB 02 · SWIM LESSONS</div>
      <div className="text-xl sm:text-[22px] font-bold mb-1">Swim Lessons</div>
      <div className="text-xs sm:text-[13px] text-[#6b675f] mb-5 sm:mb-6 leading-relaxed">Offered at both pools · pre-pay online to enroll</div>

      <div className="flex flex-col-reverse sm:flex-row gap-5 sm:gap-5 mb-8 sm:mb-[30px]">
         <div className="flex-1 flex flex-col gap-2.5 justify-center">
             <div className="text-[14px] sm:text-[15px] text-[#3d3b37] leading-relaxed max-w-[520px]">
                Gain comfort in the water and learn the fundamentals of swimming. Choose the class that best matches your or your child&apos;s experience level.
             </div>
             <div className="flex gap-4 sm:gap-6 flex-wrap font-mono text-[10px] sm:text-[11px] text-[#6f6b62] mt-1 sm:mt-1">
                <div>offered at · both pools</div>
                <div>cost · $44 – $88</div>
             </div>
         </div>
         <div className="w-full sm:w-[260px] h-[120px] sm:h-[150px] border-2 border-dashed border-[#c6c2ba] rounded flex items-center justify-center font-mono text-[10px] text-[#6f6b62] bg-[repeating-linear-gradient(45deg,#f4f2ec,#f4f2ec_8px,#efece5_8px,#efece5_16px)] shrink-0">
            photo / pool image
         </div>
      </div>

      <div className="font-mono text-[10px] text-[#6f6b62] tracking-widest mb-3 uppercase">Choose a program</div>
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mb-6">
        <button
          onClick={() => setCat('learn-to-swim')}
          className={`focus-ring flex flex-col gap-0.5 px-4 sm:px-[18px] py-2.5 sm:py-[11px] rounded-[5px] border cursor-pointer text-left transition-colors ${cat === 'learn-to-swim' ? 'bg-[#3a3a37] border-[#3a3a37]' : 'bg-white border-[#d8d4cc] hover:bg-[#fbfbf9]'}`}
        >
          <span className={`text-[15px] sm:text-[14px] font-semibold ${cat === 'learn-to-swim' ? 'text-[#f4f2ec]' : 'text-[#33312d]'}`}>Learn-To-Swim</span>
          <span className={`font-mono text-[10px] ${cat === 'learn-to-swim' ? 'text-[#b6b2a8]' : 'text-[#6f6b62]'}`}>ages 6–18</span>
        </button>
        <button
          onClick={() => setCat('preschool')}
          className={`focus-ring flex flex-col gap-0.5 px-4 sm:px-[18px] py-2.5 sm:py-[11px] rounded-[5px] border cursor-pointer text-left transition-colors ${cat === 'preschool' ? 'bg-[#3a3a37] border-[#3a3a37]' : 'bg-white border-[#d8d4cc] hover:bg-[#fbfbf9]'}`}
        >
          <span className={`text-[15px] sm:text-[14px] font-semibold ${cat === 'preschool' ? 'text-[#f4f2ec]' : 'text-[#33312d]'}`}>Preschool Aquatics</span>
          <span className={`font-mono text-[10px] ${cat === 'preschool' ? 'text-[#b6b2a8]' : 'text-[#6f6b62]'}`}>ages 3–5</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 sm:mb-4">
         {cards.map((c, i) => (
            <div key={i} className="border border-[#e1ded7] rounded-[5px] p-5 bg-[#fdfdfb] flex flex-col hover:border-[#cdc9c1] transition-colors">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="font-mono text-[10px] text-[#f4f2ec] bg-[#3a3a37] rounded-[4px] px-2.5 py-1">{c.level}</div>
                <div className="text-[15px] sm:text-[16px] font-bold text-[#33312d]">{c.title}</div>
              </div>
              <div className="text-[13px] text-[#5b574f] leading-relaxed mb-3.5">{c.description}</div>
              <div className="border-t border-[#eeebe4] pt-3 mt-auto flex flex-col gap-3">
                <div className="font-mono text-[10px] text-[#5b574f] leading-relaxed">
                   <span className="text-[#6f6b62]">prereq · </span>{c.prereq}
                </div>
                <div className="flex justify-between items-center gap-3 sm:gap-2 flex-wrap">
                  <div className="font-mono text-[11px] text-[#5b574f] w-full sm:w-auto">{c.cost}</div>
                  <a href={c.enrollLink} target="_blank" rel="noopener noreferrer" className="focus-ring w-full sm:w-auto h-9 sm:h-8 px-4 bg-[#3a3a37] rounded font-mono text-[11px] sm:text-[10px] text-[#e9e7e1] cursor-pointer inline-flex items-center justify-center gap-1.5 no-underline hover:bg-[#4a4a47] transition-colors">
                    enroll
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
         ))}
      </div>

      <div className="font-mono text-[11px] text-[#6f6b62] leading-relaxed">Summer registration opens April 9 (residents) · April 16 (non-residents). King Pool $44–$88 reflects resident/scholarship tiers; West Campus is a flat $88.</div>
    </section>
  );
}
