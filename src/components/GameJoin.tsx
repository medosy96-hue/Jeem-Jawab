"use client";

import { useEffect, useState } from "react";
import { useGameState } from "@/hooks/useGameState";
import { useNow } from "@/hooks/useNow";
import { CategoryBadge } from "./CategoryBadge";
import { CountdownRing } from "./CountdownRing";
import { AnswerOptions } from "./AnswerOptions";
import { LeaderboardList } from "./LeaderboardList";
import { Podium } from "./Podium";
import { Brand } from "./Brand";
import { CATEGORIES, DIFFICULTY_LEVELS } from "@/lib/game";

interface StoredPlayer {
  code: string;
  playerId: string;
  name: string;
}

const STORAGE_KEY = "qc_player";

function loadPlayer(code: string): StoredPlayer | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredPlayer;
    return data.code === code ? data : null;
  } catch {
    return null;
  }
}

export function GameJoin({ code }: { code: string }) {
  const [player, setPlayer] = useState<StoredPlayer | null>(null);
  const [name, setName] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    setPlayer(loadPlayer(code));
  }, [code]);

  const join = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setJoinError("اكتب اسمك أولاً");
      return;
    }
    setJoining(true);
    setJoinError(null);
    try {
      const res = await fetch(`/api/games/${code}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setJoinError(data.error ?? "تعذر الانضمام");
        return;
      }
      const stored: StoredPlayer = { code, playerId: data.playerId, name: name.trim() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      setPlayer(stored);
    } finally {
      setJoining(false);
    }
  };

  if (!player) {
    return (
      <CenterShell>
        <div className="w-full max-w-md rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
          <div className="text-center">
            <div className="text-5xl">🎯</div>
            <h1 className="mt-3 text-2xl font-black text-white">انضم إلى التحدي!</h1>
            <p className="mt-1 text-sm font-bold text-white/60">
              كود اللعبة: <span className="text-emerald-300">{code}</span>
            </p>
          </div>
          <form onSubmit={join} className="mt-6 space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              placeholder="اكتب اسمك هنا..."
              className="w-full rounded-2xl border border-white/20 bg-black/50 px-4 py-3.5 text-center text-lg font-black text-white placeholder-white/40 outline-none focus:border-emerald-400"
            />
            {joinError && (
              <p className="rounded-xl bg-rose-500/20 px-3 py-2 text-center text-xs font-bold text-rose-300">
                {joinError}
              </p>
            )}
            <button
              type="submit"
              disabled={joining}
              className="w-full rounded-2xl bg-gradient-to-l from-emerald-600 to-green-500 py-4 text-lg font-black text-white shadow-xl transition hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              {joining ? "جارٍ الدخول..." : "🚀 ابدأ اللعب"}
            </button>
          </form>
        </div>
      </CenterShell>
    );
  }

  return <PlayView code={code} player={player} />;
}

/* ====================== شاشة اللعب ====================== */
function PlayView({ code, player }: { code: string; player: StoredPlayer }) {
  const { state, error, loading, refresh } = useGameState(code, player.playerId);
  const now = useNow(250);
  const [submitting, setSubmitting] = useState(false);
  const [answerError, setAnswerError] = useState<string | null>(null);

  const submitAnswer = async (i: number) => {
    if (!state || submitting || state.my?.answered || state.phase !== "active") return;
    setSubmitting(true);
    setAnswerError(null);
    try {
      const res = await fetch(`/api/games/${code}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: player.playerId,
          questionIndex: state.questionIndex,
          selectedIndex: i,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setAnswerError(data.error ?? "تعذر تسجيل الإجابة");
      }
      await refresh();
    } finally {
      setSubmitting(false);
    }
  };

  const leave = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = "/";
  };

  if (error) {
    return (
      <CenterShell>
        <Card>
          <div className="text-center">
            <div className="text-5xl">😵</div>
            <h1 className="mt-3 text-xl font-black text-white">{error}</h1>
            <button
              onClick={leave}
              className="mt-5 rounded-2xl bg-white/10 px-6 py-3 font-black text-white transition hover:bg-white/20"
            >
              العودة للرئيسية
            </button>
          </div>
        </Card>
      </CenterShell>
    );
  }

  if (loading || !state) {
    return (
      <CenterShell>
        <div className="text-center">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-white/20 border-t-emerald-400" />
          <p className="mt-4 font-black text-white/80">جارٍ التحميل...</p>
        </div>
      </CenterShell>
    );
  }

  return (
    <CenterShell>
      {/* شريط علوي */}
      <div className="mx-auto mb-4 flex w-full max-w-2xl items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-black text-white">
            {player.name.slice(0, 2)}
          </span>
          <span className="text-sm font-black text-white">{player.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-black text-emerald-300">
            ⭐ {state.my?.score ?? 0} نقطة
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/70">
            {state.playersCount}/{state.maxPlayers}
          </span>
        </div>
      </div>

      {state.phase === "lobby" && <LobbyWait state={state} />}
      {state.phase === "active" && (
        <ActiveQuestion
          state={state}
          now={now}
          submitting={submitting}
          answerError={answerError}
          onSubmit={submitAnswer}
        />
      )}
      {state.phase === "break" && <BreakResult state={state} now={now} />}
      {state.phase === "finished" && (
        <Finished state={state} onLeave={leave} />
      )}
    <div className="rounded-3xl border border-white/15 bg-white/10 p-6 text-center shadow-2xl backdrop-blur-md">
  <div className="text-5xl">⏳</div>
  <p className="mt-3 text-lg font-black text-white">
    بانتظار المضيف لبدء جولة جديدة...
  </p>
  <p className="mt-2 text-sm font-bold text-white/60">
    ابقَ في هذه الصفحة، وستنضم تلقائياً للجولة القادمة
  </p>
  <button
    onClick={onLeave}
    className="mt-4 rounded-2xl bg-white/10 px-6 py-2 text-xs font-black text-white transition hover:bg-white/20"
  >
    خروج نهائي
  </button>
</div>
  );
}

/* ---------- انتظار ---------- */
function LobbyWait({ state }: { state: import("@/lib/types").GameState }) {
  return (
    <div className="w-full max-w-md rounded-3xl border border-white/15 bg-white/10 p-6 text-center shadow-2xl backdrop-blur-md">
      <div className="text-6xl">🕹️</div>
      <h1 className="mt-3 text-2xl font-black text-white">مرحباً {state.my?.name}!</h1>
      <p className="mt-2 text-sm font-bold text-white/70">
        اللعبة لم تبدأ بعد — بانتظار المضيف <span className="text-emerald-300">{state.hostName}</span>
      </p>
      <div className="mx-auto mt-5 flex items-center justify-center gap-2">
        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.3s]" />
        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-white [animation-delay:-0.15s]" />
        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-red-500" />
      </div>
      <div className="mt-5 rounded-2xl bg-black/35 p-3">
        <p className="text-xs font-black text-white/50">اللاعبون الحاليون ({state.playersCount})</p>
        <p className="mt-1 truncate text-sm font-black text-white">
          {state.leaderboard.map((p) => p.name).join("، ")}
        </p>
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
        {state.categories.length === 0 ? (
          <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-black text-white/50">
            🎲 جميع التصنيفات
          </span>
        ) : (
          state.categories.map((id) => (
            <span
              key={id}
              className="rounded-full bg-red-500/15 px-3 py-1 text-[11px] font-black text-red-100"
            >
              {CATEGORIES.find((c) => c.id === id)?.emoji}{" "}
              {CATEGORIES.find((c) => c.id === id)?.label}
            </span>
          ))
        )}
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-1.5">
        {state.difficulties.length === 0 ? (
          <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-black text-white/50">
            🎲 كل مستويات الصعوبة
          </span>
        ) : (
          state.difficulties.map((id) => (
            <span
              key={id}
              className="rounded-full bg-amber-400/15 px-3 py-1 text-[11px] font-black text-amber-100"
            >
              {DIFFICULTY_LEVELS.find((d) => d.id === id)?.emoji}{" "}
              {DIFFICULTY_LEVELS.find((d) => d.id === id)?.label}
            </span>
          ))
        )}
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2 text-[11px] font-black">
        <span className="rounded-full bg-emerald-500/15 px-3 py-1.5 text-emerald-200">
          🔢 {state.totalQuestions} سؤالاً
        </span>
        <span className="rounded-full bg-red-500/15 px-3 py-1.5 text-red-200">
          ⏱️ {state.questionSeconds}ث للإجابة
        </span>
        <span className="rounded-full bg-white/10 px-3 py-1.5 text-white/60">
          {state.manualAdvance ? "👆 المضيف ينقل للسؤال التالي" : "⚡ النتيجة فور إجابة الجميع"}
        </span>
      </div>
    </div>
  );
}

/* ---------- سؤال نشط ---------- */
function ActiveQuestion({
  state,
  now,
  submitting,
  answerError,
  onSubmit,
}: {
  state: import("@/lib/types").GameState;
  now: number;
  submitting: boolean;
  answerError: string | null;
  onSubmit: (i: number) => void;
}) {
  const secondsLeft = (state.activeEndsAt - now) / 1000;
  const answered = !!state.my?.answered;

  return (
    <div className="w-full max-w-2xl rounded-3xl border border-white/15 bg-white p-5 shadow-2xl sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={state.question?.category ?? ""} />
          <span className="text-xs font-black text-slate-400">
            سؤال {state.questionNumber} من {state.totalQuestions}
          </span>
        </div>
        <CountdownRing secondsLeft={secondsLeft} total={state.questionSeconds} size={76} />
      </div>

      <div className="mt-5">
        {state.question ? (
          <AnswerOptions
            text={state.question.text}
            options={state.question.options}
            correctIndex={null}
            selectedIndex={state.my?.selectedIndex ?? null}
            answered={answered}
            reveal={false}
            imageUrl={state.question.imageUrl}
            onSelect={onSubmit}
          />
        ) : (
          <p className="font-black text-slate-500">السؤال قادم...</p>
        )}
      </div>

      {answered && (
        <p className="mt-4 rounded-xl bg-emerald-500/15 px-3 py-2 text-center text-sm font-black text-emerald-600">
          ✅ تم تسجيل إجابتك — انتظر ظهور النتيجة
        </p>
      )}
      {answerError && (
        <p className="mt-4 rounded-xl bg-rose-500/15 px-3 py-2 text-center text-sm font-black text-rose-600">
          {answerError}
        </p>
      )}
      {submitting && (
        <p className="mt-4 text-center text-sm font-black text-slate-400">جارٍ الإرسال...</p>
      )}
    </div>
  );
}

/* ---------- عرض النتيجة بعد كل سؤال ---------- */
function BreakResult({
  state,
  now,
}: {
  state: import("@/lib/types").GameState;
  now: number;
}) {
  const my = state.my;
  const correctIndex = state.question?.correctIndex ?? null;
  const correctText = correctIndex != null ? state.question?.options[correctIndex] : null;
  const nextIn = Math.max(0, Math.ceil((state.breakEndsAt - now) / 1000));
  const isLast = state.questionNumber >= state.totalQuestions;

  return (
    <div className="w-full max-w-2xl space-y-4">
      <div className="rounded-3xl border border-white/15 bg-white p-6 text-center shadow-2xl">
        {my?.isCorrect ? (
          <>
            <div className="text-6xl">🎉</div>
            <h2 className="mt-2 text-2xl font-black text-emerald-500">إجابة صحيحة! +1 نقطة</h2>
          </>
        ) : my?.answered ? (
          <>
            <div className="text-6xl">😅</div>
            <h2 className="mt-2 text-2xl font-black text-rose-500">إجابة خاطئة!</h2>
            <p className="mt-2 text-sm font-bold text-slate-500">
              الجواب الصحيح: <span className="text-emerald-600">{correctText}</span>
            </p>
          </>
        ) : (
          <>
            <div className="text-6xl">⏰</div>
            <h2 className="mt-2 text-2xl font-black text-amber-500">انتهى الوقت!</h2>
            <p className="mt-2 text-sm font-bold text-slate-500">
              الجواب الصحيح: <span className="text-emerald-600">{correctText}</span>
            </p>
          </>
        )}
        <p className="mt-3 text-sm font-black text-slate-400">
          رصيدك الحالي: <span className="text-lg text-emerald-700">{my?.score ?? 0} نقطة</span>
        </p>
        {!isLast && state.manualAdvance && (
          <p className="mt-3 inline-block rounded-full bg-slate-100 px-4 py-1.5 text-xs font-black text-slate-500">
            ⏳ بانتظار المضيف للانتقال إلى السؤال التالي
          </p>
        )}
        {!isLast && !state.manualAdvance && (
          <p className="mt-2 text-xs font-black text-slate-400">
            السؤال التالي بعد <span className="text-red-600">{nextIn}</span> ثانية...
          </p>
        )}
      </div>

      <div className="rounded-3xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-md">
        <h3 className="mb-1 text-sm font-black text-white/70">🏆 الترتيب</h3>
        <LeaderboardList entries={state.leaderboard} compact />
      </div>
    </div>
  );
}

/* ---------- نهاية اللعبة ---------- */
function Finished({
  state,
  onLeave,
}: {
  state: import("@/lib/types").GameState;
  onLeave: () => void;
}) {
  const my = state.leaderboard.find((p) => p.isYou);
  const winner = state.leaderboard[0];
  const iAmWinner = my?.rank === 1;

  return (
    <div className="w-full max-w-2xl space-y-4">
      <div className="rounded-3xl border border-white/15 bg-white/10 p-6 text-center shadow-2xl backdrop-blur-md">
        <div className="text-5xl">{iAmWinner ? "🏆" : "🎊"}</div>
        <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">
          {iAmWinner ? "مبروك! أنت البطل! 👑" : `الفائز: ${winner?.name} 👑`}
        </h1>
        <p className="mt-1 text-sm font-bold text-white/70">
          أنهيت اللعبة في المركز {my?.rank} برصيد {my?.score} نقطة
        </p>
      </div>

      <div className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-md">
        <Podium entries={state.leaderboard} />
      </div>

      <div className="flex justify-center gap-3">
        <button
          onClick={onLeave}
          className="rounded-2xl bg-gradient-to-l from-emerald-600 to-green-500 px-6 py-3 font-black text-white shadow-lg transition hover:brightness-110"
        >
          العودة للرئيسية 🏠
        </button>
      </div>
    </div>
  );
}

/* ---------- عناصر مساعدة ---------- */
function CenterShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-4 py-8">
      <div className="mb-5">
        <Brand />
      </div>
      {children}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-md">
      {children}
    </div>
  );
}
