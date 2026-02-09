"use client";
import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useRegister } from "@/utils/registerContext";
import { ToastContext } from "@/app/layout";

/* ──────────────────────────── mappers (mirrors Flutter) ──────────────────────────── */
const GENDER_MAP: Record<string, number> = { Hombre: 1, Mujer: 2, "Prefiero no decirlo": 3 };
const INTEREST_MAP: Record<string, number> = { Hombres: 1, Mujeres: 2, Todxs: 3 };

const HABIT_MAP: Record<string, number> = {
  "Siempre escuchando música": 1, Gym: 2, Amigable: 3, "Cafe lover": 4,
  Extrovertido: 5, Procrastinador: 6, Organizado: 7, "Team nocturno": 8,
  Introvertido: 9, "Fan del descanso": 10, "Team madrugador": 11, "Foráneo": 12,
  "Todo el día en el tec": 13, "Me quedo a actividades": 14, Ingeniero: 15,
  "Busco ride": 16, Recursando: 17, "Sin dinero": 18, "Entro a todas las clases": 19,
};

/* ── degree name → id  (matches exec.sql insert order) ── */
const DEGREE_NAMES = [
  "Ingenieria en Sistemas Computacionales", // 1
  "Ingenieria Electrica",                   // 2
  "Ingenieria Electronica",                 // 3
  "Ingenieria Industrial",                  // 4
  "Ingenieria Mecanica",                    // 5
  "Ingenieria Mecatronica",                 // 6
  "Ingenieria Materiales",                  // 7
  "Ingenieria en Gestion Empresarial",      // 8
  "Otra",                                   // 9
];

const LOOKING_FOR_NAMES = [
  "Relacion seria",          // 1
  "Diversion/Corto plazo",   // 2
  "Hacer tarea juntos",      // 3
  "Contactos/Negocios",      // 4
  "Amigos",                  // 5
  "Lo sigo pensando",        // 6
];

function getDegreeId(name: string): number   { return DEGREE_NAMES.indexOf(name) + 1; }
function getLookingForId(name: string): number { return LOOKING_FOR_NAMES.indexOf(name) + 1; }

/* ──────────────────────────── component ──────────────────────────── */
export default function PasswordPage() {
  const router      = useRouter();
  const showToast   = useContext(ToastContext);
  const { data, reset } = useRegister();

  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);

  const ok = password.trim().length >= 6;

  console.log(data);

  /* ── main registration flow ── */
  const handleRegister = async () => {
    if (!ok) return;
    setLoading(true);

    const supabase = createClient();

    try {
      /* 1. Auth sign-up */
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email:    data.email!,
        password: password.trim(),
      });
      if (authErr) throw authErr;
      const userId = authData.user?.id;
      if (!userId) throw new Error("No se pudo crear usuario");

      /* 2. Resolve degree */
      let degreeId    = getDegreeId(data.degree!);
      let customDegree: string | null = null;
      if (data.degree === "Otra") {
        customDegree = data.customDegree ?? null;
      }

      /* 3. Insert user row */
      const { error: userErr } = await supabase.from("users").insert({
        id_user:           userId,
        name:              data.name,
        age:               data.age,
        description:       data.description ?? null,
        instagram_user:    data.instagramUser ?? null,
        profile_completed: true,
        id_gender:         GENDER_MAP[data.gender!],
        id_degree:         degreeId,
        custom_degree:     customDegree,
        id_looking_for:    getLookingForId(data.lookingFor!),
        id_interest:       INTEREST_MAP[data.interest!],
        is_premium:        false,
      });

      if (userErr) {
        console.log("Error inserting user row:", userErr);
        throw userErr;
      }

      /* 4. Insert habits */
      if (data.habits && data.habits.length > 0) {
        const habitRows = data.habits
          .map((h) => ({ id_user: userId, id_life_habit: HABIT_MAP[h] }))
          .filter((r) => r.id_life_habit !== undefined);

        if (habitRows.length) {
          const { error: habErr } = await supabase.from("user_has_life_habits").insert(habitRows);
          if (habErr) throw habErr;
        }
      }

      /* 5. Upload photos */
      if (data.photos && data.photos.length > 0) {
        for (let i = 0; i < data.photos.length; i++) {
          const path = `${userId}/photo_${i}.jpg`;
          const { error: upErr } = await supabase.storage.from("images").upload(path, data.photos[i], {
            upsert:      true,
            contentType: "image/jpeg",
          });
          if (upErr) throw upErr;

          const url = supabase.storage.from("images").getPublicUrl(path).data.publicUrl;

          const { error: photoErr } = await supabase.from("user_photos").insert({
            id_user:     userId,
            url,
            order_index: i,
            is_main:     i === 0,
          });
          if (photoErr) throw photoErr;
        }
      }

      /* 6. Done – go to premium upsell (placeholder → home for now) */
      reset();
      router.replace("/home/start");
    } catch (e: any) {
      showToast(e?.message ?? "Error durante el registro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-shell" style={{ background: "#fff" }}>
      <div className="scroll-body">
        <button className="back-btn" onClick={() => router.back()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>

        <h1 style={{ textAlign: "center", fontSize: 20, fontWeight: 600, margin: "10px 0 20px" }}>Ahora tu contraseña</h1>

        <input
          className="input-field"
          type="password"
          autoComplete="new-password"
          placeholder="Ingresa tu contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <p style={{ fontSize: 13, marginTop: 12, color: "var(--clr-grey-600)" }}>Mínimo 6 caracteres</p>
      </div>

      <div className="bottom-bar">
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, border: "4px solid var(--clr-grey-300)", borderTop: "4px solid var(--clr-pink)", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
            <span style={{ fontSize: 15, color: "var(--clr-grey-600)" }}>Creando cuenta…</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <button
            className={`btn-primary ${ok ? "btn-black" : "btn-grey"}`}
            disabled={!ok}
            onClick={handleRegister}
          >
            Crear cuenta
          </button>
        )}
      </div>
    </div>
  );
}
