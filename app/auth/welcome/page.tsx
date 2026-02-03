"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="mobile-shell" style={{ background: "var(--clr-red-900)" }}>

      {/* Center block */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 20px", textAlign: "center" }}>
        <Image src="/logo_tindertec.png" alt="ConectaTec" width={300} height={300} priority style={{ objectFit: "contain", maxHeight: 300 }} />
        <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 800, margin: "20px 0 0" }}>
          Bienvenido a ConectaTec
        </h1>
        <p style={{ color: "#fff", fontSize: 16, fontWeight: 600, margin: "20px 0 0", lineHeight: 1.4 }}>
          Conecta con estudiantes universitarios y encuentra nuevas amistades o algo más 😏
        </p>
      </div>

      {/* Bottom actions */}
      <div style={{ padding: "0 20px 40px" }}>
        <button className="btn-primary btn-white-pink" onClick={() => router.push("/auth/login")}>
          Iniciar sesión
        </button>
        <button
          onClick={() => router.push("/auth/text-welcome")}
          style={{ display: "block", width: "100%", marginTop: 10, background: "none", border: "none", color: "#fff", fontSize: 18, fontWeight: 600, cursor: "pointer", padding: "8px 0" }}
        >
          Crear una cuenta nueva
        </button>
      </div>
    </div>
  );
}
