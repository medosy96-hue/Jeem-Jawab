import { GameJoin } from "@/components/GameJoin";
import { JoinCodeForm } from "@/components/JoinCodeForm";
import { Brand } from "@/components/Brand";

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  if (!code) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-4 py-10 text-center">
        <Brand />
        <div className="mt-6 text-6xl">🎟️</div>
        <h1 className="mt-3 text-2xl font-black text-white">أدخل رمز اللعبة</h1>
        <p className="mt-1 text-sm font-bold text-white/60">
          ستجد الرمز المكوّن من 6 أحرف على شاشة المضيف
        </p>
        <JoinCodeForm />
      </main>
    );
  }

  return <GameJoin code={code} />;
}
