import kingSchedule from "../../public/data/king.json";
import westSchedule from "../../public/data/west.json";
import { isPoolId, POOL_IDS } from "./schema";

/** @type {Record<import("./schema").PoolId, import("./schema").ScheduleDocument>} */
const schedulesByPool = {
  king: kingSchedule,
  west: westSchedule,
};

export { POOL_IDS };

export function getSchedule(poolId) {
  if (!isPoolId(poolId)) {
    throw new Error(`Unknown pool id: ${poolId}`);
  }
  return schedulesByPool[poolId];
}

export function getAllSchedules() {
  return POOL_IDS.map((poolId) => schedulesByPool[poolId]);
}

export function getPoolOptions() {
  return POOL_IDS.map((poolId) => schedulesByPool[poolId].pool);
}
