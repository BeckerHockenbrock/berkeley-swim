#!/usr/bin/env python3
"""
Berkeley Pools — PDF → JSON schedule parser.

Reads every City of Berkeley pool-schedule PDF in `pdfs/` and emits one JSON
file per pool-season into `src/data/schedules/`, conforming to the PoolSeason
contract the app consumes (see src/data/types.ts).

The PDFs are a PROGRAMS × DAY grid. We locate program-row boundaries from the
table's full-width ruling lines, locate day columns from the weekday header
positions, then assign every time token to a (program, day) cell by coordinate.
Pool, season, date range, "last revised" date and closure dates come from the
page text.

Usage:  python scripts/parse_schedules.py
Deps:   pip install pdfplumber
"""
from __future__ import annotations
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

import pdfplumber

ROOT = Path(__file__).resolve().parent.parent
PDF_DIR = ROOT / "pdfs"
OUT_DIR = ROOT / "src" / "data" / "schedules"

DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
HEADERS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]
MONTHS = {m: i + 1 for i, m in enumerate(
    "january february march april may june july august september october november december".split()
)}
SEASON_BY_MONTH = {3: "Spring", 4: "Spring", 5: "Spring", 6: "Summer", 7: "Summer",
                   8: "Summer", 9: "Fall", 10: "Fall", 11: "Fall",
                   12: "Winter", 1: "Winter", 2: "Winter"}

# A time range. Tolerant of split tokens and whitespace around the dash / am-pm,
# because some PDFs render "4:30pm – 6:30pm" (spaced) which pdfplumber splits into
# separate words. We scan joined cell text with `finditer`, not whole tokens.
# e.g. "6:00am-7:30am**", "4:30pm – 6:30pm", "7:30am -12:30pm".
RANGE_RE = re.compile(
    r"(\d{1,2}):(\d{2})\s*(am|pm)\s*[-–—]\s*(\d{1,2}):(\d{2})\s*(am|pm)\s*(\*\*)?",
    re.IGNORECASE,
)

# Program label (lowercased) → slug. First keyword hit wins.
SLUG_RULES = [
    ("lap", "lap-swim"),
    ("master", "aquatic-masters"),
    ("independent", "independent-exercise"),
    ("dive tank", "independent-exercise"),
    ("lesson", "swim-lessons"),
    ("family", "family-swim"),
    ("community", "community-swim"),
    ("barracuda", "barracudas"),
    ("zumba", "aqua-zumba"),
    ("senior", "senior-exercise"),
    ("shower", "shower-program"),
]

POOLS = {
    "king": ("King Pool", "1700 Hopkins St",
             "https://berkeleyca.gov/community-recreation/parks-recreation/facilities/pools-and-aquatic-programs/king-pool"),
    "west": ("West Campus Pool", "2100 Browning St",
             "https://berkeleyca.gov/community-recreation/parks-recreation/facilities/pools-and-aquatic-programs/west-campus-pool"),
}


def to_24h(hour: str, minute: str, period: str) -> str:
    h = int(hour)
    if period == "am":
        h = 0 if h == 12 else h
    else:
        h = 12 if h == 12 else h + 12
    return f"{h:02d}:{minute}"


def slugify(label: str) -> str | None:
    low = label.lower()
    if "pool closed" in low or low.strip() == "closed":
        return None
    for keyword, slug in SLUG_RULES:
        if keyword in low:
            return slug
    return None


def column_of(x_center: float, centers: list[float]) -> str:
    bounds = [(centers[i] + centers[i + 1]) / 2 for i in range(len(centers) - 1)]
    i = 0
    while i < len(bounds) and x_center > bounds[i]:
        i += 1
    return DAYS[i]


def row_boundaries(page) -> list[int]:
    """Program-row separators = horizontal rules sharing the table's outer border."""
    spans: dict[int, list[float]] = defaultdict(lambda: [1e9, -1e9])
    for e in page.horizontal_edges:
        y = round(e["top"])
        spans[y][0] = min(spans[y][0], e["x0"])
        spans[y][1] = max(spans[y][1], e["x1"])
    wide = {y: (x0, x1) for y, (x0, x1) in spans.items() if x1 - x0 > 600}
    if not wide:
        return []
    # The table border is the (x0, x1) extent shared by the most rules.
    bx0, bx1 = Counter((round(x0 / 3) * 3, round(x1 / 3) * 3) for x0, x1 in wide.values()).most_common(1)[0][0]
    ys = sorted(y for y, (x0, x1) in wide.items() if abs(x0 - bx0) <= 7 and abs(x1 - bx1) <= 7)
    merged: list[int] = []
    for y in ys:
        if not merged or y - merged[-1] > 4:
            merged.append(y)
    return merged


def parse_grid(page, words) -> dict:
    centers = []
    for h in HEADERS:
        hits = [w for w in words if w["text"] == h]
        if not hits:
            raise ValueError(f"missing day header {h}")
        centers.append((hits[0]["x0"] + hits[0]["x1"]) / 2)

    bounds = row_boundaries(page)
    header_y = min(w["top"] for w in words if w["text"] in HEADERS)
    rows = [(bounds[i], bounds[i + 1]) for i in range(len(bounds) - 1) if bounds[i] >= header_y + 3]

    # Left edge of the Monday column = mirror of its right edge. Tokens left of
    # this are the program-label column. (A fixed inset clipped Monday cells whose
    # left-aligned start time, e.g. "9:00am", crept toward the label column.)
    label_boundary = centers[0] - (centers[1] - centers[0]) / 2

    schedule: dict = {}
    for y0, y1 in rows:
        band = [w for w in words if y0 - 1 <= w["top"] < y1 - 1]
        label_words = sorted(
            (w for w in band if (w["x0"] + w["x1"]) / 2 < label_boundary),
            key=lambda w: (w["top"], w["x0"]),
        )
        slug = slugify(" ".join(w["text"] for w in label_words))
        if not slug:
            continue
        week = schedule.setdefault(slug, {d: [] for d in DAYS})
        # Group every token into its day column, then scan the joined cell text.
        # Joining first means a range split across tokens ("4:30pm", "–", "6:30pm")
        # is reassembled before matching.
        columns: dict[str, list] = {d: [] for d in DAYS}
        for w in band:
            xc = (w["x0"] + w["x1"]) / 2
            if xc < label_boundary:  # skip the program-label column
                continue
            columns[column_of(xc, centers)].append(w)
        for day, toks in columns.items():
            toks.sort(key=lambda w: (round(w["top"]), w["x0"]))
            # Join WITHOUT spaces: pdfplumber sometimes splits a number ("10:00am"
            # → "1" + "0:00am..."), and ranges stay separable by their own dashes.
            joined = "".join(w["text"] for w in toks)
            for m in RANGE_RE.finditer(joined):
                slot = {"start": to_24h(m[1], m[2], m[3].lower()), "end": to_24h(m[4], m[5], m[6].lower())}
                if m[7]:
                    slot["limited"] = True
                week[day].append(slot)
    for week in schedule.values():
        for day in DAYS:
            week[day].sort(key=lambda s: s["start"])
    return schedule


def parse_closed_dates(text: str, year: int, start_month: int) -> list[str]:
    """Best-effort closure dates from prose like
    'closed for city holidays on March 30, May 18, and May 25.' and
    'closed from June 6-7 ...'. Ranges are expanded."""
    dates: set[str] = set()
    # Only the date list that directly follows a "closed ... on/from" phrase, up
    # to the next period — so the title's date range can't leak in.
    for chunk in re.findall(r"closed[^.]*?\b(?:on|from)\b\s+([^.]*?)\.", text, re.I):
        for mon, d1, d2 in re.findall(r"([A-Za-z]+)\s+(\d{1,2})(?:\s*[-–—]\s*(\d{1,2}))?", chunk):
            month = MONTHS.get(mon.lower())
            if not month:
                continue
            y = year + 1 if month < start_month else year
            for day in range(int(d1), int(d2 or d1) + 1):
                dates.add(f"{y:04d}-{month:02d}-{day:02d}")
    return sorted(dates)


def parse_program_closures(text: str, year: int, start_month: int) -> dict[str, list[str]]:
    """Single-program cancellations from prose like
    'No Community Swim on Friday, July 10, for the Derby Day Event.' These cancel
    one program on one date — NOT a full-pool closure."""
    out: dict[str, list[str]] = {}
    pattern = r"No\s+([A-Za-z][A-Za-z ]+?)\s+on\s+(?:[A-Za-z]+,?\s+)?([A-Za-z]+)\s+(\d{1,2})(?:\s*[-–—]\s*(\d{1,2}))?"
    for prog, mon, d1, d2 in re.findall(pattern, text):
        slug = slugify(prog.strip())
        month = MONTHS.get(mon.lower())
        if not slug or not month:
            continue
        y = year + 1 if month < start_month else year
        for day in range(int(d1), int(d2 or d1) + 1):
            iso = f"{y:04d}-{month:02d}-{day:02d}"
            out.setdefault(slug, [])
            if iso not in out[slug]:
                out[slug].append(iso)
    for slug in out:
        out[slug].sort()
    return out


def parse_pdf(path: Path) -> dict:
    page = pdfplumber.open(path).pages[0]
    words = page.extract_words()
    text = page.extract_text() or ""

    pool = "king" if "KING" in text.upper()[:400] else "west"
    label, address, source = POOLS[pool]

    revised = re.search(r"[Rr]evised\s+(\d{1,2})/(\d{1,2})/(\d{4})", text)
    if not revised:
        raise ValueError(f"no 'Last revised' date in {path.name}")
    year = int(revised[3])
    last_updated = f"{year:04d}-{int(revised[1]):02d}-{int(revised[2]):02d}"

    rng = re.search(r"\(([A-Za-z]+)\s+(\d{1,2})\s*[–-]\s*([A-Za-z]+)\s+(\d{1,2})\)", text)
    if not rng:
        raise ValueError(f"no date range in title of {path.name}")
    start_month = MONTHS[rng[1].lower()]

    def iso(mon: str, day: str) -> str:
        m = MONTHS[mon.lower()]
        y = year + 1 if m < start_month else year
        return f"{y:04d}-{m:02d}-{int(day):02d}"

    valid_from = iso(rng[1], rng[2])
    valid_through = iso(rng[3], rng[4])
    season = f"{SEASON_BY_MONTH[start_month]} {valid_from[:4]}"

    return {
        "pool": pool,
        "poolLabel": label,
        "address": address,
        "season": season,
        "validFrom": valid_from,
        "validThrough": valid_through,
        "lastUpdated": last_updated,
        "timezone": "America/Los_Angeles",
        "closedDates": parse_closed_dates(text, int(valid_from[:4]), start_month),
        "programClosures": parse_program_closures(text, int(valid_from[:4]), start_month),
        "source": source,
        "schedule": parse_grid(page, words),
    }


def main() -> int:
    pdfs = sorted(PDF_DIR.glob("*.pdf"))
    if not pdfs:
        print(f"No PDFs found in {PDF_DIR}")
        return 0
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    written = []
    for pdf in pdfs:
        try:
            data = parse_pdf(pdf)
        except Exception as exc:  # noqa: BLE001 — surface a clear per-file error
            print(f"  ✗ {pdf.name}: {exc}")
            continue
        slug = f"{data['pool']}-{data['season'].lower().replace(' ', '-')}.json"
        out = OUT_DIR / slug
        out.write_text(json.dumps(data, indent=2, sort_keys=False) + "\n")
        written.append(slug)
        n = sum(len(v[d]) for v in data["schedule"].values() for d in DAYS)
        print(f"  ✓ {pdf.name} → {slug}  ({len(data['schedule'])} programs, {n} slots, "
              f"{data['validFrom']}→{data['validThrough']})")
    print(f"\nWrote {len(written)} schedule file(s) to {OUT_DIR.relative_to(ROOT)}/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
