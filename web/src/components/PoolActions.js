"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

const PRIMARY =
  "inline-flex min-h-9 items-center justify-center rounded-md bg-pool px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-600";
const SECONDARY =
  "inline-flex min-h-9 items-center justify-center rounded-md border border-slate-200 bg-surface px-3 py-2 text-sm font-medium text-foreground transition hover:border-slate-300";

const subscribe = () => () => {};
const getServerSnapshot = () => false;
const getClientSnapshot = () =>
  typeof navigator !== "undefined" &&
  /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent);

export function PoolActions({ pool }) {
  const isApple = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const encoded = encodeURIComponent(pool.address);
  const directionsHref = isApple
    ? `https://maps.apple.com/?q=${encoded}`
    : `https://www.google.com/maps/search/?api=1&query=${encoded}`;
  const telHref = `tel:${pool.phone.replace(/[^0-9+]/g, "")}`;

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <Link href="/passes" className={PRIMARY}>
        Buy a pass
      </Link>
      <a href={telHref} className={SECONDARY} aria-label={`Call ${pool.name}`}>
        Call pool
      </a>
      <a
        href={directionsHref}
        target="_blank"
        rel="noopener noreferrer"
        className={SECONDARY}
      >
        Get directions
      </a>
    </div>
  );
}
