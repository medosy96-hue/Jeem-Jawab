import { NextResponse } from "next/server";
import { db } from "@/db";
import { questions } from "@/db/schema";
import { SEED_QUESTIONS } from "@/db/seed-data";
import { ADVANCED_QUESTIONS } from "@/db/advanced-seed-data";
import { ADVANCED2_QUESTIONS } from "@/db/advanced2-seed-data";
import { ADVANCED3_QUESTIONS } from "@/db/advanced3-seed-data";
import { MEGA_QUESTIONS } from "@/db/mega-seed-data";
import { EXTRA_OLD_QUESTIONS } from "@/db/extra-old-seed-data";
import { EXTRA_OLD2_QUESTIONS } from "@/db/extra-old2-seed-data";
import { NEWCATS1_QUESTIONS } from "@/db/newcats1-seed-data";
import { NEWCATS2_QUESTIONS } from "@/db/newcats2-seed-data";
import { NEWCATS_PAD_QUESTIONS } from "@/db/newcats-pad-seed-data";
import { NEWCATS_PAD2_QUESTIONS } from "@/db/newcats-pad2-seed-data";
import { normalizeQuestionText, withDifficulty } from "@/lib/question";

/** مزامنة بنك الأسئلة الافتراضي وإضافة المفقود فقط */
export async function POST() {
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
