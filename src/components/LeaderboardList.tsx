import type { LeaderboardEntry } from "@/lib/types";

const MEDALS = ["🥇", "🥈", "🥉"];

/** قائمة الترتيب */
export function LeaderboardList({
  entries,
  compact = false,
  highlightId,
}: {
  entries: LeaderboardEntry[];
  compact?: boolean;
  highlightId?: string | null;
}) {
  const list = compact ? entries.slice(0, 5) : entries;
  return (
    <ul className="divide-y divide-white/10">
      {list.map((e) => (
        <li
          key={e.playerId}
          className={`flex items-center gap-3 px-1 py-2 ${
            e.isYou || e.playerId === highlightId ? "rounded-xl bg-white/10" : ""
          }`}
        >
          <span className="w-7 text-center text-sm font-black text-white/70">
            {e.rank <= 3 ? MEDALS[e.rank - 1] : e.rank}
          </span>
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black text-white ${
              e.isHost ? "bg-amber-500" : "bg-indigo-500"
            }`}
          >
            {e.name.slice(0, 2)}
          </span>
          <span className="flex-1 truncate text-sm font-bold text-white">
            {e.name}
            {e.isYou && (
              <span className="mr-1 rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] text-emerald-300">
                أنت
              </span>
            )}
            {e.isHost && (
              <span className="mr-1 rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] text-amber-300">
                المضيف
              </span>
            )}
          </span>
          <span className="text-sm font-black text-emerald-300">{e.score} نقطة</span>
        </li>
      ))}
    </ul>
  );
}
