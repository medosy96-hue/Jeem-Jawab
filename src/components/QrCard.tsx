"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

/** توليد وعرض رمز QR */
export function QrCard({ value, size = 216 }: { value: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 1,
      color: { dark: "#1e1b4b", light: "#ffffff" },
    })
      .then((url) => {
        if (alive) setDataUrl(url);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        className="animate-pulse rounded-2xl bg-white/20"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt="رمز QR للانضمام"
      width={size}
      height={size}
      className="rounded-2xl bg-white p-2 shadow-xl"
    />
  );
}
