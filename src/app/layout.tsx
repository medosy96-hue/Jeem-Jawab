import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "ج جواب | لعبة الأسئلة الجماعية",
  description:
    "ج جواب — لعبة أسئلة وأجوبة عربية جماعية عبر رمز QR أو رابط، حتى 20 لاعباً وآلاف الأسئلة المتنوعة في 13 تصنيفاً.",
  verification: {
    google: "Hh-2t1uRUoNfmUDNM0JtuZ-Dnt8jualCNwLa-1yYxAw",
  },
  keywords: [
    "ج جواب",
    "لعبة أسئلة",
    "كويز",
    "أسئلة وأجوبة",
    "لعبة جماعية",
    "QR",
    "اسئلة اسلامية",
    "اسئلة ثقافية",
    "تحدي المعلومات",
    "quiz",
    "arabic quiz",
  ],
  openGraph: {
    title: "ج جواب | لعبة الأسئلة الجماعية",
    description: "العب مع أصدقائك — آلاف الأسئلة العربية في 13 تصنيفاً!",
    type: "website",
    locale: "ar_AR",
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
