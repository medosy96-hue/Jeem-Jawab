import "dotenv/config";
import { db } from "./index";
import { questions } from "./schema";
import { eq } from "drizzle-orm";
import { normalizeQuestionText } from "@/lib/question";

async function main() {
  const rows = await db.select({ id: questions.id, text: questions.text }).from(questions);
  const seen = new Map<string, number>();
  const duplicates: string[] = [];

  for (const row of rows) {
    const key = normalizeQuestionText(row.text);
    if (seen.has(key)) duplicates.push(row.text);
    else seen.set(key, row.id);
  }

  if (duplicates.length > 0) {
    throw new Error(`وجدت ${duplicates.length} سؤالاً مكرراً بعد التطبيع: ${duplicates.join(" | ")}`);
  }

  await db.transaction(async (tx) => {
    for (const row of rows) {
      await tx
        .update(questions)
        .set({ textKey: normalizeQuestionText(row.text) })
        .where(eq(questions.id, row.id));
    }
  });

  console.log(`تمت حماية ${rows.length} سؤالاً بمفاتيح فريدة`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
