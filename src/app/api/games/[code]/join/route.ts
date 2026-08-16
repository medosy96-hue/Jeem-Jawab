import { NextResponse } from "next/server";
import { db } from "@/db";
import { games, players } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateId, MAX_PLAYERS, NAME_MAX_LENGTH } from "@/lib/game";

/** انضمام لاعب */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "").trim().slice(0, NAME_MAX_LENGTH);
  if (!name) {
    return NextResponse.json({ error: "أدخل اسمك أولاً" }, { status: 400 });
  }

  const game = (
    await db.select().from(games).where(eq(games.code, code)).limit(1)
  )[0];
  if (!game) {
    return NextResponse.json({ error: "اللعبة غير موجودة" }, { status: 404 });
  }
  if (game.status !== "lobby") {
    return NextResponse.json(
      { error: game.status === "finished" ? "انتهت هذه اللعبة" : "بدأت اللعبة ولا يمكن الانضمام الآن" },
      { status: 400 }
    );
  }

  const count = await db
    .select({ c: players.id })
    .from(players)
    .where(eq(players.gameId, game.id));
  if (count.length >= MAX_PLAYERS) {
    return NextResponse.json(
      { error: "اللعبة ممتلئة! الحد الأقصى 20 لاعباً" },
      { status: 400 }
    );
  }

  const playerId = generateId();
  await db.insert(players).values({
    id: playerId,
    gameId: game.id,
    name,
    isHost: false,
    score: 0,
  });

  return NextResponse.json({ playerId, code: game.code });
}
