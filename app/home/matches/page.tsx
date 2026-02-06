"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

interface Match {
  id_user: string;
  instagram_user: string | null;
  photo_url: string | null;
}

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, []);

  async function loadMatches() {
    try {
      const supabase = createClient();
      const currentUserId = (await supabase.auth.getUser()).data.user?.id;
      if (!currentUserId) return;

      const { data } = await supabase
        .from("matches")
        .select(`
          id_user_1, id_user_2,
          user1:users!matches_id_user_1_fkey ( id_user, instagram_user, user_photos!left(url, is_main) ),
          user2:users!matches_id_user_2_fkey ( id_user, instagram_user, user_photos!left(url, is_main) )
        `)
        .or(`id_user_1.eq.${currentUserId},id_user_2.eq.${currentUserId}`)
        .order("matched_at", { ascending: false });

      if (!data) return;

      const list: Match[] = [];
      for (const row of data) {
        const isUser1 = row.id_user_1 === currentUserId;
        const other = isUser1 ? row.user2 : row.user1;
        if (!other) continue;
        const photos = (other as any).user_photos ?? [];
        const mainPhoto = photos.find((p: any) => p.is_main) ?? photos[0];
        list.push({
          id_user: (other as any).id_user,
          instagram_user: (other as any).instagram_user,
          photo_url: mainPhoto?.url ?? null,
        });
      }
      setMatches(list);
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

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#fff" }}>
      {/* Header */}
      <div style={{ background: "var(--clr-red-900)", padding: "env(safe-area-inset-top, 12px) 0 12px", display: "flex", justifyContent: "center" }}>
        <Image src="/logo_tindertec.png" alt="ConectaTec" width={80} height={80} style={{ objectFit: "contain" }} />
      </div>

      {matches.length === 0 ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <p style={{ fontSize: 18, color: "var(--clr-grey-600)", textAlign: "center" }}>Aún no tienes matches 😢</p>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto", padding: 15, paddingBottom: 90 }}>
          <p style={{ fontSize: 15, fontWeight: 500, margin: "0 0 20px", lineHeight: 1.4 }}>
            Aquí salen las personas que te han y has dado like. Sus perfiles de Instagram ahora están disponibles
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {matches.map((m) => (
              <button
                key={m.id_user}
                onClick={() => router.push(`/home/user-detail/${m.id_user}?source=matches`)}
                style={{
                  position: "relative",
                  aspectRatio: "0.66",
                  borderRadius: 18,
                  overflow: "hidden",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  background: "var(--clr-grey-300)",
                }}
              >
                {m.photo_url && <Image src={m.photo_url} alt="match" fill style={{ objectFit: "cover" }} />}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.87), transparent 50%)",
                    display: "flex",
                    alignItems: "flex-end",
                    padding: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 18 }}>📷</span>
                    <p style={{ color: "#fff", fontSize: 16, fontWeight: 600, margin: 0 }}>
                      @{m.instagram_user ?? "unknown"}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
