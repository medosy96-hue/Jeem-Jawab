import type { SeedQuestion } from "@/db/seed-data";

/** يضبط مستوى صعوبة افتراضي لكل أسئلة حزمة بيانات لم تُحدد صعوبتها مسبقاً */
export function withDifficulty<T extends SeedQuestion>(
  bank: T[],
  difficulty: "easy" | "medium" | "hard"
): T[] {
  return bank.map((question) => ({
    ...question,
    difficulty: question.difficulty ?? difficulty,
  }));
}

/**
 * مفتاح ثابت لمنع تكرار أسئلة متشابهة نصياً.
 * يتجاهل التشكيل، اختلاف الهمزات، التطويل، والمسافات المتعددة.
 */
export function normalizeQuestionText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/ـ/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[\s\p{P}\p{S}_]+/gu, " ")
    .trim();
}
