"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { getStoredUserName } from "./auth";

/**
 * Sunucu ile ilk istemci render'ını eşleştirir: localStorage sadece mount sonrası okunur.
 * (useState(() => getStoredUserName()) hydration hatasına yol açar.)
 */
export function useHydrationSafeDisplayName(fallback: string): [string, Dispatch<SetStateAction<string>>] {
  const [name, setName] = useState(fallback);
  useEffect(() => {
    const stored = getStoredUserName();
    if (stored) {
      setName(stored);
    }
  }, []);
  return [name, setName];
}
