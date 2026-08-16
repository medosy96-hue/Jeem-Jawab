import "dotenv/config";
import { db } from "./index";
import { questions } from "./schema";
import { SEED_QUESTIONS } from "./seed-data";
import { ADVANCED_QUESTIONS } from "./advanced-seed-data";
import { ADVANCED2_QUESTIONS } from "./advanced2-seed-data";
import { ADVANCED3_QUESTIONS } from "./advanced3-seed-data";
import { MEGA_QUESTIONS } from "./mega-seed-data";
import { normalizeQuestionText } from "@/lib/question";

/** مزامنة بنك الأسئلة: يضيف الأسئلة المفقودة فقط */
async function main() {
  const existing = await db
    .select({ text: questions.text, textKey: questions.textKey })
    .from(questions);
  const existingKeys = new Set(
    existing.map((question) => question.textKey ?? normalizeQuestionText(question.text))
  );
  const completeBank = [
    ...SEED_QUESTIONS,
    ...ADVANCED_QUESTIONS,
    ...ADVANCED2_QUESTIONS,
    ...ADVANCED3_QUESTIONS,
    ...MEGA_QUESTIONS,
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
