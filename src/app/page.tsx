import Link from "next/link";
import { JoinCodeForm } from "@/components/JoinCodeForm";
import { Brand } from "@/components/Brand";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-4 py-10">
      {/* الشعار */}
      <div className="text-center">
        <div className="animate-float">
          <Brand large centered link={false} />
        </div>
        <p className="mt-3 text-sm font-black tracking-[0.2em] text-emerald-300">
          اسأل • جاوب • نافس
        </p>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed font-bold text-white/70">
          20 سؤالاً متنوعاً • حتى 20 لاعباً • نقطة لكل إجابة صحيحة
          <br />
          العبوا جنب بعض بالـ QR أو عن بُعد بالرابط!
        </p>
      </div>

      <JoinCodeForm />

      {/* اختيار الوضع */}
      <div className="mt-8 grid w-full max-w-4xl gap-5 sm:grid-cols-3">
        <Link
          href="/create?mode=local"
          className="group rounded-3xl border border-emerald-400/25 bg-emerald-500/10 p-7 text-center shadow-2xl backdrop-blur-md transition hover:-translate-y-1 hover:border-emerald-400/60 hover:bg-emerald-500/15"
        >
          <div className="text-6xl transition group-hover:scale-110">📱</div>
          <h2 className="mt-4 text-xl font-black text-white">لعبة محلية — QR</h2>
          <p className="mt-2 text-sm font-bold leading-relaxed text-white/60">
            أنشئ اللعبة واعرض رمز QR
            <br />
            والأصدقاء يصورونه ويلعبون معك
            <br />
            <span className="text-emerald-300">مثالية للعب جنب بعض</span>
          </p>
          <span className="mt-4 inline-block rounded-2xl bg-gradient-to-l from-emerald-600 to-green-500 px-6 py-2.5 font-black text-white shadow-lg transition group-hover:brightness-110">
            ابدأ الآن
          </span>
        </Link>

        <Link
          href="/create?mode=online"
          className="group rounded-3xl border border-red-400/25 bg-red-500/10 p-7 text-center shadow-2xl backdrop-blur-md transition hover:-translate-y-1 hover:border-red-400/60 hover:bg-red-500/15"
        >
          <div className="text-6xl transition group-hover:scale-110">🌍</div>
          <h2 className="mt-4 text-xl font-black text-white">لعبة أونلاين — رابط</h2>
          <p className="mt-2 text-sm font-bold leading-relaxed text-white/60">
            شارك الرابط مع أصدقائك
            <br />
            أينما كانوا حتى 20 لاعباً
            <br />
            <span className="text-red-300">مثالية للعب عن بُعد</span>
          </p>
          <span className="mt-4 inline-block rounded-2xl bg-gradient-to-l from-red-600 to-rose-500 px-6 py-2.5 font-black text-white shadow-lg transition group-hover:brightness-110">
            ابدأ الآن
          </span>
        </Link>

        <a
          href="https://harif-ism.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col overflow-hidden rounded-3xl border border-white/15 bg-white/5 text-center shadow-2xl backdrop-blur-md transition hover:-translate-y-1 hover:border-white/40 hover:bg-white/10"
        >
          <img
            src="/harf-ism-preview.png"
            alt="حرف اسم — لعبة حروف عربية"
            className="w-full transition group-hover:scale-105"
          />
          <div className="flex flex-1 flex-col items-center justify-center p-5">
            <h2 className="text-xl font-black text-white">🔤 حرف اسم</h2>
            <p className="mt-2 text-sm font-bold leading-relaxed text-white/60">
              جرّب لعبتنا التانية!
              <br />
              <span className="text-teal-300">تحدّي حروف عربي سريع</span>
            </p>
            <span className="mt-4 inline-block rounded-2xl bg-gradient-to-l from-teal-600 to-emerald-500 px-6 py-2.5 font-black text-white shadow-lg transition group-hover:brightness-110">
              العب الآن
            </span>
          </div>
        </a>
      </div>

      {/* كيف تلعب */}
      <div className="mt-12 w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <h3 className="text-center text-lg font-black text-white">كيف تلعب؟ 🤔</h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            { icon: "🎮", title: "1. أنشئ اللعبة", desc: "اختر الوضع (QR أو رابط) وسجّل اسمك كمضيف" },
            { icon: "👥", title: "2. انضم الأصدقاء", desc: "يصورون رمز QR أو يدخلون الرابط ويسجلون أسماءهم" },
            { icon: "🏆", title: "3. العب وافز", desc: "20 سؤالاً في 7 تصنيفات، والأعلى نقاطاً هو البطل!" },
          ].map((s) => (
            <div key={s.title} className="rounded-2xl bg-white/5 p-4 text-center">
              <div className="text-3xl">{s.icon}</div>
              <div className="mt-2 font-black text-white">{s.title}</div>
              <p className="mt-1 text-xs leading-relaxed font-bold text-white/60">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* رابط الإدارة */}
      <Link
        href="/admin"
        className="mt-10 rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-black text-white/60 transition hover:bg-white/10 hover:text-white"
      >
        ⚙️ لوحة إدارة الأسئلة
      </Link>
    </main>
  );
}
