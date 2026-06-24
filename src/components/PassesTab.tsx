import { passes } from '../data/loadSchedule';
import { ExternalLink } from 'lucide-react';

export function PassesTab() {
  return (
    <section className="px-5 sm:px-8 py-6 sm:py-[34px]">
      <div className="font-mono text-[11px] text-[#a09c93] mb-1.5">TAB 03 · BUY A PASS</div>
      <div className="text-xl sm:text-[22px] font-bold mb-1">Buy a Pass</div>
      <div className="text-xs sm:text-[13px] text-[#807c73] mb-2 leading-relaxed">Must pay ahead — no payment accepted at the pool. Pre-pay to attend any drop-in program.</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5 my-6">
        {passes.map((p, i) => {
           const priceDisplay = p.price === null ? 'TBD' : `${p.price.resident} / ${p.price.nonResident}`;
           const subDisplay = p.price === null ? 'price to confirm' : 'resident / non-resident';
           
           return (
           <div key={i} className={`relative border rounded-[6px] p-5 sm:p-6 ${p.featured ? 'border-2 border-[#3a3a37] bg-[#fbfbf9]' : 'border-[#e1ded7] bg-[#fdfdfb] hover:border-[#cdc9c1] transition-colors'}`}>
             {p.featured && (
               <div className="absolute -top-2.5 left-5 sm:left-6 bg-[#3a3a37] text-[#e9e7e1] font-mono text-[9px] px-3 py-[3px] rounded-full">most popular</div>
             )}
             <div className="flex justify-between items-start mb-4 sm:mb-5 gap-3">
               <div className="flex-1">
                 <div className="text-[17px] sm:text-[16px] font-bold leading-tight">{p.name}</div>
                 <div className="text-[13px] sm:text-xs text-[#807c73] mt-1 sm:mt-1.5 leading-relaxed">{p.description}</div>
               </div>
               <div className="text-right shrink-0">
                 <div className={`font-mono text-[18px] sm:text-[17px] font-medium ${p.price === null ? 'text-[#b3afa6]' : 'text-[#33312d]'}`}>{priceDisplay}</div>
                 <div className="font-mono text-[9px] text-[#a8a49b] mt-1">{subDisplay}</div>
               </div>
             </div>
             <a href={p.link} target="_blank" rel="noopener noreferrer" className={`focus-ring w-full cursor-pointer h-10 sm:h-[38px] rounded flex items-center justify-center gap-1.5 font-mono text-[12px] sm:text-[11px] no-underline transition-colors ${p.featured ? 'bg-[#3a3a37] text-[#e9e7e1] hover:bg-[#4a4a47]' : 'border border-[#cdc9c1] text-[#807c73] hover:bg-[#f4f2ec]'}`}>
               select on CivicRec
               <ExternalLink size={14} className="sm:w-[13px] sm:h-[13px]" />
             </a>
           </div>
         );
        })}
      </div>

      <div className="border border-[#e4e1da] rounded-[5px] p-5 sm:p-4 bg-[#f6f4ee] flex flex-col gap-2.5 sm:gap-2 mt-4">
         <div className="font-mono text-[11px] text-[#8c887f] tracking-widest uppercase">how to pay</div>
         <div className="text-[13px] text-[#5b574f]">Online · rec.berkeleyca.gov catalog</div>
         <div className="text-[13px] text-[#5b574f]">In person (cash/card) · James Kenney Community Center, 1720 Eighth St.</div>
         <div className="text-xs text-[#a8a49b] mt-1">Senior Exercise & Berkeley Aquatic Masters require a premium pass or ticket · prices TBD</div>
      </div>
    </section>
  );
}
