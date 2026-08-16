/** إعدادات اللعبة */
export const TOTAL_QUESTIONS = 20;
export const DEFAULT_QUESTION_SECONDS = 20;
export const DEFAULT_RESULT_SECONDS = 5;
export const QUESTION_TIME_OPTIONS = [10, 15, 20, 30, 45, 60] as const;
export const RESULT_TIME_OPTIONS = [3, 5, 7, 10] as const;
export const TOTAL_QUESTIONS_OPTIONS = [5, 10, 15, 20, 30, 40, 50] as const;
export const MAX_PLAYERS = 20;
export const NAME_MAX_LENGTH = 20;

export function validTotalQuestions(value: unknown): number {
  const count = Number(value);
  return TOTAL_QUESTIONS_OPTIONS.includes(
    count as (typeof TOTAL_QUESTIONS_OPTIONS)[number]
  )
    ? count
    : TOTAL_QUESTIONS;
}

export function validQuestionSeconds(value: unknown): number {
  const seconds = Number(value);
  return QUESTION_TIME_OPTIONS.includes(seconds as (typeof QUESTION_TIME_OPTIONS)[number])
    ? seconds
    : DEFAULT_QUESTION_SECONDS;
}

export function validResultSeconds(value: unknown): number {
  const seconds = Number(value);
  return RESULT_TIME_OPTIONS.includes(seconds as (typeof RESULT_TIME_OPTIONS)[number])
    ? seconds
    : DEFAULT_RESULT_SECONDS;
}

/** التصنيفات */
export const CATEGORIES = [
  { id: "adab", label: "أدب", emoji: "📚" },
  { id: "science", label: "علوم", emoji: "🔬" },
  { id: "islamiyat", label: "إسلاميات", emoji: "🕌" },
  { id: "quran", label: "قرآن", emoji: "📖" },
  { id: "arabic-tv", label: "مسلسلات وأفلام عربية", emoji: "🎬" },
  { id: "spacetoon", label: "كرتون سبيستون", emoji: "🎮" },
  { id: "companions", label: "الصحابة والأنبياء", emoji: "⭐" },
  { id: "geography", label: "جغرافيا", emoji: "🌍" },
  { id: "history", label: "تاريخ", emoji: "🏛️" },
  { id: "physics", label: "فيزياء", emoji: "⚛️" },
  { id: "chemistry", label: "كيمياء", emoji: "🧪" },
  { id: "animals", label: "حيوانات", emoji: "🦁" },
  { id: "plants", label: "نباتات", emoji: "🌿" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export function categoryLabel(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function categoryEmoji(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.emoji ?? "❓";
}

/** مستويات الصعوبة */
export const DIFFICULTY_LEVELS = [
  { id: "easy", label: "سهل", emoji: "🟢" },
  { id: "medium", label: "متوسط", emoji: "🟡" },
  { id: "hard", label: "صعب", emoji: "🔴" },
] as const;

export type DifficultyId = (typeof DIFFICULTY_LEVELS)[number]["id"];

export function difficultyLabel(id: string): string {
  return DIFFICULTY_LEVELS.find((d) => d.id === id)?.label ?? id;
}

export function difficultyEmoji(id: string): string {
  return DIFFICULTY_LEVELS.find((d) => d.id === id)?.emoji ?? "❔";
}

export const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-emerald-500/20 text-emerald-200 border-emerald-400/40",
  medium: "bg-amber-400/20 text-amber-200 border-amber-400/40",
  hard: "bg-red-500/20 text-red-200 border-red-400/40",
};

/** يبقي فقط قيم الصعوبة المعروفة، ويتجاهل أي قيمة غير صالحة */
export function validDifficulties(value: unknown): string[] {
  const validIds = new Set<string>(DIFFICULTY_LEVELS.map((d) => d.id));
  if (!Array.isArray(value)) return [];
  return value
    .map((id) => String(id))
    .filter((id) => validIds.has(id));
}

export const CATEGORY_COLORS: Record<string, string> = {
  adab: "bg-emerald-500/20 text-emerald-200 border-emerald-400/40",
  science: "bg-white/15 text-white border-white/30",
  islamiyat: "bg-green-600/25 text-green-200 border-green-400/40",
  quran: "bg-emerald-700/30 text-emerald-100 border-emerald-400/40",
  "arabic-tv": "bg-red-500/20 text-red-200 border-red-400/40",
  spacetoon: "bg-rose-600/20 text-rose-200 border-rose-400/40",
  companions: "bg-slate-500/25 text-slate-100 border-slate-300/30",
  geography: "bg-sky-500/20 text-sky-200 border-sky-400/40",
  history: "bg-amber-700/25 text-amber-100 border-amber-500/40",
  physics: "bg-violet-500/20 text-violet-200 border-violet-400/40",
  chemistry: "bg-lime-500/20 text-lime-200 border-lime-400/40",
  animals: "bg-orange-500/20 text-orange-200 border-orange-400/40",
  plants: "bg-green-500/20 text-green-200 border-green-400/40",
};

export const ANSWER_COLORS = [
  { bg: "bg-red-500 hover:bg-red-400 active:bg-red-600", ring: "ring-red-200" },
  { bg: "bg-blue-500 hover:bg-blue-400 active:bg-blue-600", ring: "ring-blue-200" },
  { bg: "bg-amber-400 hover:bg-amber-300 active:bg-amber-500", ring: "ring-amber-200", text: "text-slate-950" },
  { bg: "bg-green-500 hover:bg-green-400 active:bg-green-600", ring: "ring-green-200" },
];

export const ANSWER_LETTERS = ["أ", "ب", "ج", "د"];

/** ترتيب ثابت عشوائي للخيارات داخل لعبة واحدة، ومختلف بين الألعاب */
export function optionPermutation(seed: string): number[] {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const order = [0, 1, 2, 3];
  let state = hash >>> 0;
  for (let i = order.length - 1; i > 0; i--) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    const j = (state >>> 0) % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

export function optionSeed(gameId: string, questionIndex: number, questionId: number) {
  return `${gameId}:${questionIndex}:${questionId}`;
}

export type Phase = "lobby" | "active" | "break" | "finished";

/** توليد رمز لعبة فريد */
export function generateGameCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function generateId(): string {
  return crypto.randomUUID();
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** اختيار عدد محدد من الأسئلة المتنوعة عشوائياً بلا تحيّز لمستوى صعوبة معيّن */
export function pickQuestions(
  questions: {
    id: number;
    category: string;
    familyKey?: string | null;
  }[],
  count = TOTAL_QUESTIONS
): number[] {
  const perCategory = 3;
  type Pickable = (typeof questions)[number];
  const byCat = new Map<string, Pickable[]>();

  for (const question of questions) {
    if (!byCat.has(question.category)) byCat.set(question.category, []);
    byCat.get(question.category)!.push(question);
  }

  const familyOf = (question: Pickable) => question.familyKey ?? `question:${question.id}`;
  const uniqueFamilies = (items: Pickable[]) => {
    const seen = new Set<string>();
    return items.filter((item) => {
      const family = familyOf(item);
      if (seen.has(family)) return false;
      seen.add(family);
      return true;
    });
  };

  const picked: Pickable[] = [];
  for (const list of byCat.values()) {
    const categoryPool = uniqueFamilies(shuffle(list));
    const selected = categoryPool.slice(0, perCategory);
    picked.push(...selected);
  }

  // إن لم يكتمل العدد (مثلاً اختيار تصنيف واحد)، نملأ من عائلات مختلفة.
  if (picked.length < count) {
    const usedFamilies = new Set(picked.map(familyOf));
    const rest = uniqueFamilies(shuffle(questions)).filter(
      (question) => !usedFamilies.has(familyOf(question))
    );
    picked.push(...rest.slice(0, count - picked.length));
  }

  return shuffle(picked).slice(0, count).map((question) => question.id);
}
