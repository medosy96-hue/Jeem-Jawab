import "dotenv/config";
import { db } from "./index";
import { questions } from "./schema";
import { MEGA_QUESTIONS } from "./mega-seed-data";
import { normalizeQuestionText } from "@/lib/question";
import { eq } from "drizzle-orm";

async function main() {
  const familyByTextKey = new Map(
    MEGA_QUESTIONS.map((question) => [
      normalizeQuestionText(question.text),
      question.familyKey,
    ])
  );
  const rows = await db
    .select({ id: questions.id, textKey: questions.textKey, familyKey: questions.familyKey })
    .from(questions);

  let updated = 0;
  await db.transaction(async (tx) => {
    for (const row of rows) {
      const familyKey = row.textKey ? familyByTextKey.get(row.textKey) : undefined;
      if (familyKey && row.familyKey !== familyKey) {
        await tx
          .update(questions)
          .set({ familyKey })
          .where(eq(questions.id, row.id));
        updated++;
      }
    }
  });

  console.log(`تم ربط ${updated} سؤالاً بعائلات معلومات فريدة`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
