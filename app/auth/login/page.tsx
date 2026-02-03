"use client";
import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { ToastContext } from "@/app/layout";

export default function LoginPage() {
  const router = useRouter();
  const showToast = useContext(ToastContext);

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showToast("Por favor llena todos los campos");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: password.trim() });
      if (error) throw error;
      router.replace("/home/start");
    } catch {
      showToast("Correo o contraseña incorrectos. Asegúrate de tener una cuenta registrada o crea una");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-shell login-shell">

      {/* Back */}
      <div style={{ padding: "env(safe-area-inset-top, 12px) 0 0 8px" }}>
        <button className="back-btn" onClick={() => router.back()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "60px 20px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Image src="/logo_tindertec.png" alt="ConectaTec" width={200} height={200} style={{ objectFit: "contain", maxHeight: 200 }} />

        <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 700, margin: "20px 0 40px", textAlign: "center" }}>Inicia sesión</h1>

        <div style={{ width: "100%" }}>
          <input
            className="input-login"
            type="email"
            autoComplete="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>
        <div style={{ width: "100%", marginTop: 20 }}>
          <input
            className="input-login"
            type="password"
            autoComplete="current-password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>

        <button
          className="btn-primary btn-white-pink"
          style={{ marginTop: 40 }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Iniciando…" : "Iniciar sesión"}
        </button>

        <p style={{ color: "#fff", fontSize: 16, marginTop: 30, textAlign: "center" }}>
          ¿No tienes una cuenta aún?{" "}
          <button onClick={() => router.push("/auth/text-welcome")} style={{ background: "none", border: "none", color: "#fff", fontWeight: 700, textDecoration: "underline", cursor: "pointer", fontSize: "inherit", padding: 0 }}>
            Regístrate
          </button>
        </p>
      </div>

      {/* bottom safe‑area spacer */}
      <div style={{ height: "env(safe-area-inset-bottom, 40px)", flexShrink: 0 }} />
    </div>
  );
}
