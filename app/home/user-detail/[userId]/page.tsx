"use client";
import { useEffect, useState, useContext } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { ToastContext } from "@/app/layout";

interface UserDetail {
  id_user: string;
  name: string;
  age: number;
  description: string | null;
  instagram_user: string | null;
  gender: string | null;
  degree_name: string | null;
  looking_for: string | null;
  photos: string[];
  habits: string[];
}

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const showToast = useContext(ToastContext);

  const userId = params.userId as string;
  const source = searchParams.get("source") as "matches" | "likes" | "swiper" | null;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isPremium, setIsPremium] = useState(false);

  const showInstagram = source === "matches";
  const showButtons = source !== "matches";

  useEffect(() => {
    loadUser();
    checkPremium();
  }, [userId]);

  async function checkPremium() {
    const supabase = createClient();
    const myId = (await supabase.auth.getUser()).data.user?.id;
    if (!myId) return;
    const { data } = await supabase.from("users").select("is_premium").eq("id_user", myId).single();
    setIsPremium(data?.is_premium ?? false);
  }

  async function loadUser() {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("users")
        .select(`
          id_user, name, age, description, instagram_user, custom_degree,
          user_photos!left(url),
          genders(name), degrees(name), looking_for(name),
          user_has_life_habits(life_habits(name))
        `)
        .eq("id_user", userId)
        .single();

      if (!data) return;

      const photos = (data as any).user_photos?.map((p: any) => p.url) ?? [];
      const habitsData = (data as any).user_has_life_habits ?? [];
      const habits = habitsData.map((h: any) => h.life_habits?.name).filter(Boolean);

      setUser({
        id_user: data.id_user,
        name: data.name,
        age: data.age,
        description: data.description,
        instagram_user: data.instagram_user,
        gender: (data as any).genders?.name ?? null,
        degree_name: (data as any).degrees?.name ?? null,
        looking_for: (data as any).looking_for?.name ?? null,
        photos,
        habits,
      });
    } catch {
      showToast("Error al cargar usuario");
    } finally {
      setLoading(false);
    }
  }

  async function onLike() {
    const supabase = createClient();
    const myId = (await supabase.auth.getUser()).data.user?.id;
    if (!myId) return;

    try {
      // Check duplicate
      const { data: existing } = await supabase.from("user_likes").select("id_like").eq("id_user_from", myId).eq("id_user_to", userId).maybeSingle();
      if (existing) {
        showToast("Ya has dado like a este usuario");
        return;
      }

      // Check limit
      if (!isPremium) {
        const canSwipe = await supabase.rpc("check_and_add_swipe", { p_user_id: myId });
        if (!canSwipe) {
          showToast("Likes agotados. Vuélvete premium o espera hasta mañana");
          return;
        }
      }

      // Insert like
      await supabase.from("user_likes").upsert({ id_user_from: myId, id_user_to: userId }, { onConflict: "id_user_from,id_user_to" });

      // Create match if mutual
      await supabase.rpc("create_match_if_mutual_like", { p_user_a: myId, p_user_b: userId });

      if (source === "likes") {
        showToast(`¡Es un Match! Tú y ${user?.name} se gustan mutuamente 💖`);
      }

      router.back();
    } catch {
      showToast("Error al dar like");
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: "#fff" }}>
        <div style={{ width: 40, height: 40, border: "4px solid var(--clr-grey-300)", borderTop: "4px solid var(--clr-pink)", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: "#fff", padding: 20 }}>
        <p style={{ fontSize: 16, color: "var(--clr-grey-600)" }}>Usuario no encontrado</p>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "#fff", position: "relative" }}>
      {/* Back button */}
      <button
        onClick={() => router.back()}
        style={{
          position: "absolute",
          top: "env(safe-area-inset-top, 12px)",
          left: 8,
          zIndex: 10,
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "#fff",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        }}
      >
        ←
      </button>

      {/* Photo carousel */}
      <div style={{ position: "relative", height: "65vh", overflow: "hidden" }}>
        {user.photos[currentPhotoIndex] && (
          <Image src={user.photos[currentPhotoIndex]} alt={user.name} fill style={{ objectFit: "cover" }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent 50%)" }} />

        {/* Photo indicators */}
        {user.photos.length > 1 && (
          <div style={{ position: "absolute", top: "env(safe-area-inset-top, 50px)", left: 0, right: 0, padding: "0 8px", display: "flex", gap: 4 }}>
            {user.photos.map((_, i) => (
              <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i === currentPhotoIndex ? "#fff" : "rgba(255,255,255,0.3)" }} />
            ))}
          </div>
        )}

        {/* Swipe arrows */}
        {user.photos.length > 1 && (
          <>
            <button
              onClick={() => setCurrentPhotoIndex((p) => Math.max(0, p - 1))}
              style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 40, height: 40, borderRadius: "50%", background: "rgba(0,0,0,0.3)", color: "#fff", border: "none", fontSize: 20, cursor: "pointer" }}
            >
              ‹
            </button>
            <button
              onClick={() => setCurrentPhotoIndex((p) => Math.min(user.photos.length - 1, p + 1))}
              style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 40, height: 40, borderRadius: "50%", background: "rgba(0,0,0,0.3)", color: "#fff", border: "none", fontSize: 20, cursor: "pointer" }}
            >
              ›
            </button>
          </>
        )}

        {/* User info overlay */}
        <div style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 700, margin: 0, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
            {user.name}, {user.age}
          </h1>
          {showInstagram && user.instagram_user && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 10, background: "rgba(255,255,255,0.9)", borderRadius: 25, padding: "10px 16px" }}>
              <span style={{ fontSize: 18 }}>📷</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>@{user.instagram_user}</span>
            </div>
          )}
        </div>
      </div>

      {/* Details */}
      <div style={{ padding: 20, paddingBottom: showButtons ? 120 : 40 }}>
        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 30 }}>
          {user.gender && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 25, border: "1px solid var(--clr-grey-300)", background: "var(--clr-grey-50)" }}>
              <span style={{ fontSize: 18 }}>⚧</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{user.gender}</span>
            </div>
          )}
          {user.degree_name && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 25, border: "1px solid var(--clr-grey-300)", background: "var(--clr-grey-50)" }}>
              <span style={{ fontSize: 18 }}>🎓</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{user.degree_name}</span>
            </div>
          )}
          {user.looking_for && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 25, border: "1px solid var(--clr-grey-300)", background: "var(--clr-grey-50)" }}>
              <span style={{ fontSize: 18 }}>💖</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{user.looking_for}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {user.description && (
          <div style={{ marginBottom: 30 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 12px" }}>Sobre mí</h3>
            <div style={{ padding: 16, borderRadius: 16, background: "var(--clr-grey-50)", border: "1px solid var(--clr-grey-200)" }}>
              <p style={{ fontSize: 15, lineHeight: 1.5, margin: 0, color: "var(--clr-grey-800)" }}>{user.description}</p>
            </div>
          </div>
        )}

        {/* Habits */}
        {user.habits.length > 0 && (
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 12px" }}>Estilo de vida</h3>
            {user.habits.map((h, i) => (
              <div key={i} style={{ marginBottom: 8, padding: "12px 16px", borderRadius: 12, background: "var(--clr-grey-50)", border: "1px solid var(--clr-grey-200)", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--clr-pink)" }} />
                <span style={{ fontSize: 15, color: "var(--clr-grey-800)" }}>{h}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons */}
      {showButtons && (
        <div style={{ position: "fixed", bottom: 30, left: 0, right: 0, display: "flex", gap: 24, justifyContent: "center", padding: "0 40px", paddingBottom: 80 }}>
          <button
            onClick={() => router.back()}
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#fff",
              border: "none",
              cursor: "pointer",
              fontSize: 32,
              color: "var(--clr-pink)",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            }}
          >
            ✕
          </button>
          <button
            onClick={onLike}
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--clr-pink)",
              border: "none",
              cursor: "pointer",
              fontSize: 32,
              color: "#fff",
              boxShadow: "0 4px 10px rgba(255,107,107,0.3)",
            }}
          >
            ❤
          </button>
        </div>
      )}
    </div>
  );
}
