import { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

const OFFICIAL_AQUATICS = 'https://berkeleyca.gov/community-recreation/parks-recreation/aquatics';

interface Props {
  children: ReactNode;
}

interface State {
  failed: boolean;
}

/**
 * Last line of defence for a site whose whole job is answering "is the pool open
 * right now". A render crash — most plausibly a schedule JSON that doesn't match
 * the `PoolSeason` contract, since those files are machine-generated from PDFs
 * the City can reformat at any time — would otherwise leave a blank white page
 * with no way to reach the real answer. Send people to the official source
 * instead.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div className="min-h-screen bg-[#eef1f5] text-[#1a1a1a] font-sans flex items-center justify-center px-4">
        <div className="max-w-[420px] w-full bg-white rounded-2xl border border-[#dde3e9] shadow-sm p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[#7c2229]">
            <AlertTriangle size={20} className="shrink-0" />
            <h1 className="font-display text-[22px] font-semibold uppercase tracking-wide leading-none">
              Something went wrong
            </h1>
          </div>
          <p className="text-[14px] text-[#51606e] leading-relaxed">
            This unofficial schedule failed to load. Reload the page, or check the City's
            official listings for today's times.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="focus-ring inline-flex items-center h-9 px-4 rounded-lg bg-[#2a5caa] text-white text-[13px] font-semibold cursor-pointer hover:bg-[#224a89] transition-colors"
            >
              Reload
            </button>
            <a
              href={OFFICIAL_AQUATICS}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex items-center h-9 px-4 rounded-lg border border-[#c2cad3] text-[13px] font-semibold text-[#1f4b7a] no-underline hover:border-[#2a5caa] hover:bg-[#f4f7fb] transition-colors"
            >
              City of Berkeley Aquatics ↗
            </a>
          </div>
        </div>
      </div>
    );
  }
}
