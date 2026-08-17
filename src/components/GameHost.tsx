"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useGameState } from "@/hooks/useGameState";
import { useNow } from "@/hooks/useNow";
import { QrCard } from "./QrCard";
import { CategoryBadge } from "./CategoryBadge";
import { CountdownRing } from "./CountdownRing";
import { AnswerOptions } from "./AnswerOptions";
import { LeaderboardList } from "./LeaderboardList";
import { Podium } from "./Podium";
import { Brand } from "./Brand";
import { CATEGORIES, DIFFICULTY_LEVELS } from "@/lib/game";
import type { GameState } from "@/lib/types";

interface StoredHost {
  code: string;
  playerId: string;
  name: string;
}

function loadHost(code: string): StoredHost | null {
  try {
    const raw = localStorage.getItem("qc_host");
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredHost;
    return data.code === code ? data : null;
  } catch {
    return null;
  }
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
}

export function GameHost({ code }: { code: string }) {
  const [host, setHost] = useState<StoredHost | null>(null);
  const [joinUrl, setJoinUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [pendingAnswer, setPendingAnswer] = useState<number | null>(null);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);
  const [players, setPlayers] = useState<{ name: string; isHost: boolean }[]>([]);

  useEffect(() => {
    setHost(loadHost(code));
    setJoinUrl(`${window.location.origin}/join?code=${code}`);

    fetch("/api/public-url", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { origin?: string }) => {
        if (data.origin) setJoinUrl(`${data.origin}/join?code=${code}`);
      })
      .catch(() => {
        /* يبقى عنوان النافذة كخيار احتياطي */
      });
  }, [code]);

  const { state, error, refresh } = useGameState(code, host?.playerId);
  const now = useNow(300);

  useEffect(() => {
    if (state?.leaderboard) {
      setPlayers(state.leaderboard.map((p) => ({ name: p.name, isHost: p.isHost })));
    }
  }, [state?.leaderboard]);

  useEffect(() => {
    setAnswerError(null);
    setPendingAnswer(null);
  }, [state?.questionIndex]);

  const startGame = async () => {
    if (!host) return;
    setStarting(true);
    setStartError(null);
    try {
      const res = await fetch(`/api/games/${code}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: host.playerId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStartError(data.error ?? "تعذر بدء اللعبة");
      } else {
        await refresh();
      }
    } finally {
      setStarting(false);
    }
  };

  const submitAnswer = async (selectedIndex: number) => {
    if (
      !host ||
      !state ||
      state.phase !== "active" ||
      state.my?.answered ||
      submittingAnswer
    ) {
      return;
    }

    setSubmittingAnswer(true);
    setPendingAnswer(selectedIndex);
    setAnswerError(null);
    try {
      const res = await fetch(`/api/games/${code}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: host.playerId,
          questionIndex: state.questionIndex,
          selectedIndex,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAnswerError(data.error ?? "تعذر تسجيل الإجابة");
      }
      await refresh();
    } finally {
      setSubmittingAnswer(false);
      setPendingAnswer(null);
    }
  };

  const goNext = async () => {
    if (!host || !state || state.phase !== "break" || advancing) return;
    setAdvancing(true);
    try {
      const res = await fetch(`/api/games/${code}/next`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: host.playerId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAnswerError(data.error ?? "تعذر الانتقال للسؤال التالي");
      }
      await refresh();
    } finally {
      setAdvancing(false);
    }
  };

  const copyLink = async () => {
    await copyText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCode = async () => {
    await copyText(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "ج جواب",
          text: `انضم إلى لعبتي! رمز اللعبة: ${code}`,
          url: joinUrl,
        });
        return;
      } catch {
        return;
      }
    }
    await copyLink();
  };

  if (!host) {
    return (
      <Shell>
        <Card>
          <div className="text-center">
            <div className="text-5xl">🎮</div>
            <h1 className="mt-3 text-xl font-black text-white">أنت لست مضيفاً لهذه اللعبة</h1>
            <p className="mt-2 text-sm text-white/70">أنشئ لعبة جديدة أولاً</p>
            <Link
              href="/create?mode=local"
              className="mt-5 inline-block rounded-2xl bg-gradient-to-l from-emerald-600 to-green-500 px-6 py-3 font-black text-white shadow-lg transition hover:brightness-110"
            >
              إنشاء لعبة جديدة
            </Link>
          </div>
        </Card>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell>
        <Card>
          <div className="text-center">
            <div className="text-5xl">😵</div>
            <h1 className="mt-3 text-xl font-black text-white">{error}</h1>
            <Link href="/" className="mt-5 inline-block rounded-2xl bg-white/10 px-6 py-3 font-black text-white">
              العودة للرئيسية
            </Link>
          </div>
        </Card>
      </Shell>
    );
  }

  if (!state) {
    return (
      <Shell>
        <Card>
          <div className="py-10 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-emerald-400" />
            <p className="mt-4 font-bold text-white/80">جارٍ التحميل...</p>
          </div>
        </Card>
      </Shell>
    );
  }

  if (state.phase === "lobby") {
    return (
      <Lobby
        state={state}
        joinUrl={joinUrl}
        players={players}
        copied={copied}
        codeCopied={codeCopied}
        onCopy={copyLink}
        onCopyCode={copyCode}
        onShare={shareLink}
        onStart={startGame}
        starting={starting}
        startError={startError}
      />
    );
  }

  if (state.phase === "finished") {
    return (
      <Shell>
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-black text-white">انتهت اللعبة! 🏁</h1>
            <p className="mt-1 text-sm text-white/70">كود اللعبة: {state.code}</p>
          </div>
          <Card>
            <Podium entries={state.leaderboard} />
          </Card>
          <div className="flex justify-center gap-3">
            <Link href="/create" className="rounded-2xl bg-gradient-to-l from-emerald-600 to-green-500 px-6 py-3 font-black text-white shadow-lg transition hover:brightness-110">
              create 🎮
              <button
  onClick={async () => {
    if (!host) return;
    setStarting(true);
    try {
      await fetch(`/api/games/${code}/restart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: host.playerId }),
      });
      await refresh();
    } finally {
      setStarting(false);
    }
  }}
  disabled={starting}
  className="rounded-2xl bg-gradient-to-l from-emerald-600 to-green-500 px-6 py-3 font-black text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
>
  🎮 جولة جديدة بنفس اللاعبين
</button>
            </Link>
            <Link href="/" className="rounded-2xl bg-white/10 px-6 py-3 font-black text-white transition hover:bg-white/20">
              الرئيسية
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  // playing: active | break
  const secondsLeft = state.phase === "active"
    ? (state.activeEndsAt - now) / 1000
    : (state.breakEndsAt - now) / 1000;
  const progress = (state.questionNumber / state.totalQuestions) * 100;
  const isLastQuestion = state.questionNumber >= state.totalQuestions;

  return (
    <Shell>
      <div className="grid gap-5 lg:grid-cols-5">
        {/* السؤال */}
        <div className="lg:col-span-3">
          <Card>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CategoryBadge category={state.question?.category ?? ""} />
                <span className="text-xs font-black text-white/60">
                  سؤال {state.questionNumber} من {state.totalQuestions}
                </span>
              </div>
              {state.phase === "active" ? (
                <CountdownRing
                  secondsLeft={secondsLeft}
                  total={state.questionSeconds}
                  size={64}
                />
              ) : (
                <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-white/60">
                  📊 النتيجة
                </span>
              )}
            </div>
            <div className="mt-4">
              <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-emerald-500 via-white to-red-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {state.question ? (
                <div className="rounded-2xl bg-white p-4">
                  <AnswerOptions
                    text={state.question.text}
                    options={state.question.options}
                    correctIndex={state.question.correctIndex}
                    selectedIndex={state.my?.selectedIndex ?? pendingAnswer}
                    answered={!!state.my?.answered || submittingAnswer}
                    reveal={state.phase === "break"}
                    imageUrl={state.question.imageUrl}
                    onSelect={submitAnswer}
                  />
                </div>
              ) : (
                <p className="font-bold text-white/70">السؤال غير متاح</p>
              )}
            </div>

            {answerError && (
              <p className="mt-4 rounded-xl bg-rose-500/20 px-3 py-2 text-center text-xs font-bold text-rose-300">
                {answerError}
              </p>
            )}

            <p
              className={`mt-4 rounded-xl px-3 py-2 text-center text-xs font-bold ${
                state.phase === "break"
                  ? state.my?.isCorrect
                    ? "bg-emerald-400/15 text-emerald-300"
                    : "bg-rose-400/15 text-rose-300"
                  : "bg-amber-400/10 text-amber-300"
              }`}
            >
              {state.phase === "active"
                ? state.my?.answered
                  ? "✅ تم تسجيل إجابتك — انتظر ظهور النتيجة"
                  : submittingAnswer
                    ? "جارٍ تسجيل إجابتك..."
                    : "🎯 أنت لاعب أيضاً — اختر إجابتك قبل انتهاء الوقت"
                : state.my?.isCorrect
                  ? "🎉 إجابة صحيحة! حصلت على نقطة"
                  : state.my?.answered
                    ? "إجابة خاطئة — جاهز للسؤال التالي"
                    : "⏰ انتهى الوقت قبل أن تجيب"}
            </p>

            {state.phase === "break" && state.manualAdvance && (
              <button
                onClick={goNext}
                disabled={advancing}
                className="mt-4 w-full rounded-2xl bg-gradient-to-l from-emerald-600 to-green-500 py-4 text-lg font-black text-white shadow-xl transition hover:brightness-110 active:scale-95 disabled:opacity-50"
              >
                {advancing
                  ? "جارٍ الانتقال..."
                  : isLastQuestion
                    ? "🏁 عرض النتيجة النهائية"
                    : "⬅️ السؤال التالي"}
              </button>
            )}

            {state.phase === "break" && !state.manualAdvance && (
              <p className="mt-3 text-center text-xs font-black text-white/50">
                {isLastQuestion
                  ? "النتيجة النهائية قادمة..."
                  : `السؤال التالي خلال ${Math.max(0, Math.ceil(secondsLeft))} ثانية`}
              </p>
            )}
          </Card>
        </div>

        {/* الترتيب */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="mb-2 flex items-center gap-2 text-sm font-black text-white/80">
              🏆 الترتيب المباشر
            </h2>
            <LeaderboardList entries={state.leaderboard} compact />
          </Card>
        </div>
      </div>
    </Shell>
  );
}

/* ---------- اللوبي ---------- */
function Lobby({
  state,
  joinUrl,
  players,
  copied,
  codeCopied,
  onCopy,
  onCopyCode,
  onShare,
  onStart,
  starting,
  startError,
}: {
  state: GameState;
  joinUrl: string;
  players: { name: string; isHost: boolean }[];
  copied: boolean;
  codeCopied: boolean;
  onCopy: () => void;
  onCopyCode: () => void;
  onShare: () => void;
  onStart: () => void;
  starting: boolean;
  startError: string | null;
}) {
  const isLocal = state.mode === "local";
  return (
    <Shell>
      <div className="grid gap-5 lg:grid-cols-2">
        {/* بطاقة الانضمام */}
        <Card>
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/70">
              {isLocal ? "📱 لعبة محلية — جنب بعض" : "🌍 لعبة أونلاين — عن بُعد"}
            </span>
            <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-black text-emerald-300">
              {state.playersCount}/{state.maxPlayers} لاعب
            </span>
          </div>

          <div className="mt-4 flex flex-col items-center">
            {isLocal ? (
              <>
                <QrCard value={joinUrl} />
                <p className="mt-3 text-center text-sm font-bold text-white/80">
                  📸 صوّر رمز QR للانضمام إلى اللعبة
                </p>
              </>
            ) : (
              <>
                <div className="w-full rounded-2xl bg-indigo-950/60 p-4 text-center">
                  <p className="text-xs font-bold text-white/50">رابط اللعبة</p>
                  <p dir="ltr" className="mt-1 break-all text-sm font-black text-emerald-300">
                    {joinUrl}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <button
                    onClick={onShare}
                    className="rounded-2xl bg-emerald-500 px-5 py-2.5 text-sm font-black text-white transition hover:bg-emerald-400"
                  >
                    📤 مشاركة اللعبة
                  </button>
                  <button
                    onClick={onCopy}
                    className="rounded-2xl bg-white/10 px-5 py-2.5 text-sm font-black text-white transition hover:bg-white/20"
                  >
                    {copied ? "✅ تم النسخ!" : "📋 نسخ الرابط"}
                  </button>
                </div>
                <p className="mt-3 text-center text-sm font-bold text-white/80">
                  شارك الرابط مع أصدقائك حتى 20 لاعباً
                </p>
              </>
            )}
            <div className="mt-4 w-full rounded-2xl border border-emerald-300/30 bg-emerald-500/10 p-3 text-center">
              <p className="text-[11px] font-black text-white/60">
                أو افتحوا الموقع وأدخلوا رمز اللعبة
              </p>
              <p
                dir="ltr"
                className="mt-1 text-3xl font-black tracking-[0.3em] text-white sm:text-4xl"
              >
                {state.code}
              </p>
              <button
                onClick={onCopyCode}
                className="mt-2 rounded-xl bg-red-500/20 px-4 py-1.5 text-xs font-black text-red-100 transition hover:bg-red-500/30"
              >
                {codeCopied ? "✅ تم نسخ الرمز" : "📋 نسخ الرمز"}
              </button>
            </div>
          </div>
        </Card>

        {/* اللاعبون والبدء */}
        <Card>
          <h2 className="text-sm font-black text-white/80">👥 اللاعبون ({players.length})</h2>
          {players.length === 0 ? (
            <div className="mt-6 py-8 text-center">
              <div className="text-4xl">📡</div>
              <p className="mt-2 text-sm font-bold text-white/60">
                بانتظار انضمام اللاعبين...
                <br />
                {isLocal ? "وجّه كاميرا هاتفك نحو رمز QR" : "أرسل الرابط لأصدقائك"}
              </p>
            </div>
          ) : (
            <div className="mt-4 flex max-h-52 flex-wrap gap-2 overflow-y-auto">
              {players.map((p, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-black ${
                    p.isHost ? "bg-amber-400/20 text-amber-300" : "bg-white/10 text-white"
                  }`}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/20 text-xs">
                    {p.name.slice(0, 2)}
                  </span>
                  {p.name}
                  {p.isHost && " 👑"}
                </span>
              ))}
            </div>
          )}

          {startError && (
            <p className="mt-4 rounded-xl bg-rose-500/20 px-3 py-2 text-center text-xs font-bold text-rose-300">
              {startError}
            </p>
          )}

          <button
            onClick={onStart}
            disabled={starting || players.length < 1}
            className="mt-6 w-full rounded-2xl bg-gradient-to-l from-emerald-600 to-green-500 py-4 text-lg font-black text-white shadow-xl transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {starting ? "جارٍ التحضير..." : "🚀 ابدأ اللعبة!"}
          </button>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] font-black">
            <span className="rounded-xl bg-emerald-500/15 px-2 py-2 text-emerald-200">
              🔢 {state.totalQuestions} سؤالاً
            </span>
            <span className="rounded-xl bg-red-500/15 px-2 py-2 text-red-200">
              ⏱️ {state.questionSeconds}ث للإجابة
            </span>
            <span className="rounded-xl bg-white/10 px-2 py-2 text-white/70">
              {state.manualAdvance ? "👆 انتقال يدوي" : "⏱️ انتقال تلقائي"}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {state.categories.length === 0 ? (
              <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-black text-white/60">
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
              <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-black text-white/60">
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
        </Card>
      </div>
    </Shell>
  );
}

/* ---------- عناصر مساعدة ---------- */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <div className="mb-5 flex items-center justify-between">
        <Brand />
        <Link href="/" className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-black text-white/80 transition hover:bg-white/20">
          خروج
        </Link>
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
