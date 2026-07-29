# Berkeley Pools

An unofficial, mobile-first schedule viewer for City of Berkeley Aquatics — King Pool and West Campus Pool. The City publishes its schedules as PDFs that are hard to read on a phone; this pulls both pools into one place that's easy to check before you head over.

Not affiliated with, endorsed by, or operated by the City of Berkeley.

## Scope: schedules only

This is **only** a schedule viewer. It does not host lesson signups, pass
purchases, or "Register" buttons — those were removed on 2026-07-29 so the site
can't be mistaken for an official City registration channel. The old components
and data are preserved, unwired, in [`archive/signup-ui/`](archive/signup-ui/);
read that README before adding a signup surface back.

The footer links out to the City's own registration catalog. That's a pointer to
the official source, not a signup flow, and it stays.

## How the data works

The schedule is generated from the City's official PDFs — nothing is hand-typed.

```
pdfs/*.pdf  ──▶  scripts/parse_schedules.py  ──▶  src/data/schedules/<pool>-<season>.json  ──▶  app
                     (run by GitHub Actions)                                       (picks active by date)
```

1. **Drop a PDF** into `pdfs/` (one per pool per season — filename doesn't matter; the pool, season, date range and "last revised" date are read from inside).
2. **Push it.** The [`update-schedules`](.github/workflows/update-schedules.yml) GitHub Action runs the parser, commits the regenerated JSON, and Vercel redeploys.
3. The app loads every schedule and shows, **per pool**, the one whose date range covers today (Berkeley time) — so King and West can be on different seasons during a changeover.

The parser ([`scripts/parse_schedules.py`](scripts/parse_schedules.py)) reads each PDF's program × day grid by locating the row-separator rules and day-column positions, then assigns each time token to a cell by coordinate. It also extracts the date range, the `**` limited-lane markers, and closure dates from the page text. Output conforms to the `PoolSeason` contract in [`src/data/types.ts`](src/data/types.ts).

> Validated against the previously hand-typed schedule: the parser reproduced it exactly except for three cells where the hand-typed data was wrong and the parser was right.

### Static content

Program descriptions, ages, and drop-in costs aren't in the schedule PDFs, so they're hand-maintained in [`src/data/catalog.json`](src/data/catalog.json). (Lesson and pass data used to live there too — it now sits in `archive/signup-ui/catalog-signup-data.json` and is not bundled.)

## Run the parser locally

```bash
pip install -r scripts/requirements.txt
python scripts/parse_schedules.py
```

## Development

```bash
npm install
npm run dev      # local dev server
npm run lint     # tsc --noEmit
npm run test     # vitest
npm run build    # production build (also generates the PWA service worker)
```

## Stack

Vite + React + TypeScript + Tailwind, deployed on Vercel. Installable as a PWA. Schedule pipeline in Python (pdfplumber) via GitHub Actions.
