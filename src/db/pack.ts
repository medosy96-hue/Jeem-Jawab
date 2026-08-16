import type { SeedQuestion } from "./seed-data";

export type PackedRow = [
  text: string,
  correct: string,
  wrong1: string,
  wrong2: string,
  wrong3: string,
  difficulty: "easy" | "medium" | "hard",
  imageUrl?: string,
];

export function packQuestions(category: string, rows: PackedRow[]): SeedQuestion[] {
  return rows.map(([text, correct, wrong1, wrong2, wrong3, difficulty, imageUrl], index) => {
    const correctIndex = (index + 1) % 4;
    const options = [wrong1, wrong2, wrong3];
    options.splice(correctIndex, 0, correct);
    return {
      category,
      text,
      options,
      correctIndex,
      difficulty,
      imageUrl,
    };
  });
}
