"use client";

import { useCallback, useEffect, useState } from "react";

export const FILTER_KEY = "berkeleySwim.filter";
export const POOL_KEY = "berkeleySwim.pool";
export const FILTER_TIP_KEY = "berkeleySwim.filterTipDismissed";

function readJSON(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage may be unavailable (private mode, quota); silently ignore.
  }
}

export function useStoredState(key, fallback, isValid) {
  const [value, setValue] = useState(fallback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readJSON(key, fallback);
    if (!isValid || isValid(stored)) {
      setValue(stored);
    }
    setHydrated(true);
  }, [key, fallback, isValid]);

  const update = useCallback(
    (next) => {
      setValue(next);
      writeJSON(key, next);
    },
    [key],
  );

  return [value, update, hydrated];
}
