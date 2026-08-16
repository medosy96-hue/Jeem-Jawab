import { NextResponse } from "next/server";
import { db } from "@/db";
import { games, players, questions, answers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  MAX_PLAYERS,
  optionPermutation,
  optionSeed,
} from "@/lib/game";
import { gameTiming, syncGameProgress } from "@/lib/game-server";

/** حالة اللعبة الكاملة */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const url = new URL(req.url);
  const playerId = url.searchParams.get("playerId") ?? undefined;

  let game = (
    await db.select().from(games).where(eq(games.code, code)).limit(1)
  )[0];
  if (!game) {
    return NextResponse.json({ error: "اللعبة غير موجودة" }, { status: 404 });
  }
  game = await syncGameProgress(game);

  const gamePlayers = await db
    .select()
    .from(players)
    .where(eq(players.gameId, game.id));

  const phaseInfo = gameTiming(game);
  const currentAnswers =
    phaseInfo.questionIndex >= 0
      ? await db
          .select()
          .from(answers)
          .where(
            and(
              eq(answers.gameId, game.id),
              eq(answers.questionIndex, phaseInfo.questionIndex)
            )
          )
      : [];
  const hiddenPointPlayerIds =
    phaseInfo.phase === "active"
      ? new Set(currentAnswers.filter((answer) => answer.isCorrect).map((answer) => answer.playerId))
      : new Set<string>();
  const visibleScore = (id: string, score: number) =>
    score - (hiddenPointPlayerIds.has(id) ? 1 : 0);

  let question: {
    id: number;
    category: string;
    text: string;
    options: string[];
    correctIndex: number | null;
  } | null = null;

  if (
    phaseInfo.questionIndex >= 0 &&
    phaseInfo.questionIndex < game.questionOrder.length
  ) {
    const qid = game.questionOrder[phaseInfo.questionIndex];
    const q = (
      await db.select().from(questions).where(eq(questions.id, qid)).limit(1)
    )[0];
    if (q) {
      const permutation = optionPermutation(
        optionSeed(game.id, phaseInfo.questionIndex, q.id)
      );
      question = {
        id: q.id,
        category: q.category,
        text: q.text,
        options: permutation.map((originalIndex) => q.options[originalIndex]),
        correctIndex:
          phaseInfo.phase === "active"
            ? null
            : permutation.indexOf(q.correctIndex),
      };
    }
  }

  let my: {
    playerId: string;
    name: string;
    score: number;
    answered: boolean;
    selectedIndex: number | null;
    isCorrect: boolean | null;
  } | null = null;

  if (playerId) {
    const me = gamePlayers.find((p) => p.id === playerId);
    if (me) {
      const myAnswer = currentAnswers.find((answer) => answer.playerId === playerId);
      my = {
        playerId: me.id,
        name: me.name,
        score: visibleScore(me.id, me.score),
        answered: !!myAnswer,
        selectedIndex: myAnswer?.selectedIndex ?? null,
        isCorrect:
          phaseInfo.phase === "active" ? null : (myAnswer?.isCorrect ?? null),
      };
    }
  }

  const leaderboard = gamePlayers
    .map((p) => ({
      playerId: p.id,
      name: p.name,
      score: visibleScore(p.id, p.score),
      isHost: p.isHost,
      isYou: p.id === playerId,
    }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "ar"))
    .map((p, i) => ({ ...p, rank: i + 1 }));

  return NextResponse.json({
    code: game.code,
    mode: game.mode,
    status: game.status,
    hostName: game.hostName,
    categories: game.categories,
    phase: phaseInfo.phase,
    questionIndex: phaseInfo.questionIndex,
    questionNumber:
      phaseInfo.questionIndex >= 0 ? phaseInfo.questionIndex + 1 : 0,
    totalQuestions: game.totalQuestions,
    manualAdvance: game.manualAdvance,
    questionSeconds: game.questionSeconds,
    breakSeconds: game.resultSeconds,
    activeEndsAt: phaseInfo.activeEndsAt,
    breakEndsAt: phaseInfo.breakEndsAt,
    now: Date.now(),
    question,
    my,
    playersCount: gamePlayers.length,
    maxPlayers: MAX_PLAYERS,
    leaderboard,
  });
}
