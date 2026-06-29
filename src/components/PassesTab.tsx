import { passes } from '../data/loadSchedule';
import { ExternalLink, MapPin, Globe, Barcode, UserCheck } from 'lucide-react';
import type { Pass } from '../data/types';

const ENTRY = {
  name: { Icon: UserCheck, label: 'Give your name' },
  barcode: { Icon: Barcode, label: 'Scan emailed barcode' },
} as const;

function PassCard({ p }: { p: Pass }) {
  const priceDisplay = p.price === null ? 'TBD' : `${p.price.resident} / ${p.price.nonResident}`;
  const subDisplay = p.price === null ? 'price to confirm' : 'resident / non-resident';
  const entry = ENTRY[p.entry];

  return (
    <div
      className={`relative rounded-2xl p-5 transition-shadow ${
        p.featured
          ? 'border-2 border-[#2a5caa] bg-[#eaf1fa] shadow-[0_1px_5px_rgba(42,92,170,0.15)]'
          : 'border border-[#dde3e9] bg-white'
      }`}
    >
      {p.featured && (
        <div className="absolute -top-2.5 left-5 bg-[#d5ad1a] text-[#3d3008] font-semibold uppercase tracking-wider text-[10px] px-2.5 py-0.5 rounded">Most popular</div>
      )}
      <div className="flex justify-between items-start mb-3 gap-3">
        <div className="flex-1">
          <div className="text-[16px] font-bold text-[#16335c] leading-tight">{p.name}</div>
          <div className="text-[13px] text-[#51606e] mt-1.5 leading-relaxed">{p.description}</div>
        </div>
        <div className="text-right shrink-0">
          <div className={`text-[20px] font-bold ${p.price === null ? 'text-[#9aa6b2]' : 'text-[#16335c]'}`}>{priceDisplay}</div>
          <div className="text-[11px] text-[#7a8794] mt-0.5">{subDisplay}</div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mb-3 text-[12px] font-medium text-[#1f4b7a] bg-white border border-[#dbe6f2] rounded-lg px-2.5 py-1.5">
        <entry.Icon size={14} className="shrink-0 text-[#2a5caa]" />
        <span className="text-[#7a8794]">Entry:</span>
        <span>{entry.label}</span>
      </div>

      <a
        href={p.link}
        target="_blank"
        rel="noopener noreferrer"
        className={`focus-ring w-full cursor-pointer h-10 rounded-lg flex items-center justify-center gap-1.5 text-[14px] font-semibold no-underline transition-colors ${
          p.featured
            ? 'bg-[#2a5caa] text-white hover:bg-[#224a89]'
            : 'border border-[#c2cad3] text-[#1f4b7a] hover:border-[#2a5caa] hover:bg-[#f4f7fb]'
        }`}
      >
        Select on City catalog
        <ExternalLink size={14} />
      </a>
    </div>
  );
}

export function PassesTab() {
  const standard = passes.filter((p) => p.tier === 'standard');
  const premium = passes.filter((p) => p.tier === 'premium');

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[30px] font-semibold uppercase tracking-wide text-[#16335c] leading-none">Passes &amp; Fees</h1>
        <p className="text-[14px] text-[#51606e] mt-2 leading-relaxed">Pay ahead — no payment is taken at the pool. Pre-pay to attend any drop-in program.</p>
      </div>

      {/* Standard */}
      <div className="flex flex-col gap-3">
        <div className="text-[12px] font-semibold uppercase tracking-wider text-[#51606e]">Standard</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {standard.map((p, i) => <PassCard key={i} p={p} />)}
        </div>
      </div>

      {/* Premium */}
      <div className="flex flex-col gap-3">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-wider text-[#51606e]">Premium</div>
          <div className="text-[12px] text-[#7a8794] mt-0.5">Everything in standard, plus Berkeley Aquatic Masters &amp; Senior Exercise.</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {premium.map((p, i) => <PassCard key={i} p={p} />)}
        </div>
      </div>

      {/* Getting in */}
      <div className="rounded-2xl border border-[#dde3e9] bg-white p-5">
        <div className="text-[12px] font-semibold uppercase tracking-wider text-[#51606e] mb-3">Getting in at the pool</div>
        <div className="flex flex-col gap-3 text-[14px] text-[#3a4651]">
          <div className="flex items-start gap-2.5">
            <UserCheck size={16} className="mt-0.5 shrink-0 text-[#2a5caa]" />
            <span><span className="font-semibold text-[#1a1a1a]">Any 10-Swim or Monthly pass:</span> just give the guard your name at the entrance — these are tied to your account, nothing to scan.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <Barcode size={16} className="mt-0.5 shrink-0 text-[#2a5caa]" />
            <span><span className="font-semibold text-[#1a1a1a]">Any Daily ticket:</span> scan the barcode emailed to you after you buy — have it ready on your phone.</span>
          </div>
        </div>
      </div>

      {/* How to pay */}
      <div className="rounded-2xl border border-[#dde3e9] bg-white p-5">
        <div className="text-[12px] font-semibold uppercase tracking-wider text-[#51606e] mb-3">How to pay</div>
        <div className="flex flex-col gap-2.5 text-[14px] text-[#3a4651]">
          <div className="flex items-start gap-2">
            <Globe size={15} className="mt-0.5 shrink-0 text-[#9aa6b2]" />
            <span><span className="font-semibold text-[#1a1a1a]">Online:</span> rec.berkeleyca.gov catalog</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin size={15} className="mt-0.5 shrink-0 text-[#9aa6b2]" />
            <span><span className="font-semibold text-[#1a1a1a]">In person</span> (cash/card): James Kenney Community Center, 1720 Eighth St.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
