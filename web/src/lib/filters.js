export const ACTIVITY_FILTERS = [
  { id: "all", label: "All", match: null },
  { id: "lap", label: "Lap Swim", match: /lap/i },
  { id: "family", label: "Family Swim", match: /family|community/i },
  { id: "lessons", label: "Lessons", match: /lesson|barracuda|masters/i },
  { id: "zumba", label: "Aqua Zumba", match: /zumba/i },
  { id: "senior", label: "Senior", match: /senior/i },
];

export const DEFAULT_ACTIVITY_FILTER = "all";

export function isActivityFilterId(value) {
  return ACTIVITY_FILTERS.some((filter) => filter.id === value);
}

export function entryMatchesFilter(entry, filterId) {
  if (filterId === "all") return true;
  const filter = ACTIVITY_FILTERS.find((f) => f.id === filterId);
  if (!filter || !filter.match) return true;
  return filter.match.test(entry.activity);
}
