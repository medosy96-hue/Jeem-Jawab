import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { answers, games, players, type Game } from "@/db/schema";
import { type Phase } from "@/lib/game";

/**
 * يزامن مرحلة اللعبة المخزنة في قاعدة البيانات.
 * - ينهي السؤال فور إجابة جميع اللاعبين.
 * - ينهيه أيضاً عند نفاد الوقت.
 * - ينقل الجميع إلى السؤال التالي بعد مدة عرض النتيجة،
 *   أو ينتظر ضغط المضيف على «السؤال التالي» إذا كان الانتقال يدوياً.
 */
export async function syncGameProgress(initialGame: Game): Promise<Game> {
  let game = initialGame;

  for (let attempt = 0; attempt < 4; attempt++) {
    if (game.status !== "playing") return game;

    const phase = game.gamePhase as Phase;
    const phaseStartedAt = game.phaseStartedAt ?? game.startedAt ?? new Date();
    const elapsedMs = Date.now() - phaseStartedAt.getTime();

    if (phase === "active") {
      const [gamePlayers, currentAnswers] = await Promise.all([
        db
          .select({ id: players.id })
          .from(players)
          .where(eq(players.gameId, game.id)),
        db
          .select({ id: answers.id })
          .from(answers)
          .where(
            and(
              eq(answers.gameId, game.id),
              eq(answers.questionIndex, game.currentQuestionIndex)
            )
          ),
      ]);

      const everyoneAnswered =
        gamePlayers.length > 0 && currentAnswers.length >= gamePlayers.length;
      const timeExpired = elapsedMs >= game.questionSeconds * 1000;

      if (!everyoneAnswered && !timeExpired) return game;

      const transitioned = await db
        .update(games)
        .set({ gamePhase: "break", phaseStartedAt: new Date() })
        .where(
          and(
            eq(games.id, game.id),
            eq(games.status, "playing"),
            eq(games.gamePhase, "active"),
            eq(games.currentQuestionIndex, game.currentQuestionIndex)
          )
        )
        .returning();

      game = transitioned[0] ?? (await getGameById(game.id));
      continue;
    }

    if (phase === "break") {
      // في الانتقال اليدوي يبقى الجميع في شاشة النتيجة حتى يضغط المضيف «التالي»
      if (game.manualAdvance) return game;
      if (elapsedMs < game.resultSeconds * 1000) return game;

      const isLastQuestion =
        game.currentQuestionIndex + 1 >= game.totalQuestions;
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

      game = transitioned[0] ?? (await getGameById(game.id));
      if (isLastQuestion) return game;
      continue;
    }

    return game;
  }

  return game;
}

export function gameTiming(game: Game) {
  const start = game.phaseStartedAt?.getTime() ?? 0;
  return {
    phase: (game.status === "finished" ? "finished" : game.gamePhase) as Phase,
    questionIndex:
      game.status === "lobby"
        ? -1
        : game.status === "finished"
          ? game.totalQuestions
          : game.currentQuestionIndex,
    activeEndsAt:
      game.gamePhase === "active" ? start + game.questionSeconds * 1000 : 0,
    breakEndsAt:
      game.gamePhase === "break" && !game.manualAdvance
        ? start + game.resultSeconds * 1000
        : 0,
  };
}

async function getGameById(id: string): Promise<Game> {
  const game = (await db.select().from(games).where(eq(games.id, id)).limit(1))[0];
  if (!game) throw new Error("Game disappeared while synchronizing progress");
  return game;
}
