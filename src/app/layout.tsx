import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const SITE_URL = process.env.PUBLIC_APP_URL ?? "https://jeem-jawab.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "ج جواب | لعبة الأسئلة والمسابقات الجماعية بالعربي",
    template: "%s | ج جواب",
  },
  description:
    "ج جواب: لعبة مسابقات وأسئلة عربية جماعية مجانية. العب مع أصدقائك عبر QR أو رابط حتى 20 لاعباً. أسئلة في الجغرافيا والتاريخ والعلوم والإسلاميات والقرآن والأدب والكيمياء والفيزياء وغيرها.",
  keywords: [
    "لعبة أسئلة", "مسابقة عربية", "كاهوت عربي", "لعبة معلومات",
    "أسئلة وأجوبة", "مسابقة جماعية", "لعبة QR", "تريفيا عربي",
    "ج جواب", "jeem jawab", "لعبة اونلاين", "مسابقة اسئلة عامة",
  ],
  authors: [{ name: "ج جواب" }],
  creator: "ج جواب",
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: SITE_URL,
    siteName: "ج جواب",
    title: "ج جواب | لعبة الأسئلة والمسابقات الجماعية بالعربي",
    description:
      "العب مع أصدقائك لعبة أسئلة عربية مجانية — أسئلة في الجغرافيا والتاريخ والعلوم والإسلاميات والقرآن والأدب وأكثر. حتى 20 لاعباً عبر QR أو رابط.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ج جواب | لعبة الأسئلة الجماعية بالعربي",
    description:
      "لعبة مسابقات عربية مجانية للعب مع الأصدقاء — أكثر من 3900 سؤال متنوع.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
