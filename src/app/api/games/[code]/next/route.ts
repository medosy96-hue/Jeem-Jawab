import { NextResponse } from "next/server";
import { db } from "@/db";
import { games, players } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/** المضيف ينتقل إلى السؤال التالي بعد عرض النتيجة */
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

  if (game.status !== "playing") {
    return NextResponse.json(
      { error: "اللعبة ليست في مرحلة اللعب حالياً" },
      { status: 400 }
    );
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
      { error: "المضيف فقط يمكنه الانتقال إلى السؤال التالي" },
      { status: 403 }
    );
  }

  if (game.gamePhase !== "break") {
    return NextResponse.json(
      { error: "لا يمكن الانتقال الآن، انتظر ظهور النتيجة" },
      { status: 400 }
    );
  }

  const isLastQuestion = game.currentQuestionIndex + 1 >= game.totalQuestions;

  const transitioned = await db
    .update(games)
    .set(
      isLastQuestion
        ? {
            status: "finished",
            gamePhase: "finished",
            phaseStartedAt: new Date(),
          }
        : {
            currentQuestionIndex: game.currentQuestionIndex + 1,
            gamePhase: "active",
            phaseStartedAt: new Date(),
          }
    )
    .where(
      and(
        eq(games.id, game.id),
        eq(games.status, "playing"),
        eq(games.gamePhase, "break"),
        eq(games.currentQuestionIndex, game.currentQuestionIndex)
      )
    )
    .returning();

  if (transitioned.length === 0) {
    return NextResponse.json(
      { error: "تغيرت حالة اللعبة، حاول مجدداً" },
      { status: 409 }
    );
  }

  return NextResponse.json({
    ok: true,
    phase: transitioned[0].gamePhase,
    questionIndex: transitioned[0].currentQuestionIndex,
  });
}
