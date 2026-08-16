"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import {
  QUESTION_TIME_OPTIONS,
  RESULT_TIME_OPTIONS,
  TOTAL_QUESTIONS_OPTIONS,
  CATEGORIES,
  DIFFICULTY_LEVELS,
} from "@/lib/game";

/** نموذج إنشاء لعبة جديدة */
export function CreateForm({ mode }: { mode: "local" | "online" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [questionSeconds, setQuestionSeconds] = useState(20);
  const [resultSeconds, setResultSeconds] = useState(5);
  const [totalQuestions, setTotalQuestions] = useState(20);
  const [manualAdvance, setManualAdvance] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [difficulties, setDifficulties] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("اكتب اسمك أولاً");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          hostName: name.trim(),
          questionSeconds,
          resultSeconds,
          totalQuestions,
          manualAdvance,
          categories,
          difficulties,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "تعذر إنشاء اللعبة");
        return;
      }
      localStorage.setItem(
        "qc_host",
        JSON.stringify({ code: data.code, playerId: data.playerId, name: name.trim() })
      );
      router.push(`/host/${data.code}`);
    } finally {
      setCreating(false);
    }
  };

  const isLocal = mode === "local";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-4 py-10">
      <div className="mb-6">
        <Brand />
      </div>

      <div className="w-full rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
        <div className="text-center">
          <div className="text-5xl">{isLocal ? "📱" : "🌍"}</div>
          <h1 className="mt-3 text-2xl font-black text-white">
            {isLocal ? "لعبة محلية — QR" : "لعبة أونلاين — رابط"}
          </h1>
          <p className="mt-1 text-sm font-bold text-white/60">
            {isLocal
              ? "سيظهر رمز QR ليصوره أصدقاؤك وينضموا"
              : "سيظهر رابط تشاركه مع أصدقائك أينما كانوا"}
          </p>
        </div>

        <form onSubmit={create} className="mt-6 space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            placeholder="اسمك (المضيف)..."
            className="w-full rounded-2xl border border-white/20 bg-black/40 px-4 py-3.5 text-center text-lg font-black text-white placeholder-white/40 outline-none focus:border-emerald-400"
          />

          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-black text-white">📂 تصنيفات الأسئلة</span>
              <button
                type="button"
                onClick={() => setCategories([])}
                className={`rounded-full px-3 py-1 text-[11px] font-black transition ${
                  categories.length === 0
                    ? "bg-emerald-600 text-white"
                    : "bg-white/10 text-white/60 hover:bg-white/20"
                }`}
              >
                الكل 🎲
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {CATEGORIES.map((category) => {
                const active = categories.includes(category.id);
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() =>
                      setCategories((current) =>
                        active
                          ? current.filter((id) => id !== category.id)
                          : [...current, category.id]
                      )
                    }
                    className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
                      active
                        ? "bg-red-600 text-white ring-2 ring-red-300"
                        : "bg-white/10 text-white/60 hover:bg-white/20"
                    }`}
                  >
                    {category.emoji} {category.label}
                    {active ? " ✓" : ""}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] font-bold text-white/40">
              {categories.length === 0
                ? "سيتم اختيار أسئلة من جميع التصنيفات"
                : `ستتضمن اللعبة: ${categories
                    .map((id) => CATEGORIES.find((c) => c.id === id)?.label)
                    .join("، ")}`}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-black text-white">🎚️ مستوى الصعوبة</span>
              <button
                type="button"
                onClick={() => setDifficulties([])}
                className={`rounded-full px-3 py-1 text-[11px] font-black transition ${
                  difficulties.length === 0
                    ? "bg-emerald-600 text-white"
                    : "bg-white/10 text-white/60 hover:bg-white/20"
                }`}
              >
                الكل 🎲
              </button>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {DIFFICULTY_LEVELS.map((level) => {
                const active = difficulties.includes(level.id);
                return (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() =>
                      setDifficulties((current) =>
                        active
                          ? current.filter((id) => id !== level.id)
                          : [...current, level.id]
                      )
                    }
                    className={`rounded-xl px-3 py-2.5 text-xs font-black transition ${
                      active
                        ? "bg-red-600 text-white ring-2 ring-red-300"
                        : "bg-white/10 text-white/60 hover:bg-white/20"
                    }`}
                  >
                    {level.emoji} {level.label}
                    {active ? " ✓" : ""}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] font-bold text-white/40">
              {difficulties.length === 0
                ? "سيتم اختيار أسئلة من كل المستويات (سهل ومتوسط وصعب)"
                : `ستتضمن اللعبة فقط: ${difficulties
                    .map((id) => DIFFICULTY_LEVELS.find((d) => d.id === id)?.label)
                    .join("، ")}`}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-black text-white">🔢 عدد الأسئلة</span>
              <span className="text-xs font-bold text-white/50">في هذه الجولة</span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-1.5 sm:grid-cols-7">
              {TOTAL_QUESTIONS_OPTIONS.map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setTotalQuestions(count)}
                  className={`rounded-xl py-2 text-xs font-black transition ${
                    totalQuestions === count
                      ? "bg-emerald-600 text-white ring-2 ring-emerald-300"
                      : "bg-white/10 text-white/60 hover:bg-white/20"
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] font-bold text-white/40">
              {totalQuestions} سؤالاً في هذه الجولة
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-black text-white">🎮 الانتقال بين الأسئلة</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setManualAdvance(false)}
                className={`rounded-xl px-3 py-2.5 text-xs font-black transition ${
                  !manualAdvance
                    ? "bg-emerald-600 text-white ring-2 ring-emerald-300"
                    : "bg-white/10 text-white/60 hover:bg-white/20"
                }`}
              >
                ⏱️ تلقائي <span className="block text-[9px] font-bold opacity-70">بعد مدة النتيجة</span>
              </button>
              <button
                type="button"
                onClick={() => setManualAdvance(true)}
                className={`rounded-xl px-3 py-2.5 text-xs font-black transition ${
                  manualAdvance
                    ? "bg-red-600 text-white ring-2 ring-red-300"
                    : "bg-white/10 text-white/60 hover:bg-white/20"
                }`}
              >
                👆 يدوي <span className="block text-[9px] font-bold opacity-70">المضيف يضغط التالي</span>
              </button>
            </div>
            {manualAdvance && (
              <p className="mt-2 text-[11px] font-bold text-red-200">
                ستتوقف اللعبة بعد كل سؤال حتى يضغط المضيف «السؤال التالي»
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-black text-white">⏱️ وقت الإجابة</span>
              <span className="text-xs font-bold text-white/50">لكل سؤال</span>
            </div>
            <div className="mt-3 grid grid-cols-6 gap-1.5">
              {QUESTION_TIME_OPTIONS.map((seconds) => (
                <button
                  key={seconds}
                  type="button"
                  onClick={() => setQuestionSeconds(seconds)}
                  className={`rounded-xl py-2 text-xs font-black transition ${
                    questionSeconds === seconds
                      ? "bg-emerald-600 text-white ring-2 ring-emerald-300"
                      : "bg-white/10 text-white/60 hover:bg-white/20"
                  }`}
                >
                  {seconds}ث
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-black text-white">📊 مدة ظهور النتيجة</span>
              <span className="text-xs font-bold text-white/50">ثم السؤال التالي</span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {RESULT_TIME_OPTIONS.map((seconds) => (
                <button
                  key={seconds}
                  type="button"
                  onClick={() => setResultSeconds(seconds)}
                  className={`rounded-xl py-2 text-xs font-black transition ${
                    resultSeconds === seconds
                      ? "bg-red-600 text-white ring-2 ring-red-300"
                      : "bg-white/10 text-white/60 hover:bg-white/20"
                  }`}
                >
                  {seconds} ثوانٍ
                </button>
              ))}
            </div>
          </div>

          <p className="rounded-xl bg-emerald-500/10 px-3 py-2 text-center text-[11px] font-bold text-emerald-200">
            💡 إذا أجاب الجميع، تظهر النتيجة فوراً حتى لو بقي وقت
          </p>

          {error && (
            <p className="rounded-xl bg-rose-500/20 px-3 py-2 text-center text-xs font-bold text-rose-300">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={creating}
            className="w-full rounded-2xl bg-gradient-to-l from-emerald-600 to-green-500 py-4 text-lg font-black text-white shadow-xl shadow-emerald-950/30 transition hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            {creating ? "جارٍ الإنشاء..." : "🎮 إنشاء اللعبة"}
          </button>
        </form>

        <div className="mt-5 flex justify-center gap-2">
          <Link
            href="/create?mode=local"
            className={`rounded-full px-4 py-1.5 text-xs font-black transition ${
              isLocal ? "bg-emerald-600 text-white" : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            📱 محلية
          </Link>
          <Link
            href="/create?mode=online"
            className={`rounded-full px-4 py-1.5 text-xs font-black transition ${
              !isLocal ? "bg-red-600 text-white" : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            🌍 أونلاين
          </Link>
        </div>
      </div>
    </main>
  );
}
