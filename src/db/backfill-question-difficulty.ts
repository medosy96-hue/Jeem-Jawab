import "dotenv/config";
import { db } from "./index";
import { questions } from "./schema";
import { SEED_QUESTIONS } from "./seed-data";
import { ADVANCED_QUESTIONS } from "./advanced-seed-data";
import { ADVANCED2_QUESTIONS } from "./advanced2-seed-data";
import { ADVANCED3_QUESTIONS } from "./advanced3-seed-data";
import { MEGA_QUESTIONS } from "./mega-seed-data";
import { normalizeQuestionText, withDifficulty } from "@/lib/question";
import { eq } from "drizzle-orm";

/** يضبط صعوبة الأسئلة المدرجة مسبقاً في قاعدة البيانات حسب حزمتها الأصلية */
async function main() {
  const completeBank = [
    ...withDifficulty(SEED_QUESTIONS, "easy"),
    ...withDifficulty(ADVANCED_QUESTIONS, "medium"),
    ...withDifficulty(ADVANCED2_QUESTIONS, "medium"),
    ...withDifficulty(ADVANCED3_QUESTIONS, "medium"),
    ...withDifficulty(MEGA_QUESTIONS, "hard"),
  ];

  const difficultyByTextKey = new Map(
    completeBank.map((question) => [
      normalizeQuestionText(question.text),
      question.difficulty ?? "medium",
    ])
  );

  const rows = await db
    .select({ id: questions.id, textKey: questions.textKey, difficulty: questions.difficulty })
    .from(questions);

  let updated = 0;
  await db.transaction(async (tx) => {
    for (const row of rows) {
      const difficulty = row.textKey ? difficultyByTextKey.get(row.textKey) : undefined;
      if (difficulty && row.difficulty !== difficulty) {
        await tx
          .update(questions)
          .set({ difficulty })
          .where(eq(questions.id, row.id));
        updated++;
      }
    }
  });

  console.log(`تم ضبط مستوى الصعوبة لـ ${updated} سؤالاً`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
