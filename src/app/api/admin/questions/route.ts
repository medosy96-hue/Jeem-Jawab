import { NextResponse } from "next/server";
import { db } from "@/db";
import { questions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CATEGORIES, DIFFICULTY_LEVELS } from "@/lib/game";
import { normalizeQuestionText } from "@/lib/question";

function validate(body: any): { ok: true; data: any } | { ok: false; error: string } {
  const category = String(body?.category ?? "");
  const difficulty = String(body?.difficulty ?? "medium");
  const text = String(body?.text ?? "").trim();
  const options: string[] = Array.isArray(body?.options) ? body.options.map((o: unknown) => String(o).trim()) : [];
  const correctIndex = Number(body?.correctIndex);

  if (!CATEGORIES.some((c) => c.id === category)) {
    return { ok: false, error: "تصنيف غير صالح" };
  }
  if (!DIFFICULTY_LEVELS.some((d) => d.id === difficulty)) {
    return { ok: false, error: "مستوى صعوبة غير صالح" };
  }
  if (!text) {
    return { ok: false, error: "اكتب نص السؤال" };
  }
  if (options.length !== 4 || options.some((o) => !o)) {
    return { ok: false, error: "يجب إدخال 4 خيارات" };
  }
  if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) {
    return { ok: false, error: "اختر الجواب الصحيح" };
  }
  return { ok: true, data: { category, difficulty, text, options, correctIndex } };
}

/** قائمة الأسئلة + الإحصائيات */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category") ?? undefined;

  const all = await db.select().from(questions);
  const list = category ? all.filter((q) => q.category === category) : all;
  list.sort((a, b) => b.id - a.id);

  const counts: Record<string, number> = {};
  const difficultyCounts: Record<string, number> = {};
  for (const q of all) {
    counts[q.category] = (counts[q.category] ?? 0) + 1;
    difficultyCounts[q.difficulty] = (difficultyCounts[q.difficulty] ?? 0) + 1;
  }

  return NextResponse.json({
    questions: list.map((q) => ({
      id: q.id,
      category: q.category,
      difficulty: q.difficulty,
      text: q.text,
      options: q.options,
      correctIndex: q.correctIndex,
      imageUrl: q.imageUrl,
    })),
    stats: {
      total: all.length,
      perCategory: counts,
      perDifficulty: difficultyCounts,
    },
  });
}

/** إضافة سؤال */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const check = validate(body);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 400 });
  }
  const textKey = normalizeQuestionText(check.data.text);
  const duplicate = await db
    .select({ id: questions.id })
    .from(questions)
    .where(eq(questions.textKey, textKey))
    .limit(1);
  if (duplicate.length > 0) {
    return NextResponse.json(
      { error: "هذا السؤال موجود بالفعل في بنك الأسئلة — لا يمكن تكراره" },
      { status: 409 }
    );
  }

  try {
    const inserted = await db
      .insert(questions)
      .values({ ...check.data, textKey })
      .returning({ id: questions.id });
    return NextResponse.json({ id: inserted[0].id }, { status: 201 });
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      return NextResponse.json(
        { error: "هذا السؤال موجود بالفعل في بنك الأسئلة — لا يمكن تكراره" },
        { status: 409 }
      );
    }
    throw error;
  }
}

/** حذف الأسئلة معطّل لحماية البنك */
