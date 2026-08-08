import { useMemo, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import {
  AlertTriangle,
  ExternalLink,
  Info,
  MapPin,
  MessageSquarePlus,
  Phone,
} from 'lucide-react';
import { ScheduleTab } from './components/ScheduleTab';
import { DevBar } from './components/DevBar';
import { getBerkeleyNow, getScheduleStatus, formatDate } from './lib/schedule';
import { resolvePools } from './data/loadSchedule';

const OFFICIAL_CATALOG = 'https://rec.berkeleyca.gov/CA/berkeley-ca/catalog';
const OFFICIAL_AQUATICS =
  'https://berkeleyca.gov/community-recreation/parks-recreation/facilities/pools-and-aquatic-programs';
/**
 * Feedback address, assembled at runtime rather than written as a literal so it
 * never appears as a matchable `user@host` string in the shipped bundle. That
 * defeats the regex harvesters that scrape public sites for addresses; it is
 * not real protection against a crawler that executes our JavaScript.
 *
 * The durable fix is a dedicated alias you can rotate or filter on if it does
 * start attracting spam — swap the two halves below and nothing else changes.
 */
const FEEDBACK_ADDRESS = ['bhocken91', 'gmail.com'].join('@');

const FEEDBACK_MAILTO =
  `mailto:${FEEDBACK_ADDRESS}?subject=` +
  encodeURIComponent('Berkeley Pools — bug / feature') +
  '&body=' +
  encodeURIComponent("What's wrong, or what would you like to see?\n\n");

const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const IS_DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

export default function App() {
  const [overrideDate, setOverrideDate] = useState<Date | null>(null);
  const now = getBerkeleyNow(overrideDate ?? undefined);
  const todayLabel = `${FULL_DAYS[now.dayIndex]}, ${formatDate(now.dateISO)}`;
  const pools = useMemo(() => resolvePools(now.dateISO), [now.dateISO]);

  const bothClosed = [pools.king, pools.west].every(
    (p) => getScheduleStatus(p, now.dateISO).kind === 'closed',
  );
  const notice = bothClosed
    ? { tone: 'closed' as const, text: `Both pools are closed today, ${formatDate(now.dateISO)}.` }
    : null;

  return (
    <div className="app-root">
      {/* Dev Mode Bar */}
      {IS_DEV_MODE && (
        <DevBar overrideDate={overrideDate} onOverrideChange={setOverrideDate} />
      )}

      <a className="skip-link" href="#main-content">Skip to pool schedules</a>

      {/* Lightweight material reserved for app-level navigation. */}
      <header className={`app-toolbar ${IS_DEV_MODE ? 'app-toolbar--dev' : ''}`}>
        <div className="app-toolbar__inner">
          <div className="brand-lockup">
            <img src="/logo.png" alt="" className="brand-lockup__logo" />
            <div className="brand-lockup__text">
              <span className="brand-lockup__name">Berkeley Pools</span>
              <span className="brand-lockup__descriptor">Community schedule</span>
            </div>
          </div>

          <a
            href={OFFICIAL_AQUATICS}
            target="_blank"
            rel="noopener noreferrer"
            className="official-shortcut pressable"
            aria-label="Official City of Berkeley pool information"
          >
            <span className="official-shortcut__wide">City pool info</span>
            <span className="official-shortcut__compact">Official</span>
            <ExternalLink size={15} aria-hidden="true" />
          </a>
        </div>
      </header>

      {/* Main content */}
      <main id="main-content" className="app-main">
        <section className="page-intro" aria-labelledby="page-title">
          <p className="page-intro__eyebrow">{todayLabel}</p>
          <h1 id="page-title">Today at Berkeley’s pools</h1>
          <p>See what’s happening now, then explore the full week at King and West Campus.</p>
        </section>

        {/* Staleness / closure notices */}
        {notice && (
          <div className={`status-notice status-notice--${notice.tone}`} role="status">
            <AlertTriangle size={18} aria-hidden="true" />
            <p>{notice.text}</p>
          </div>
        )}

        <ScheduleTab overrideDate={overrideDate} />

        {/* Footer */}
        <footer className="app-footer">
          <div className="app-footer__grid">
            <section aria-labelledby="pool-details-heading">
              <h2 id="pool-details-heading">Pool details</h2>
              <div className="footer-list">
                <div><MapPin size={17} aria-hidden="true" /><span>King Pool<br /><small>1700 Hopkins Street</small></span></div>
                <div><MapPin size={17} aria-hidden="true" /><span>West Campus Pool<br /><small>2100 Browning Street</small></span></div>
                <a href="tel:+15109815150"><Phone size={17} aria-hidden="true" /><span>(510) 981-5150</span></a>
              </div>
            </section>

            <section aria-labelledby="helpful-links-heading">
              <h2 id="helpful-links-heading">Helpful links</h2>
              <div className="footer-links">
                <a href={OFFICIAL_CATALOG} target="_blank" rel="noopener noreferrer">
                  City registration catalog <ExternalLink size={14} aria-hidden="true" />
                </a>
                <a href={OFFICIAL_AQUATICS} target="_blank" rel="noopener noreferrer">
                  City of Berkeley Aquatics <ExternalLink size={14} aria-hidden="true" />
                </a>
              </div>

              <a href={FEEDBACK_MAILTO} className="feedback-link pressable">
                <MessageSquarePlus size={16} aria-hidden="true" />
                Report a bug or request a feature
              </a>
            </section>
          </div>

          <div className="independent-notice">
            <Info size={20} aria-hidden="true" />
            <div>
              <strong>Independent community guide</strong>
              <p>
                Berkeley Pools is an unofficial site and is not affiliated with, endorsed by,
                or operated by the City of Berkeley. Schedules can change—confirm details on
                the official City pool pages before visiting.
              </p>
              <span>© {new Date().getFullYear()} Berkeley Pools</span>
            </div>
          </div>
        </footer>
      </main>

      <Analytics />
    </div>
  );
}
