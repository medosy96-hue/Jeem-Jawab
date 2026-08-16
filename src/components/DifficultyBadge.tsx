import { DIFFICULTY_COLORS, difficultyEmoji, difficultyLabel } from "@/lib/game";

export function DifficultyBadge({
  difficulty,
  size = "sm",
}: {
  difficulty: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-bold ${
        DIFFICULTY_COLORS[difficulty] ?? "border-white/20 bg-white/10 text-white"
      } ${size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm"}`}
    >
      <span>{difficultyEmoji(difficulty)}</span>
      <span>{difficultyLabel(difficulty)}</span>
    </span>
  );
}
