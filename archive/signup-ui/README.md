# Archived: registration / signup UI

**Do not re-add this code to `src/` without checking first.**

Everything in this folder was live in Berkeley Pools until **2026-07-29**, when the
project was deliberately narrowed to a **schedule viewer only**.

## Why it was removed

The app is unofficial and not operated by the City of Berkeley. Surfacing prices,
pass tiers, lesson levels and "Register" buttons made it look like a place you
could sign up — which risks being mistaken for an official City registration
channel, and means the site has to be kept in sync with catalog pricing it does
not control. Project stakeholder decision: strip the signup surface, keep the
schedule.

The app still links out to the City's own registration catalog from the footer.
That's a pointer to the official source, not a signup flow, and it stays.

## What's here

| File | Was |
| --- | --- |
| `LessonsTab.tsx` | The **Lessons** tab — Learn-To-Swim / Preschool Aquatics level cards with Register buttons. |
| `PassesTab.tsx` | The **Passes** tab — pass pricing cards with "Select on City catalog" buttons. |
| `catalog-signup-data.json` | The `lessons` and `passes` keys lifted out of `src/data/catalog.json`. |

A third piece isn't a file: `HeroCard` in `src/components/ScheduleTab.tsx` used to
carry a **Register** link pointing at the 10-Swim Pass. That link was deleted
inline — see git history for `ScheduleTab.tsx` around 2026-07-29.

## If you ever need to restore it

1. `git mv` the two components back to `src/components/`.
2. Merge `catalog-signup-data.json` back into `src/data/catalog.json`.
3. Re-add `lessons` / `passes` to the `Catalog` interface in `src/data/types.ts`
   and re-export them from `src/data/loadSchedule.ts`. The `Lesson`, `Lessons`,
   `Pass`, `PassPrice`, `PassEntry` and `PassTier` types were left in place
   precisely so this is a small change.
4. Restore the tab entries and bottom tab bar in `src/App.tsx`.
5. Drop `archive` from `exclude` in `tsconfig.json`.

This folder is excluded from `tsc` and is not bundled, so the imports in these
components (`../data/loadSchedule`) intentionally do not resolve from here.
