import Link from "next/link";

/** هوية ج جواب — حرف ج بداخله علامة استفهام */
export function Brand({
  large = false,
  centered = false,
  link = true,
}: {
  large?: boolean;
  centered?: boolean;
  link?: boolean;
}) {
  const content = (
    <span className={`inline-flex items-center gap-3 ${centered ? "justify-center" : ""}`}>
      <span
        aria-label="شعار ج جواب"
        className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[30%] border-2 border-white bg-emerald-600 shadow-lg shadow-emerald-950/40 ${
          large ? "h-20 w-20" : "h-11 w-11"
        }`}
      >
        <span
          className={`relative z-10 -translate-y-0.5 font-black leading-none text-white ${
            large ? "text-6xl" : "text-4xl"
          }`}
        >
          ج
        </span>
        <span
          className={`absolute z-20 flex items-center justify-center rounded-full bg-white font-black leading-none text-red-600 shadow-sm ${
            large
              ? "left-[18px] top-[25px] h-7 w-7 text-xl"
              : "left-[9px] top-[13px] h-4 w-4 text-[11px]"
          }`}
        >
          ؟
        </span>
        <span className="absolute inset-x-0 bottom-0 h-[13%] bg-red-600" />
      </span>

      <span className="text-right">
        <span
          className={`block font-black leading-none text-white ${
            large ? "text-4xl sm:text-5xl" : "text-lg"
          }`}
        >
          ج جواب
        </span>
        <span
          className={`mt-1 block tracking-[0.35em] text-red-500 ${
            large ? "text-sm" : "text-[8px]"
          }`}
          aria-hidden="true"
        >
          ★★★
        </span>
      </span>
    </span>
  );

  if (!link) return content;
  return (
    <Link href="/" className="inline-flex transition hover:brightness-110">
      {content}
    </Link>
  );
}
