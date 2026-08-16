import { NextResponse } from "next/server";
import { db } from "@/db";
import { questions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CATEGORIES } from "@/lib/game";
import { normalizeQuestionText } from "@/lib/question";

/** تعديل سؤال */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const qid = Number(id);
  if (!Number.isInteger(qid)) {
    return NextResponse.json({ error: "معرّف غير صالح" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const category = String(body?.category ?? "");
  const text = String(body?.text ?? "").trim();
  const options: string[] = Array.isArray(body?.options) ? body.options.map((o: unknown) => String(o).trim()) : [];
  const correctIndex = Number(body?.correctIndex);

  if (!CATEGORIES.some((c) => c.id === category)) {
    return NextResponse.json({ error: "تصنيف غير صالح" }, { status: 400 });
  }
  if (!text) return NextResponse.json({ error: "اكتب نص السؤال" }, { status: 400 });
  if (options.length !== 4 || options.some((o) => !o)) {
    return NextResponse.json({ error: "يجب إدخال 4 خيارات" }, { status: 400 });
  }
  if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) {
    return NextResponse.json({ error: "اختر الجواب الصحيح" }, { status: 400 });
  }

  const textKey = normalizeQuestionText(text);
  const duplicate = await db
    .select({ id: questions.id })
    .from(questions)
    .where(eq(questions.textKey, textKey))
    .limit(1);
  if (duplicate.length > 0 && duplicate[0].id !== qid) {
    return NextResponse.json(
      { error: "يوجد سؤال آخر بالنص نفسه في بنك الأسئلة" },
      { status: 409 }
    );
  }

  try {
    await db
      .update(questions)
      .set({ category, text, textKey, options, correctIndex })
      .where(eq(questions.id, qid));
    return NextResponse.json({ ok: true });
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      return NextResponse.json(
        { error: "يوجد سؤال آخر بالنص نفسه في بنك الأسئلة" },
        { status: 409 }
      );
    }
    throw error;
  }
}

/** حذف سؤال */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const qid = Number(id);
  if (!Number.isInteger(qid)) {
    return NextResponse.json({ error: "معرّف غير صالح" }, { status: 400 });
  }
  await db.delete(questions).where(eq(questions.id, qid));
  return NextResponse.json({ ok: true });
}
