import { NextResponse } from "next/server";
import { db } from "@/db";
import { questions } from "@/db/schema";
import { SEED_QUESTIONS } from "@/db/seed-data";
import { ADVANCED_QUESTIONS } from "@/db/advanced-seed-data";
import { ADVANCED2_QUESTIONS } from "@/db/advanced2-seed-data";
import { ADVANCED3_QUESTIONS } from "@/db/advanced3-seed-data";
import { MEGA_QUESTIONS } from "@/db/mega-seed-data";
import { normalizeQuestionText } from "@/lib/question";

/** مزامنة بنك الأسئلة الافتراضي وإضافة المفقود فقط */
export async function POST() {
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
  const bankByKey = new Map<string, (typeof completeBank)[number]>();
  for (const question of completeBank) {
    const key = normalizeQuestionText(question.text);
    if (!bankByKey.has(key)) bankByKey.set(key, question);
  }
  const missing = [...bankByKey.entries()]
    .filter(([key]) => !existingKeys.has(key))
    .map(([textKey, question]) => ({ ...question, textKey }));

  if (missing.length === 0) {
    return NextResponse.json({ inserted: 0, total: existing.length, complete: true });
  }

  const inserted = await db
    .insert(questions)
    .values(missing)
    .returning({ id: questions.id });

  return NextResponse.json({
    inserted: inserted.length,
    total: existing.length + inserted.length,
    complete: true,
  });
}
