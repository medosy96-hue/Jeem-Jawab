import { NextResponse } from "next/server";
import { db } from "@/db";
import { games, players } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  generateGameCode,
  generateId,
  NAME_MAX_LENGTH,
  validQuestionSeconds,
  validResultSeconds,
  validTotalQuestions,
  validDifficulties,
  CATEGORIES,
} from "@/lib/game";

/** إنشاء لعبة جديدة */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const mode = body.mode === "online" ? "online" : "local";
  const hostName = String(body.hostName ?? "").trim().slice(0, NAME_MAX_LENGTH);
  const questionSeconds = validQuestionSeconds(body.questionSeconds);
  const resultSeconds = validResultSeconds(body.resultSeconds);
  const totalQuestions = validTotalQuestions(body.totalQuestions);
  const manualAdvance = body.manualAdvance === true;
  const validIds = new Set<string>(CATEGORIES.map((category) => category.id));
  const categories: string[] = Array.isArray(body.categories)
    ? body.categories.filter((id: unknown) => validIds.has(String(id)))
    : [];
  const difficulties = validDifficulties(body.difficulties);
  if (!hostName) {
    return NextResponse.json({ error: "أدخل اسمك أولاً" }, { status: 400 });
  }

  let code = generateGameCode();
  for (let i = 0; i < 5; i++) {
    const existing = await db
      .select({ id: games.id })
      .from(games)
      .where(eq(games.code, code))
      .limit(1);
    if (existing.length === 0) break;
    code = generateGameCode();
  }

  const gameId = generateId();
  await db.insert(games).values({
    id: gameId,
    code,
    mode,
    hostName,
    status: "lobby",
    gamePhase: "lobby",
    questionSeconds,
    resultSeconds,
    totalQuestions,
    manualAdvance,
    categories,
    difficulties,
  });

  const hostPlayerId = generateId();
  await db.insert(players).values({
    id: hostPlayerId,
    gameId,
    name: hostName,
    isHost: true,
    score: 0,
  });

  return NextResponse.json({ code, playerId: hostPlayerId, gameId });
}
