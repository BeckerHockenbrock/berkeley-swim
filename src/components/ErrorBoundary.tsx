import { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

const OFFICIAL_AQUATICS =
  'https://berkeleyca.gov/community-recreation/parks-recreation/facilities/pools-and-aquatic-programs';

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
      <div className="error-page">
        <div className="error-card">
          <div className="error-card__heading">
            <AlertTriangle size={22} aria-hidden="true" />
            <h1>Something went wrong</h1>
          </div>
          <p>
            This unofficial schedule failed to load. Reload the page, or check the City's
            official listings for today's times.
          </p>
          <div className="error-card__actions">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="error-card__primary pressable"
            >
              Reload
            </button>
            <a
              href={OFFICIAL_AQUATICS}
              target="_blank"
              rel="noopener noreferrer"
              className="error-card__secondary pressable"
            >
              City pool information ↗
            </a>
          </div>
        </div>
      </div>
    );
  }
}
