import { NextResponse } from "next/server";
import { db } from "@/db";
import { games, players, questions } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { pickQuestions } from "@/lib/game";

/** بدء اللعبة (المضيف فقط) */
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
      { error: "المضيف فقط يمكنه بدء اللعبة" },
      { status: 403 }
    );
  }

  if (game.status !== "lobby") {
    return NextResponse.json(
      { error: "اللعبة بدأت بالفعل" },
      { status: 400 }
    );
  }

  const count = await db
    .select({ c: players.id })
    .from(players)
    .where(eq(players.gameId, game.id));
  if (count.length < 1) {
    return NextResponse.json(
      { error: "يجب أن ينضم لاعب واحد على الأقل" },
      { status: 400 }
    );
  }

  const [questionRows, previousGames] = await Promise.all([
    db
      .select({
        id: questions.id,
        category: questions.category,
        difficulty: questions.difficulty,
        familyKey: questions.familyKey,
      })
      .from(questions),
    db
      .select({ questionOrder: games.questionOrder })
      .from(games)
      .where(ne(games.id, game.id)),
  ]);

  // الأسئلة التي ظهرت في أي جولة سابقة لا تعود إلى الاختيار،
  // ولا أي صياغة بديلة من عائلة المعلومة نفسها.
  const usedQuestionIds = new Set(
    previousGames.flatMap((previous) => previous.questionOrder)
  );
  const questionById = new Map(questionRows.map((question) => [question.id, question]));
  const usedFamilies = new Set(
    [...usedQuestionIds].map((id) => {
      const question = questionById.get(id);
      return question?.familyKey ?? `question:${id}`;
    })
  );
  const filteredQuestions = questionRows.filter(
    (question) =>
      (game.categories.length === 0 || game.categories.includes(question.category)) &&
      (game.difficulties.length === 0 || game.difficulties.includes(question.difficulty))
  );
  const freshQuestions = filteredQuestions
    .filter(
      (question) =>
        !usedQuestionIds.has(question.id) &&
        !usedFamilies.has(question.familyKey ?? `question:${question.id}`)
    )
    .map((question) => ({
      id: question.id,
      category: question.category,
      familyKey: question.familyKey,
    }));

  if (freshQuestions.length < game.totalQuestions) {
    const alreadyPlayed = filteredQuestions.length - freshQuestions.length;
    return NextResponse.json(
      {
        error: `لا توجد أسئلة جديدة كافية بهذه التصنيفات ومستوى الصعوبة. استُخدم ${alreadyPlayed} سؤالاً سابقاً؛ أضف أسئلة، أو وسّع التصنيفات/الصعوبة، أو قلّل عدد أسئلة الجولة.`,
      },
      { status: 400 }
    );
  }

  const order = pickQuestions(freshQuestions, game.totalQuestions);
  const now = new Date();

  await db
    .update(games)
    .set({
      status: "playing",
      gamePhase: "active",
      currentQuestionIndex: 0,
      phaseStartedAt: now,
      startedAt: now,
      questionOrder: order,
    })
    .where(eq(games.id, game.id));

  return NextResponse.json({ ok: true });
}
