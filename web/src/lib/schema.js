export const POOL_IDS = ["king", "west"];
export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
export const BERKELEY_TIME_ZONE = "America/Los_Angeles";

/**
 * Stable identifier for one supported Berkeley pool.
 *
 * @typedef {"king" | "west"} PoolId
 */

/**
 * Pool metadata from the parser output.
 *
 * @typedef {Object} PoolInfo
 * @property {PoolId} id Stable pool identifier.
 * @property {string} name Human-readable pool name.
 * @property {string} address Full street address for display.
 * @property {string} phone Phone number in `510-000-0000` style.
 * @property {number=} lat Optional latitude, deferred until coordinates are added.
 * @property {number=} lng Optional longitude, deferred until coordinates are added.
 */

/**
 * Date range covered by a pool schedule PDF.
 *
 * @typedef {Object} SeasonInfo
 * @property {string} label Display label, such as `Spring 2026`.
 * @property {string} valid_from First active date in `YYYY-MM-DD` format.
 * @property {string} valid_through Last active date in `YYYY-MM-DD` format.
 */

/**
 * One date when the pool should be treated as closed.
 *
 * @typedef {Object} Closure
 * @property {string} date Closure date in `YYYY-MM-DD` format.
 * @property {string} reason Short display reason.
 */

/**
 * One flattened activity time range.
 *
 * @typedef {Object} ScheduleEntry
 * @property {string} day Full English day name.
 * @property {string} activity Activity label from the source PDF.
 * @property {string} start Start time in 24-hour `HH:mm` format.
 * @property {string} end End time in 24-hour `HH:mm` format.
 * @property {string} notes Empty string when there is no note.
 */

/**
 * Complete parser output for a single pool.
 *
 * @typedef {Object} ScheduleDocument
 * @property {PoolInfo} pool Pool metadata.
 * @property {SeasonInfo} season Season metadata.
 * @property {string} last_updated ISO timestamp derived from the source PDF.
 * @property {Closure[]} closures Known closure dates.
 * @property {ScheduleEntry[]} schedule Flattened schedule entries.
 */

export function isPoolId(value) {
  return POOL_IDS.includes(value);
}
