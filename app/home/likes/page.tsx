"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

interface LikeUser {
  id_user: string;
  name: string;
  photo_url: string | null;
}

export default function LikesPage() {
  const router = useRouter();
  const [isPremium, setIsPremium] = useState(false);
  const [likes, setLikes] = useState<LikeUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    try {
      const supabase = createClient();
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;

      const { data: userData } = await supabase.from("users").select("is_premium").eq("id_user", userId).single();
      const premium = userData?.is_premium ?? false;
      setIsPremium(premium);

      if (premium) {
        const likesRes = await supabase.rpc("get_incoming_likes_no_match", { p_user_id: userId });
        if (likesRes) {
          const list: LikeUser[] = likesRes.map((u: any) => {
            const photos = u.user_photos ?? [];
            return {
              id_user: u.id_user,
              name: u.name,
              photo_url: photos[0]?.url ?? null,
            };
          });
          setLikes(list);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
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

  if (!isPremium) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#fff" }}>
        <div style={{ background: "var(--clr-red-900)", padding: "env(safe-area-inset-top, 12px) 0 12px", display: "flex", justifyContent: "center" }}>
          <Image src="/logo_tindertec.png" alt="ConectaTec" width={80} height={80} style={{ objectFit: "contain" }} />
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <p style={{ fontSize: 18, color: "var(--clr-grey-700)", fontWeight: 500, textAlign: "center", lineHeight: 1.5 }}>
            Tienes que ser premium para ver a qué personas le gustaste
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#fff" }}>
      <div style={{ background: "var(--clr-red-900)", padding: "env(safe-area-inset-top, 12px) 0 12px", display: "flex", justifyContent: "center" }}>
        <Image src="/logo_tindertec.png" alt="ConectaTec" width={80} height={80} style={{ objectFit: "contain" }} />
      </div>

      {likes.length === 0 ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <p style={{ fontSize: 18, color: "var(--clr-grey-600)" }}>Aún no tienes likes</p>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto", padding: 15, paddingBottom: 90 }}>
          <p style={{ fontSize: 15, fontWeight: 500, margin: "0 0 20px" }}>
            Aquí salen las personas que te han dado like
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {likes.map((u) => (
              <button
                key={u.id_user}
                onClick={() => router.push(`/home/user-detail/${u.id_user}?source=likes`)}
                style={{
                  position: "relative",
                  aspectRatio: "0.7",
                  borderRadius: 18,
                  overflow: "hidden",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  background: "var(--clr-grey-300)",
                }}
              >
                {u.photo_url && <Image src={u.photo_url} alt={u.name} fill style={{ objectFit: "cover" }} />}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent 50%)",
                    display: "flex",
                    alignItems: "flex-end",
                    padding: 12,
                  }}
                >
                  <p style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: 0, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
                    {u.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
