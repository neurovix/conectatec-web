"use client";
import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { ToastContext } from "@/app/layout";

export default function ProfilePage() {
  const router = useRouter();
  const showToast = useContext(ToastContext);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [description, setDescription] = useState("");
  const [instagram, setInstagram] = useState("");
  const [gender, setGender] = useState("");
  const [degree, setDegree] = useState("");
  const [customDegree, setCustomDegree] = useState<string | null>(null);
  const [interest, setInterest] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserInfo();
  }, []);

  async function loadUserInfo() {
    try {
      const supabase = createClient();
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;

      const { data } = await supabase
        .from("users")
        .select(`
          name, age, description, instagram_user, id_gender, id_degree, custom_degree, id_interest, is_premium,
          user_photos!inner(url, is_main)
        `)
        .eq("id_user", userId)
        .eq("user_photos.is_main", true)
        .single();

      if (!data) return;

      const photos = (data as any).user_photos ?? [];
      const mainPhoto = photos[0]?.url ?? "";

      setName(data.name ?? "");
      setAge(`${data.age} años`);
      setDescription(data.description ?? "");
      setInstagram(data.instagram_user ?? "");
      setGender(data.id_gender?.toString() ?? "");
      setDegree(data.id_degree?.toString() ?? "");
      setCustomDegree(data.custom_degree);
      setInterest(data.id_interest?.toString() ?? "");
      setIsPremium(data.is_premium ?? false);
      setPhotoUrl(mainPhoto);
    } catch {
      showToast("Error al cargar perfil");
    } finally {
      setLoading(false);
    }
  }

  async function updateName(value: string) {
    try {
      const supabase = createClient();
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;
      await supabase.from("users").update({ name: value }).eq("id_user", userId);
    } catch {
      showToast("Error al actualizar nombre");
    }
  }

  async function updateDescription(value: string) {
    try {
      const supabase = createClient();
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;
      await supabase.from("users").update({ description: value }).eq("id_user", userId);
    } catch {
      showToast("Error al actualizar descripción");
    }
  }

  async function updateInstagram(value: string) {
    try {
      const supabase = createClient();
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;
      await supabase.from("users").update({ instagram_user: value }).eq("id_user", userId);
    } catch {
      showToast("Error al actualizar Instagram");
    }
  }

  async function deleteAccount() {
    const confirm = window.confirm("Esta acción es permanente y eliminará toda tu información. ¿Estás seguro de que deseas continuar?");
    if (!confirm) return;
    try {
      const supabase = createClient();
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;
      await supabase.rpc("delete_user_account", { p_user_id: userId });
      await supabase.auth.signOut();
      router.replace("/auth/login");
    } catch {
      showToast("Error al eliminar cuenta");
    }
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/auth/welcome");
  }

  function showEditDialog(label: string, initial: string, onSave: (v: string) => void) {
    const val = prompt(`Editar ${label}:`, initial);
    if (val !== null) {
      onSave(val);
      if (label === "nombre") setName(val);
      if (label === "descripción") setDescription(val);
      if (label === "Instagram") setInstagram(val);
    }
  }

  function getGender(id: string): string {
    if (id === "1") return "Hombre";
    if (id === "2") return "Mujer";
    return "Prefiero no decirlo";
  }

  function getDegree(id: string): string {
    if (id === "9") return customDegree || "Otra";
    const names = ["", "Ingeniería en Sistemas Computacionales", "Ingeniería Eléctrica", "Ingeniería Electrónica", "Ingeniería Industrial", "Ingeniería Mecánica", "Ingeniería Mecatrónica", "Ingeniería en Materiales", "Ingeniería en Gestión Empresarial"];
    return names[parseInt(id)] || "";
  }

  function getInterest(id: string): string {
    if (id === "1") return "Hombres";
    if (id === "2") return "Mujeres";
    return "Todxs";
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: "#fff" }}>
        <div style={{ width: 40, height: 40, border: "4px solid var(--clr-grey-300)", borderTop: "4px solid var(--clr-pink)", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "var(--clr-grey-50)", paddingBottom: 80 }}>
      {/* AppBar */}
      <div style={{ background: "linear-gradient(135deg, var(--clr-red-900), var(--clr-red-800))", padding: "env(safe-area-inset-top, 12px) 0 16px", textAlign: "center" }}>
        <h1 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: 0 }}>Mi Perfil</h1>
      </div>

      <div style={{ padding: 20 }}>
        {/* Premium card */}
        {!isPremium && (
          <div
            style={{
              background: "linear-gradient(135deg, var(--clr-red-800), var(--clr-red-900))",
              borderRadius: 20,
              padding: 24,
              marginBottom: 24,
              boxShadow: "0 10px 20px rgba(255,107,107,0.3)",
              textAlign: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 28 }}>👑</span>
              <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: 1.2 }}>CONECTATEC PREMIUM</h2>
            </div>
            <p style={{ color: "#fff", fontSize: 14, fontWeight: 500, margin: "0 0 16px" }}>
              Sube de nivel con cada acción que realices
            </p>
            <button
              onClick={() => router.push("/home/premium")}
              style={{
                background: "#fff",
                color: "var(--clr-red-900)",
                border: "none",
                borderRadius: 30,
                padding: "14px 32px",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Aprender más
            </button>
          </div>
        )}

        {/* Avatar */}
        <div style={{ height: 420, borderRadius: 28, overflow: "hidden", marginBottom: 24, boxShadow: "0 10px 20px rgba(0,0,0,0.25)", position: "relative" }}>
          {photoUrl && <Image src={photoUrl} alt="Profile" fill style={{ objectFit: "cover" }} />}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent 50%)" }} />
        </div>

        {/* Info section */}
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--clr-grey-800)", margin: "0 0 16px" }}>Información Personal</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Nombre", value: name, icon: "👤", editable: isPremium, onEdit: () => showEditDialog("nombre", name, updateName) },
            { label: "Edad", value: age, icon: "🎂", editable: false, onEdit: () => {} },
            { label: "Descripción", value: description, icon: "📝", editable: isPremium, onEdit: () => showEditDialog("descripción", description, updateDescription) },
            { label: "Instagram", value: instagram, icon: "📷", editable: isPremium, onEdit: () => showEditDialog("Instagram", instagram, updateInstagram) },
          ].map((f) => (
            <div
              key={f.label}
              onClick={f.editable ? f.onEdit : undefined}
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: 16,
                display: "flex",
                alignItems: "center",
                gap: 16,
                boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                cursor: f.editable ? "pointer" : "default",
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--clr-red-900)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                {f.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, color: "var(--clr-grey-600)", fontWeight: 500, margin: 0 }}>{f.label}</p>
                <p style={{ fontSize: 16, fontWeight: 600, margin: "4px 0 0" }}>{f.value}</p>
              </div>
              {!isPremium && <span style={{ fontSize: 22, color: "var(--clr-grey-500)" }}>🔒</span>}
              {isPremium && f.editable && <span style={{ fontSize: 22, color: "var(--clr-red-900)" }}>✏️</span>}
            </div>
          ))}
        </div>

        {/* Preferences */}
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--clr-grey-800)", margin: "0 0 16px" }}>Preferencias</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Género", value: getGender(gender), icon: "⚧" },
            { label: "Carrera", value: getDegree(degree), icon: "🎓" },
            { label: "Interesado en", value: getInterest(interest), icon: "💖" },
          ].map((f) => (
            <div key={f.label} style={{ background: "#fff", borderRadius: 16, padding: 16, display: "flex", alignItems: "center", gap: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--clr-red-900)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                {f.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, color: "var(--clr-grey-600)", fontWeight: 500, margin: 0 }}>{f.label}</p>
                <p style={{ fontSize: 16, fontWeight: 700, margin: "4px 0 0" }}>{f.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", marginBottom: 24 }}>
          {[
            { label: "Cerrar sesión", sub: "Salir de la aplicación", icon: "🚪", color: "var(--clr-red-900)", onClick: signOut },
            { label: "Eliminar cuenta", sub: "Sin cuenta atrás", icon: "🗑️", color: "var(--clr-red-900)", onClick: deleteAccount },
          ].map((a, i) => (
            <div key={i}>
              <button
                onClick={a.onClick}
                style={{
                  width: "100%",
                  padding: 16,
                  background: "none",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${a.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                  {a.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 16, fontWeight: 600, color: a.color, margin: 0 }}>{a.label}</p>
                  <p style={{ fontSize: 13, color: "var(--clr-grey-600)", margin: "2px 0 0" }}>{a.sub}</p>
                </div>
                <span style={{ fontSize: 20, color: "var(--clr-grey-400)" }}>›</span>
              </button>
              {i === 0 && <div style={{ height: 1, background: "var(--clr-grey-200)", margin: "0 16px" }} />}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", color: "var(--clr-grey-500)", fontSize: 12 }}>
          <p style={{ margin: 0 }}>Version 1.0.0</p>
          <p style={{ margin: "4px 0 0" }}>© {new Date().getFullYear()} Aplicación creada por <span style={{ color: "var(--clr-pink)", fontWeight: 600 }}>Neurovix</span></p>
        </div>
      </div>
    </div>
  );
}
