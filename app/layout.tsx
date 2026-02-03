"use client";
import "./globals.css";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

/* ── Global toast singleton ── */
export const ToastContext = React.createContext<(msg: string, ms?: number) => void>(() => {});

import React from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string, ms = 2400) => {
    setToast(msg);
    setTimeout(() => setToast(null), ms);
  };

  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="icon" href="/tindertec_icon.png" type="image/png" />
        <title>ConectaTec</title>
        <meta name="description" content="Conecta con estudiantes universitarios" />
      </head>
      <body>
        <ToastContext.Provider value={showToast}>
          {children}
        </ToastContext.Provider>

        {/* Global toast */}
        <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>
      </body>
    </html>
  );
}
