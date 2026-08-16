"use client";

import type { LeaderboardEntry } from "@/lib/types";
import { LeaderboardList } from "./LeaderboardList";

/** منصة الفائزين نهاية اللعبة */
export function Podium({ entries }: { entries: LeaderboardEntry[] }) {
  const winner = entries[0];
  const [second, third] = [entries[1], entries[2]];

  return (
    <div className="mx-auto w-full max-w-xl">
      {/* الفائز */}
      <div className="text-center">
        <div className="text-7xl">👑</div>
        <div className="mt-2 text-3xl font-black text-amber-300 sm:text-4xl">
          {winner?.name}
        </div>
        <div className="mt-1 text-lg font-bold text-white/80">
          {winner?.score} نقطة — بطل التحدي! 🎉
        </div>
        <div className="mx-auto mt-2 h-1.5 w-32 rounded-full bg-gradient-to-l from-amber-300 to-yellow-500" />
      </div>

      {/* منصة الأوائل */}
      <div className="mt-6 grid grid-cols-3 items-end gap-2">
        <div className="order-1 flex flex-col items-center">
          <div className="text-2xl font-black text-slate-200">{second?.name}</div>
          <div className="text-sm font-bold text-white/70">{second?.score ?? 0} نقطة</div>
          <div className="mt-2 flex h-24 w-full items-start justify-center rounded-t-2xl bg-slate-400/80 pt-3 text-4xl">
            🥈
          </div>
        </div>
        <div className="order-2 flex flex-col items-center">
          <div className="text-2xl font-black text-amber-300">{winner?.name}</div>
          <div className="text-sm font-bold text-white/70">{winner?.score ?? 0} نقطة</div>
          <div className="mt-2 flex h-32 w-full items-start justify-center rounded-t-2xl bg-gradient-to-b from-amber-300 to-amber-500 pt-3 text-5xl">
            🥇
          </div>
        </div>
        <div className="order-3 flex flex-col items-center">
          <div className="text-2xl font-black text-orange-200">{third?.name}</div>
          <div className="text-sm font-bold text-white/70">{third?.score ?? 0} نقطة</div>
          <div className="mt-2 flex h-20 w-full items-start justify-center rounded-t-2xl bg-orange-700/80 pt-2 text-3xl">
            🥉
          </div>
        </div>
      </div>

      {/* بقية الترتيب */}
      {entries.length > 3 && (
        <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-4">
          <h3 className="mb-2 text-sm font-black text-white/70">الترتيب الكامل</h3>
          <LeaderboardList entries={entries} />
        </div>
      )}
    </div>
  );
}
