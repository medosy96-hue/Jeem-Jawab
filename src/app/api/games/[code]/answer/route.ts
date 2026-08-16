import { NextResponse } from "next/server";
import { db } from "@/db";
import { games, players, questions, answers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { gameTiming, syncGameProgress } from "@/lib/game-server";
import { optionPermutation, optionSeed } from "@/lib/game";

/** تسجيل إجابة لاعب */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const body = await req.json().catch(() => ({}));
  const playerId = String(body.playerId ?? "");
  const questionIndex = Number(body.questionIndex);
  const selectedIndex = Number(body.selectedIndex);

  if (!Number.isInteger(questionIndex) || !Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex > 3) {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }

  let game = (
    await db.select().from(games).where(eq(games.code, code)).limit(1)
  )[0];
  if (!game) {
    return NextResponse.json({ error: "اللعبة غير موجودة" }, { status: 404 });
  }
  game = await syncGameProgress(game);

  if (game.status !== "playing") {
    return NextResponse.json({ error: "اللعبة لم تبدأ بعد" }, { status: 400 });
  }

  const player = (
    await db
      .select()
      .from(players)
      .where(and(eq(players.id, playerId), eq(players.gameId, game.id)))
      .limit(1)
  )[0];
  if (!player) {
    return NextResponse.json({ error: "أنت لست ضمن اللاعبين" }, { status: 404 });
  }

  const phaseInfo = gameTiming(game);
  if (phaseInfo.phase !== "active") {
    return NextResponse.json(
      { error: "انتهى وقت السؤال", phase: phaseInfo.phase },
      { status: 400 }
    );
  }
  if (phaseInfo.questionIndex !== questionIndex) {
    return NextResponse.json(
      { error: "هذا السؤال لم يعد متاحاً" },
      { status: 400 }
    );
  }

  const existing = (
    await db
      .select()
      .from(answers)
      .where(
        and(
          eq(answers.gameId, game.id),
          eq(answers.playerId, playerId),
          eq(answers.questionIndex, questionIndex)
        )
      )
      .limit(1)
  )[0];
  if (existing) {
    return NextResponse.json({ ok: true, accepted: true, already: true });
  }

  const qid = game.questionOrder[questionIndex];
  const q = (
    await db.select().from(questions).where(eq(questions.id, qid)).limit(1)
  )[0];
  if (!q) {
    return NextResponse.json({ error: "السؤال غير موجود" }, { status: 404 });
  }

  const permutation = optionPermutation(optionSeed(game.id, questionIndex, q.id));
  const originalSelectedIndex = permutation[selectedIndex];
  const isCorrect = originalSelectedIndex === q.correctIndex;
  const newScore = player.score + (isCorrect ? 1 : 0);

  await db.transaction(async (tx) => {
    await tx.insert(answers).values({
      gameId: game.id,
      playerId,
      questionId: q.id,
      questionIndex,
      selectedIndex,
      isCorrect,
    });
    if (isCorrect) {
      await tx
        .update(players)
        .set({ score: newScore })
        .where(eq(players.id, playerId));
    }
  });

  game = await syncGameProgress(game);
  return NextResponse.json({
    ok: true,
    accepted: true,
    phase: game.gamePhase,
  });
}
