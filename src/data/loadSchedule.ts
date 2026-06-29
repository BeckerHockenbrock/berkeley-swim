import type { ScheduleData } from './types';
import scheduleJson from './schedule.json';

/**
 * The single source of truth for all schedule, lesson and pass content.
 *
 * Today this is a hand-maintained JSON file. In the future a PDF parser will
 * emit the same shape (see README) and this loader stays unchanged.
 *
 * The `ScheduleData` assertion makes the build fail if `schedule.json` ever
 * drifts from the contract (missing or wrong-typed fields), and gives consumers
 * the index-friendly map types (e.g. `programs[slug]`). We assert rather than
 * annotate because TypeScript widens JSON string literals (e.g. a pass's
 * `entry` value) to `string`, which a plain annotation would reject.
 */
export const schedule = scheduleJson as ScheduleData;

export const meta = schedule.meta;
export const programs = schedule.programs;
export const pools = schedule.pools;
export const lessons = schedule.lessons;
export const passes = schedule.passes;
