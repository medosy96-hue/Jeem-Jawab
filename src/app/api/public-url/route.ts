import { NextResponse } from "next/server";

/**
 * يعيد أصل التطبيق الحقيقي من الخادم بدلاً من عنوان الصفحة الأم
 * عندما تكون المعاينة مفتوحة داخل إطار Arena.
 */
export async function GET(req: Request) {
  const configured = process.env.PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (configured) {
    return NextResponse.json({ origin: configured.replace(/\/$/, "") });
  }

  const headers = req.headers;
  const forwardedHost = headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || headers.get("host");
  const isLocalHost = !!host && /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host);
  const protocol = isLocalHost ? "http" : "https";
  const origin = host ? `${protocol}://${host}` : new URL(req.url).origin;

  return NextResponse.json({ origin });
}
