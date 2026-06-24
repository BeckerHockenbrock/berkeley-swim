import type { ScheduleData } from './types';
import scheduleJson from './schedule.json';

/**
 * The single source of truth for all schedule, lesson and pass content.
 *
 * Today this is a hand-maintained JSON file. In the future a PDF parser will
 * emit the same shape (see README) and this loader stays unchanged.
 *
 * The `ScheduleData` annotation makes the build fail if `schedule.json` ever
 * drifts from the contract, and gives consumers the index-friendly map types
 * (e.g. `programs[slug]`) rather than the narrow literal JSON type.
 */
export const schedule: ScheduleData = scheduleJson;

export const meta = schedule.meta;
export const programs = schedule.programs;
export const pools = schedule.pools;
export const lessons = schedule.lessons;
export const passes = schedule.passes;
