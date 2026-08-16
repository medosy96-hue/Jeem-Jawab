"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** الانضمام إلى لعبة موجودة باستخدام الرمز فقط */
export function JoinCodeForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

    if (normalized.length !== 6) {
      setError("أدخل رمز اللعبة المكوّن من 6 أحرف");
      return;
    }

    setChecking(true);
    setError(null);
    try {
      const response = await fetch(`/api/games/${normalized}`, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? "لم نجد لعبة بهذا الرمز");
        return;
      }
      if (data.phase === "finished") {
        setError("هذه اللعبة انتهت بالفعل");
        return;
      }
      if (data.playersCount >= data.maxPlayers) {
        setError("اللعبة ممتلئة، الحد الأقصى 20 لاعباً");
        return;
      }
      router.push(`/join?code=${normalized}`);
    } catch {
      setError("تعذر الاتصال باللعبة، حاول مرة أخرى");
    } finally {
      setChecking(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="mt-8 w-full max-w-2xl rounded-3xl border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-md sm:p-6"
    >
      <div className="text-center">
        <h2 className="text-xl font-black text-white">عندك رمز لعبة؟ 🎟️</h2>
        <p className="mt-1 text-xs font-bold text-white/60">
          افتح الموقع على أي جهاز وأدخل الرمز الظاهر عند المضيف
        </p>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          dir="ltr"
          inputMode="text"
          autoCapitalize="characters"
          autoComplete="off"
          maxLength={6}
          value={code}
          onChange={(event) => {
            setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""));
            setError(null);
          }}
          placeholder="ABC123"
          aria-label="رمز اللعبة"
          className="min-w-0 flex-1 rounded-2xl border border-white/20 bg-black/50 px-4 py-3 text-center text-2xl font-black tracking-[0.35em] text-white uppercase outline-none placeholder:text-white/20 focus:border-emerald-400"
        />
        <button
          type="submit"
          disabled={checking}
          className="rounded-2xl bg-gradient-to-l from-red-600 to-red-500 px-7 py-3 font-black text-white shadow-lg transition hover:brightness-110 active:scale-95 disabled:opacity-50"
        >
          {checking ? "جارٍ التحقق..." : "انضم الآن"}
        </button>
      </div>
      {error && (
        <p className="mt-3 rounded-xl bg-rose-500/20 px-3 py-2 text-center text-xs font-bold text-rose-200">
          {error}
        </p>
      )}
    </form>
  );
}
