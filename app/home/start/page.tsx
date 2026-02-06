"use client";
import { useEffect, useState, useRef, useContext } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { ToastContext } from "@/app/layout";

interface UserCard {
  id_user: string;
  name: string;
  age: number;
  description: string | null;
  degree_name: string | null;
  photo_url: string | null;
}

export default function StartPage() {
  const router = useRouter();
  const showToast = useContext(ToastContext);

  const [cards, setCards] = useState<UserCard[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  const topCardRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef({ startX: 0, startY: 0, isDragging: false, offsetX: 0, offsetY: 0 });

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  async function checkAuthAndLoad() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.replace("/auth/welcome");
      return;
    }
    await checkPremium();
    await loadMoreUsers();
  }

  async function checkPremium() {
    const supabase = createClient();
    const userId = supabase.auth.getUser().then((r) => r.data.user?.id);
    if (!userId) return;
    const { data } = await supabase.from("users").select("is_premium").eq("id_user", await userId).single();
    setIsPremium(data?.is_premium ?? false);
  }

  async function loadMoreUsers() {
    if (!hasMore) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;

      const { data: res, error } = await supabase.rpc("get_swipe_users", {
        p_user_id: userId,
        p_limit: 10,
        p_offset: offset,
      });

      if (error || !res || res.length === 0) {
        setHasMore(false);
      } else {
        setCards((prev) => [...prev, ...res]);
        setOffset((prev) => prev + res.length);
      }
    } catch {
      showToast("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }

  async function onLike(userId: string) {
    const supabase = createClient();
    const currentUserId = (await supabase.auth.getUser()).data.user?.id;
    if (!currentUserId) return;

    try {
      // Check duplicate
      const { data: existing } = await supabase.from("user_likes").select("id_like").eq("id_user_from", currentUserId).eq("id_user_to", userId).maybeSingle();
      if (existing) {
        showToast("Ya has dado like a este usuario");
        return;
      }

      // Check limit
      if (!isPremium) {
        const canSwipe = await supabase.rpc("check_and_add_swipe", { p_user_id: currentUserId });
        if (!canSwipe) {
          showToast("Likes agotados. Vuélvete premium o espera hasta mañana");
          return;
        }
      }

      // Insert like
      await supabase.from("user_likes").insert({ id_user_from: currentUserId, id_user_to: userId });
    } catch {
      showToast("Error al dar like");
    }
  }

  function handleSwipe(direction: "left" | "right") {
    if (cards.length === 0) return;
    const swipedUserId = cards[0].id_user;

    // Animate out
    const card = topCardRef.current;
    if (card) {
      card.style.transition = "transform 0.3s ease, opacity 0.3s ease";
      card.style.transform = `translateX(${direction === "right" ? 400 : -400}px) rotate(${direction === "right" ? 30 : -30}deg)`;
      card.style.opacity = "0";
    }

    setTimeout(() => {
      if (direction === "right") onLike(swipedUserId);
      setCards((prev) => prev.slice(1));
      if (cards.length <= 3 && hasMore) loadMoreUsers();
    }, 300);
  }

  // Drag logic
  function handlePointerDown(e: React.PointerEvent) {
    e.preventDefault();
    dragStateRef.current = { startX: e.clientX, startY: e.clientY, isDragging: true, offsetX: 0, offsetY: 0 };
    if (topCardRef.current) {
      topCardRef.current.style.transition = "none";
      (topCardRef.current as any).setPointerCapture(e.pointerId);
    }
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragStateRef.current.isDragging) return;
    const dx = e.clientX - dragStateRef.current.startX;
    const dy = e.clientY - dragStateRef.current.startY;
    dragStateRef.current.offsetX = dx;
    dragStateRef.current.offsetY = dy;
    if (topCardRef.current) {
      const rot = dx * 0.1;
      topCardRef.current.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
    }
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!dragStateRef.current.isDragging) return;
    dragStateRef.current.isDragging = false;
    const dx = dragStateRef.current.offsetX;

    if (Math.abs(dx) > 120) {
      handleSwipe(dx > 0 ? "right" : "left");
    } else {
      // Snap back
      if (topCardRef.current) {
        topCardRef.current.style.transition = "transform 0.3s ease";
        topCardRef.current.style.transform = "translate(0, 0) rotate(0deg)";
      }
    }
  }

  if (loading && cards.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: "#fff" }}>
        <div style={{ width: 40, height: 40, border: "4px solid var(--clr-grey-300)", borderTop: "4px solid var(--clr-pink)", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!loading && cards.length === 0 && !hasMore) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: "#fff", padding: 20 }}>
        <p style={{ fontSize: 18, color: "var(--clr-grey-600)" }}>Ya no hay más perfiles 😢</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#fff" }}>
      {/* Header */}
      <div style={{ background: "var(--clr-red-900)", padding: "env(safe-area-inset-top, 12px) 0 12px", display: "flex", justifyContent: "center" }}>
        <Image src="/logo_tindertec.png" alt="ConectaTec" width={80} height={80} style={{ objectFit: "contain" }} />
      </div>

      {/* Card stack */}
      <div style={{ flex: 1, position: "relative", padding: 24, paddingBottom: 100 }}>
        {cards.slice(0, 3).map((card, i) => {
          const isTop = i === 0;
          const zIndex = 10 - i;
          const scale = 1 - i * 0.05;
          const translateY = i * 10;

          return (
            <div
              key={card.id_user}
              ref={isTop ? topCardRef : null}
              onPointerDown={isTop ? handlePointerDown : undefined}
              onPointerMove={isTop ? handlePointerMove : undefined}
              onPointerUp={isTop ? handlePointerUp : undefined}
              onPointerCancel={isTop ? handlePointerUp : undefined}
              onClick={isTop ? () => router.push(`/home/user-detail/${card.id_user}?source=swiper`) : undefined}
              style={{
                position: "absolute",
                inset: 0,
                zIndex,
                transform: `scale(${scale}) translateY(${translateY}px)`,
                transformOrigin: "center top",
                touchAction: "none",
                cursor: isTop ? "grab" : "default",
                pointerEvents: isTop ? "auto" : "none",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 20,
                  overflow: "hidden",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  background: "var(--clr-grey-300)",
                  position: "relative",
                }}
              >
                {card.photo_url && <Image src={card.photo_url} alt={card.name} fill style={{ objectFit: "cover" }} />}
                {/* Gradient overlay */}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent 50%)" }} />
                {/* Info */}
                <div style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
                  <h2 style={{ color: "#fff", fontSize: 26, fontWeight: 700, margin: 0, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
                    {card.name}, {card.age}
                  </h2>
                  {card.degree_name && (
                    <p style={{ color: "#fff", fontSize: 18, margin: "4px 0 0", fontWeight: 500, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
                      {card.degree_name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Button row */}
      <div style={{ padding: "0 40px 16px", display: "flex", gap: 24, justifyContent: "center" }}>
        {isPremium && (
          <button
            onClick={() => {
              /* TODO: undo logic */
              showToast("Función de retroceder próximamente");
            }}
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              border: "none",
              background: "var(--clr-grey-300)",
              color: "var(--clr-grey-700)",
              fontSize: 24,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            ⮐
          </button>
        )}
        <button
          onClick={() => handleSwipe("left")}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "none",
            background: "var(--clr-grey-300)",
            color: "var(--clr-grey-700)",
            fontSize: 28,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          ✕
        </button>
        <button
          onClick={() => handleSwipe("right")}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "none",
            background: "var(--clr-pink)",
            color: "#fff",
            fontSize: 28,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(255,107,107,0.3)",
          }}
        >
          ❤
        </button>
      </div>
    </div>
  );
}
