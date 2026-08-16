"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GameState } from "@/lib/types";

/** متابعة حالة اللعبة بشكل مستمر (تحديث كل ثانية تقريباً) */
export function useGameState(code: string, playerId?: string) {
  const [state, setState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const codeRef = useRef(code);
  codeRef.current = code;
  const pidRef = useRef(playerId);
  pidRef.current = playerId;

  const refresh = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (pidRef.current) params.set("playerId", pidRef.current);
      const res = await fetch(`/api/games/${codeRef.current}/state?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "تعذر الاتصال باللعبة");
        setLoading(false);
        return;
      }
      setState(data);
      setError(null);
      setLoading(false);
    } catch {
      setError("تعذر الاتصال بالخادم");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      if (stopped) return;
      await refresh();
      if (!stopped) timer = setTimeout(tick, 1000);
    };
    tick();

    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [refresh]);

  return { state, error, loading, refresh };
}
