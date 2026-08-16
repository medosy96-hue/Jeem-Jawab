"use client";

import { ANSWER_COLORS, ANSWER_LETTERS } from "@/lib/game";

interface Props {
  text: string;
  options: string[];
  correctIndex: number | null;
  selectedIndex: number | null;
  answered: boolean;
  reveal: boolean;
  imageUrl?: string | null;
  onSelect: (i: number) => void;
}

/** خيارات الإجابة — ملونة بأسلوب الكاهوت */
export function AnswerOptions({
  text,
  options,
  correctIndex,
  selectedIndex,
  answered,
  reveal,
  imageUrl,
  onSelect,
}: Props) {
  return (
    <div>
      <h2 className="text-lg leading-relaxed font-extrabold text-slate-900 sm:text-2xl">
        {text}
      </h2>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt="صورة السؤال"
          className="mt-4 max-h-56 w-full rounded-2xl object-cover shadow-md"
        />
      ) : null}
      <div className="mt-5 grid gap-3">
        {options.map((opt, i) => {
          const color = ANSWER_COLORS[i];
          let cls = `${color.bg} ${color.text ?? "text-white"}`;
          let icon: string | null = null;

          if (reveal) {
            if (i === correctIndex) {
              cls = "bg-emerald-500 text-white scale-[1.02]";
              icon = "✅";
            } else if (i === selectedIndex) {
              cls = "bg-rose-500 text-white";
              icon = "❌";
            } else {
              cls = "bg-slate-200 text-slate-500";
            }
          } else if (answered) {
            if (i === selectedIndex) {
              cls = `${color.bg} text-white ring-4 ${color.ring}`;
            } else {
              cls = "bg-slate-200 text-slate-400";
            }
          }

          const disabled = answered || reveal;

          return (
            <button
              key={i}
              disabled={disabled}
              onClick={() => onSelect(i)}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-right font-bold shadow-lg transition-all sm:text-lg ${cls} ${
                disabled ? "cursor-default" : "hover:brightness-110 active:scale-95"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base font-black ${
                  reveal && i === correctIndex ? "bg-white/25" : "bg-black/15"
                }`}
              >
                {ANSWER_LETTERS[i]}
              </span>
              <span className="flex-1">{opt}</span>
              {icon && <span className="text-xl">{icon}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
