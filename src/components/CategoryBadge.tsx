import { CATEGORY_COLORS, categoryEmoji, categoryLabel } from "@/lib/game";

export function CategoryBadge({ category, size = "sm" }: { category: string; size?: "sm" | "md" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-bold ${
        CATEGORY_COLORS[category] ?? "border-white/20 bg-white/10 text-white"
      } ${size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm"}`}
    >
      <span>{categoryEmoji(category)}</span>
      <span>{categoryLabel(category)}</span>
    </span>
  );
}
