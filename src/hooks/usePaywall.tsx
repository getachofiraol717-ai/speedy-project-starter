import { useEffect, useState, useCallback } from "react";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const LIMIT_3D = 3;
const LIMIT_AI = 5;

const KEY_3D = "paywall_3d_visited";
const KEY_AI = "paywall_ai_count";

function readSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function writeSet(key: string, set: Set<string>) {
  localStorage.setItem(key, JSON.stringify(Array.from(set)));
}

function readCount(key: string): number {
  return parseInt(localStorage.getItem(key) || "0", 10) || 0;
}

export function usePaywall() {
  const { user } = useAuth();
  const { isAdmin } = useAdminCheck();
  const [visited3D, setVisited3D] = useState<Set<string>>(new Set());
  const [aiCount, setAiCount] = useState(0);
  const [hasPremium, setHasPremium] = useState(false);

  // Check premium status from DB (server-side, expires after 30 days)
  useEffect(() => {
    if (!user) {
      setHasPremium(false);
      return;
    }
    (async () => {
      const { data } = await supabase.rpc("has_active_role" as any, {
        _user_id: user.id,
        _role: "premium" as any,
      });
      setHasPremium(!!data);
    })();
  }, [user?.id]);

  const isPro = isAdmin || hasPremium;

  useEffect(() => {
    setVisited3D(readSet(KEY_3D));
    setAiCount(readCount(KEY_AI));
  }, [user?.id]);

  const can3D = useCallback(
    (slug: string): boolean => {
      if (isPro) return true;
      if (visited3D.has(slug)) return true;
      return visited3D.size < LIMIT_3D;
    },
    [isPro, visited3D]
  );

  const register3DVisit = useCallback(
    (slug: string) => {
      if (isPro) return;
      if (visited3D.has(slug)) return;
      const next = new Set(visited3D);
      next.add(slug);
      writeSet(KEY_3D, next);
      setVisited3D(next);
    },
    [isPro, visited3D]
  );

  const canAI = useCallback((): boolean => {
    if (isPro) return true;
    return aiCount < LIMIT_AI;
  }, [isPro, aiCount]);

  const registerAIQuestion = useCallback(() => {
    if (isPro) return;
    const next = aiCount + 1;
    localStorage.setItem(KEY_AI, String(next));
    setAiCount(next);
  }, [isPro, aiCount]);

  return {
    isPro,
    isAdmin,
    isPremium: hasPremium,
    visited3D,
    aiCount,
    limit3D: LIMIT_3D,
    limitAI: LIMIT_AI,
    can3D,
    register3DVisit,
    canAI,
    registerAIQuestion,
    remaining3D: isPro ? Infinity : Math.max(0, LIMIT_3D - visited3D.size),
    remainingAI: isPro ? Infinity : Math.max(0, LIMIT_AI - aiCount),
  };
}
