import "dotenv/config";
import { db } from "./index";
import { questions } from "./schema";
import { SEED_QUESTIONS } from "./seed-data";
import { ADVANCED_QUESTIONS } from "./advanced-seed-data";
import { ADVANCED2_QUESTIONS } from "./advanced2-seed-data";
import { ADVANCED3_QUESTIONS } from "./advanced3-seed-data";
import { MEGA_QUESTIONS } from "./mega-seed-data";
import { EXTRA_OLD_QUESTIONS } from "./extra-old-seed-data";
import { EXTRA_OLD2_QUESTIONS } from "./extra-old2-seed-data";
import { NEWCATS1_QUESTIONS } from "./newcats1-seed-data";
import { NEWCATS2_QUESTIONS } from "./newcats2-seed-data";
import { NEWCATS_PAD_QUESTIONS } from "./newcats-pad-seed-data";
import { NEWCATS_PAD2_QUESTIONS } from "./newcats-pad2-seed-data";
import { normalizeQuestionText, withDifficulty } from "@/lib/question";

/** مزامنة بنك الأسئلة: يضيف الأسئلة المفقودة فقط */
async function main() {
  const existing = await db
    .select({ text: questions.text, textKey: questions.textKey })
    .from(questions);
  const existingKeys = new Set(
    existing.map((question) => question.textKey ?? normalizeQuestionText(question.text))
  );
  const completeBank = [
    ...withDifficulty(SEED_QUESTIONS, "easy"),
    ...withDifficulty(ADVANCED_QUESTIONS, "medium"),
    ...withDifficulty(ADVANCED2_QUESTIONS, "medium"),
    ...withDifficulty(ADVANCED3_QUESTIONS, "medium"),
    ...withDifficulty(MEGA_QUESTIONS, "hard"),
    ...withDifficulty(EXTRA_OLD_QUESTIONS, "medium"),
    ...withDifficulty(EXTRA_OLD2_QUESTIONS, "medium"),
    ...withDifficulty(NEWCATS1_QUESTIONS, "medium"),
    ...withDifficulty(NEWCATS2_QUESTIONS, "medium"),
    ...withDifficulty(NEWCATS_PAD_QUESTIONS, "medium"),
    ...withDifficulty(NEWCATS_PAD2_QUESTIONS, "medium"),
  ];

  // حماية ثانية: لا نحتفظ داخل البنك نفسه إلا بنص فريد بعد التطبيع.
  const bankByKey = new Map<string, (typeof completeBank)[number]>();
  for (const question of completeBank) {
    const key = normalizeQuestionText(question.text);
    if (!bankByKey.has(key)) bankByKey.set(key, question);
  }

  const missing = [...bankByKey.entries()]
    .filter(([key]) => !existingKeys.has(key))
    .map(([textKey, question]) => ({ ...question, textKey }));

  if (missing.length === 0) {
    console.log(`بنك الأسئلة مكتمل: ${existing.length} سؤالاً فريداً`);
    return;
  }

  const inserted = await db
    .insert(questions)
    .values(missing)
    .returning({ id: questions.id });

  console.log(
    `تمت إضافة ${inserted.length} سؤالاً فريداً؛ الإجمالي المتوقع ${existing.length + inserted.length}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
