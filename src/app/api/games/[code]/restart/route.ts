import { NextResponse } from "next/server";
import { db } from "@/db";
import { games, players, answers } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/** إعادة تشغيل اللعبة نفسها من الصفر (المضيف فقط) */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const body = await req.json().catch(() => ({}));
  const playerId = String(body.playerId ?? "");

  const game = (
    await db.select().from(games).where(eq(games.code, code)).limit(1)
  )[0];
  if (!game) {
    return NextResponse.json({ error: "اللعبة غير موجودة" }, { status: 404 });
  }

  const host = (
    await db
      .select()
      .from(players)
      .where(and(eq(players.id, playerId), eq(players.gameId, game.id)))
      .limit(1)
  )[0];
  if (!host || !host.isHost) {
    return NextResponse.json(
      { error: "المضيف فقط يمكنه بدء جولة جديدة" },
      { status: 403 }
    );
  }

  // احذف كل إجابات الجولة السابقة، وأعد كل النقاط للصفر
  await db.transaction(async (tx) => {
    await tx.delete(answers).where(eq(answers.gameId, game.id));
    await tx.update(players).set({ score: 0 }).where(eq(players.gameId, game.id));
    await tx
      .update(games)
      .set({
        status: "lobby",
        gamePhase: "lobby",
        currentQuestionIndex: 0,
        questionOrder: [],
        phaseStartedAt: null,
        startedAt: null,
      })
      .where(eq(games.id, game.id));
  });

  return NextResponse.json({ ok: true });
}