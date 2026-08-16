"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CATEGORIES, DIFFICULTY_LEVELS } from "@/lib/game";
import { CategoryBadge } from "@/components/CategoryBadge";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { Brand } from "@/components/Brand";

interface AdminQuestion {
  id: number;
  category: string;
  difficulty: string;
  text: string;
  options: string[];
  correctIndex: number;
}

interface AdminData {
  questions: AdminQuestion[];
  stats: {
    total: number;
    perCategory: Record<string, number>;
    perDifficulty: Record<string, number>;
  };
}

const EMPTY_FORM = {
  category: "adab",
  difficulty: "medium",
  text: "",
  options: ["", "", "", ""],
  correctIndex: 0,
};

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/questions", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "تعذر التحميل");
      setData(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر التحميل");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const seed = async () => {
    setSeeding(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/seed", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data.error ?? "تعذر التعبئة");
      } else {
        setNotice(`✅ تمت إضافة ${data.inserted} سؤالاً جاهزاً!`);
        await load();
      }
    } finally {
      setSeeding(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const url = editId ? `/api/admin/questions/${editId}` : "/api/admin/questions";
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data.error ?? "تعذر الحفظ");
        return;
      }
      setNotice(editId ? "✏️ تم تعديل السؤال" : "✅ تمت إضافة السؤال");
      setForm(EMPTY_FORM);
      setEditId(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (q: AdminQuestion) => {
    setEditId(q.id);
    setForm({
      category: q.category,
      difficulty: q.difficulty,
      text: q.text,
      options: [...q.options],
      correctIndex: q.correctIndex,
    });
    setFormError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  };

  const filtered = (data?.questions ?? []).filter((q) => {
    const okCat = filter === "all" || q.category === filter;
    const okDifficulty = difficultyFilter === "all" || q.difficulty === difficultyFilter;
    const okSearch = !search.trim() || q.text.includes(search.trim());
    return okCat && okDifficulty && okSearch;
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Brand />
        <Link
          href="/"
          className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-black text-white/80 transition hover:bg-white/20"
        >
          العودة للموقع
        </Link>
      </div>

      <div className="mb-6 rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-md">
        <h1 className="text-2xl font-black text-white">⚙️ لوحة إدارة الأسئلة</h1>
        <p className="mt-1 text-sm font-bold text-white/60">
          أضف، عدّل، واحذف الأسئلة — اللعبة تختار أسئلة متنوعة من هذا البنك حسب عدد الجولة
        </p>

        {/* الإحصائيات */}
        {data && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-amber-400/20 px-4 py-1.5 text-sm font-black text-amber-300">
              📚 {data.stats.total} سؤالاً
            </span>
            {CATEGORIES.map((c) => (
              <span
                key={c.id}
                className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-white/80"
              >
                {c.emoji} {c.label}: {data.stats.perCategory[c.id] ?? 0}
              </span>
            ))}
          </div>
        )}

        {data && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {DIFFICULTY_LEVELS.map((d) => (
              <span
                key={d.id}
                className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-white/80"
              >
                {d.emoji} {d.label}: {data.stats.perDifficulty[d.id] ?? 0}
              </span>
            ))}
          </div>
        )}

        {/* تعبئة البنك */}
        {data && data.stats.total < 2054 && (
          <button
            onClick={seed}
            disabled={seeding}
            className="mt-4 w-full rounded-2xl bg-gradient-to-l from-emerald-500 to-teal-500 py-4 text-lg font-black text-white shadow-xl transition hover:brightness-110 disabled:opacity-50"
          >
            {seeding ? "جارٍ التعبئة..." : "🌱 مزامنة بنك الأسئلة الكامل (الأسئلة الجديدة جاهزة)"}
          </button>
        )}
        {notice && (
          <p className="mt-3 rounded-xl bg-emerald-500/15 px-3 py-2 text-center text-sm font-black text-emerald-300">
            {notice}
          </p>
        )}
      </div>

      {/* نموذج الإضافة/التعديل */}
      <form
        onSubmit={submit}
        className="mb-6 rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-md"
      >
        <h2 className="text-lg font-black text-white">
          {editId ? `✏️ تعديل السؤال #${editId}` : "➕ إضافة سؤال جديد"}
        </h2>
        <p className="mt-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-200">
          🛡️ منع التكرار مفعّل: لن يُحفظ السؤال إذا كان نصه موجوداً سابقاً، حتى مع اختلاف بسيط في المسافات أو الهمزات.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-black text-white/60">التصنيف</span>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="mt-1 w-full rounded-xl border border-white/20 bg-indigo-950/50 px-3 py-2.5 text-sm font-black text-white outline-none focus:border-amber-400"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-black text-white/60">الجواب الصحيح</span>
            <div className="mt-1 flex gap-2">
              {form.options.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setForm({ ...form, correctIndex: i })}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-black transition ${
                    form.correctIndex === i
                      ? "bg-emerald-500 text-white"
                      : "bg-white/10 text-white/60 hover:bg-white/20"
                  }`}
                >
                  {["أ", "ب", "ج", "د"][i]}
                </button>
              ))}
            </div>
          </label>
        </div>

        <label className="mt-3 block">
          <span className="text-xs font-black text-white/60">مستوى الصعوبة</span>
          <div className="mt-1 flex gap-2">
            {DIFFICULTY_LEVELS.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setForm({ ...form, difficulty: d.id })}
                className={`flex-1 rounded-xl py-2.5 text-sm font-black transition ${
                  form.difficulty === d.id
                    ? "bg-amber-500 text-slate-950"
                    : "bg-white/10 text-white/60 hover:bg-white/20"
                }`}
              >
                {d.emoji} {d.label}
              </button>
            ))}
          </div>
        </label>

        <label className="mt-3 block">
          <span className="text-xs font-black text-white/60">نص السؤال</span>
          <textarea
            value={form.text}
            onChange={(e) => setForm({ ...form, text: e.target.value })}
            rows={2}
            placeholder="اكتب السؤال هنا..."
            className="mt-1 w-full rounded-xl border border-white/20 bg-indigo-950/50 px-3 py-2.5 text-sm font-black text-white placeholder-white/40 outline-none focus:border-amber-400"
          />
        </label>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {form.options.map((opt, i) => (
            <label key={i} className="block">
              <span className="text-xs font-black text-white/60">الخيار {["أ", "ب", "ج", "د"][i]}</span>
              <input
                value={opt}
                onChange={(e) => {
                  const options = [...form.options];
                  options[i] = e.target.value;
                  setForm({ ...form, options });
                }}
                placeholder={`اكتب الخيار ${["أ", "ب", "ج", "د"][i]}`}
                className="mt-1 w-full rounded-xl border border-white/20 bg-indigo-950/50 px-3 py-2.5 text-sm font-black text-white placeholder-white/40 outline-none focus:border-amber-400"
              />
            </label>
          ))}
        </div>

        {formError && (
          <p className="mt-3 rounded-xl bg-rose-500/20 px-3 py-2 text-center text-xs font-bold text-rose-300">
            {formError}
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-2xl bg-gradient-to-l from-fuchsia-500 to-indigo-500 py-3 font-black text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
          >
            {saving ? "جارٍ الحفظ..." : editId ? "💾 حفظ التعديلات" : "➕ إضافة السؤال"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-2xl bg-white/10 px-6 py-3 font-black text-white transition hover:bg-white/20"
            >
              إلغاء
            </button>
          )}
        </div>
      </form>

      {/* الفلترة والبحث */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-4 py-1.5 text-xs font-black transition ${
            filter === "all" ? "bg-white text-slate-900" : "bg-white/10 text-white/70 hover:bg-white/20"
          }`}
        >
          الكل
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-black transition ${
              filter === c.id ? "bg-white text-slate-900" : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            {c.emoji} {c.label}
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-white/15" />
        <button
          onClick={() => setDifficultyFilter("all")}
          className={`rounded-full px-4 py-1.5 text-xs font-black transition ${
            difficultyFilter === "all" ? "bg-white text-slate-900" : "bg-white/10 text-white/70 hover:bg-white/20"
          }`}
        >
          كل المستويات
        </button>
        {DIFFICULTY_LEVELS.map((d) => (
          <button
            key={d.id}
            onClick={() => setDifficultyFilter(d.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-black transition ${
              difficultyFilter === d.id ? "bg-white text-slate-900" : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            {d.emoji} {d.label}
          </button>
        ))}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 بحث في الأسئلة..."
          className="mr-auto w-full max-w-56 rounded-xl border border-white/20 bg-indigo-950/50 px-3 py-2 text-sm font-bold text-white placeholder-white/40 outline-none focus:border-amber-400 sm:w-auto"
        />
      </div>

      {/* القائمة */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-amber-400" />
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-400/30 bg-rose-500/10 p-8 text-center font-black text-rose-300">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
          <div className="text-5xl">📭</div>
          <p className="mt-3 font-black text-white/70">لا توجد أسئلة مطابقة</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q) => (
            <div
              key={q.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition hover:bg-white/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CategoryBadge category={q.category} size="sm" />
                    <DifficultyBadge difficulty={q.difficulty} size="sm" />
                    <span className="text-[10px] font-black text-white/40"># {q.id}</span>
                  </div>
                  <p className="mt-2 font-black text-white">{q.text}</p>
                  <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                    {q.options.map((opt, i) => (
                      <span
                        key={i}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                          i === q.correctIndex
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-white/5 text-white/60"
                        }`}
                      >
                        {["أ", "ب", "ج", "د"][i]}. {opt} {i === q.correctIndex && "✓"}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => startEdit(q)}
                    className="rounded-xl bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:bg-sky-500/30"
                  >
                    ✏️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
