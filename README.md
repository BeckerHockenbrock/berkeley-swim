# Berkeley Swim

An unofficial schedule and information viewer for City of Berkeley Aquatics (King Pool & West Campus Pool).

## Data Schema

The application logic is driven by a strict data contract defined in `src/data/types.ts`. All schedule data lives in `src/data/schedule.json`.

The data structure includes:
- **Meta**: Season name, valid dates, and closed dates.
- **Programs**: Descriptions, ages, and costs for different swim programs.
- **Pools**: The actual week schedules mapped by program and day.
- **Lessons & Passes**: Information on swim lessons and available passes.

The application uses a typed loader (`src/data/loadSchedule.ts`) to validate the `schedule.json` file against the TypeScript interfaces at compile time.

## Update Workflow

To update the schedule data:
1. Modify `src/data/schedule.json` with the latest changes from the official City of Berkeley sources.
2. Ensure the JSON still matches the TypeScript schema in `src/data/types.ts`.
3. Run `npm run lint` and `npm run build` to verify the types.

### Future Improvements
In the future, a PDF parser could be implemented to automatically extract the schedule from the official PDFs and emit the same JSON structure, dropping the need for manual edits.

## Development

- `npm install`
- `npm run dev` to start the local development server.
- `npm run build` to build for production.
- `npm run test` to run the unit tests via Vitest.