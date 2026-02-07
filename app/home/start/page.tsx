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

  const topCardRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef({ startX: 0, startY: 0, isDragging: false, offsetX: 0, offsetY: 0 });

  // header height used to calc remaining area
  const HEADER_HEIGHT = 64;

  useEffect(() => {
    checkAuthAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return;
    const { data } = await supabase.from("users").select("is_premium").eq("id_user", userId).single();
    setIsPremium(data?.is_premium ?? false);
  }

  async function loadMoreUsers() {
    if (!hasMore) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;

      const res = await supabase.rpc("get_swipe_users", {
        p_user_id: userId,
        p_limit: 10,
        p_offset: offset,
      });

      // supabase rpc usually returns res.data
      if (!res || !res.data || (Array.isArray(res.data) && res.data.length === 0)) {
        setHasMore(false);
      } else {
        setCards((prev) => [...prev, ...(res.data as UserCard[])]);
        setOffset((prev) => prev + (Array.isArray(res.data) ? res.data.length : 0));
      }
    } catch (err) {
      console.error(err);
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
      const { data: existing } = await supabase
        .from("user_likes")
        .select("id_like")
        .eq("id_user_from", currentUserId)
        .eq("id_user_to", userId)
        .maybeSingle();
      if (existing) {
        showToast("Ya has dado like a este usuario");
        return;
      }

      if (!isPremium) {
        const canSwipeRes = await supabase.rpc("check_and_add_swipe", { p_user_id: currentUserId });
        // depending on your RPC response, check the boolean properly:
        const canSwipe = canSwipeRes?.data ?? false;
        if (!canSwipe) {
          showToast("Likes agotados. Vuélvete premium o espera hasta mañana");
          return;
        }
      }

      await supabase.from("user_likes").insert({ id_user_from: currentUserId, id_user_to: userId });
    } catch (err) {
      console.error(err);
      showToast("Error al dar like");
    }
  }

  function handleSwipe(direction: "left" | "right") {
    if (cards.length === 0) return;
    const swipedUserId = cards[0].id_user;

    const card = topCardRef.current;
    if (card) {
      card.style.transition = "transform 0.35s ease, opacity 0.35s ease";
      card.style.transform = `translateX(${direction === "right" ? 400 : -400}px) rotate(${direction === "right" ? 30 : -30}deg)`;
      card.style.opacity = "0";
      card.style.pointerEvents = "none";
    }

    setTimeout(() => {
      if (direction === "right") onLike(swipedUserId);
      setCards((prev) => prev.slice(1));
      if (cards.length <= 3 && hasMore) loadMoreUsers();
    }, 360);
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    dragStateRef.current = { startX: e.clientX, startY: e.clientY, isDragging: true, offsetX: 0, offsetY: 0 };
    if (topCardRef.current) {
      topCardRef.current.style.transition = "none";
    }
    try {
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    } catch (err) {
      // ignore if not supported
    }
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragStateRef.current.isDragging) return;
    const dx = e.clientX - dragStateRef.current.startX;
    const dy = e.clientY - dragStateRef.current.startY;
    dragStateRef.current.offsetX = dx;
    dragStateRef.current.offsetY = dy;
    if (topCardRef.current) {
      const rot = dx * 0.08;
      topCardRef.current.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
    }
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragStateRef.current.isDragging) return;
    dragStateRef.current.isDragging = false;
    const dx = dragStateRef.current.offsetX;

    try {
      (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
    } catch (err) {
      // ignore
    }

    if (Math.abs(dx) > 120) {
      handleSwipe(dx > 0 ? "right" : "left");
    } else {
      if (topCardRef.current) {
        topCardRef.current.style.transition = "transform 0.25s cubic-bezier(.2,.8,.2,1)";
        topCardRef.current.style.transform = "translate(0, 0) rotate(0deg)";
      }
    }
  }

  if (loading && cards.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#fff" }}>
        <div style={{ width: 40, height: 40, border: "4px solid var(--clr-grey-300)", borderTop: "4px solid var(--clr-pink)", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!loading && cards.length === 0 && !hasMore) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#fff" }}>
        <div style={{ background: "var(--clr-red-900)", padding: `env(safe-area-inset-top, 12px) 0 12px`, display: "flex", justifyContent: "center" }}>
          <Image src="/logo_tindertec.png" alt="ConectaTec" width={80} height={80} style={{ objectFit: "contain" }} />
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <p style={{ fontSize: 18, color: "var(--clr-grey-600)" }}>Ya no hay más perfiles 😢</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh", // important para mobile
        width: "100%",
        background: "#fff",
        position: "relative",
        overflow: "hidden",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* Header (overlayed in flow) */}
      <div
        style={{
          height: HEADER_HEIGHT,
          minHeight: HEADER_HEIGHT,
          background: "var(--clr-red-900)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "env(safe-area-inset-top, 0px)",
          zIndex: 30,
        }}
      >
        <Image src="/logo_tindertec.png" alt="ConectaTec" width={64} height={64} style={{ objectFit: "contain" }} />
      </div>

      {/* Main area (remaining height) */}
      <div
        style={{
          height: `calc(100vh - ${HEADER_HEIGHT}px)`,
          display: "flex",
          flexDirection: "column",
          padding: "12px 16px",
          boxSizing: "border-box",
        }}
      >
        {/* Swiper area = 90% of this main area */}
        <div
          style={{
            flex: 9, // 90%
            position: "relative",
            marginBottom: 8,
            minHeight: 0, // allows children to scroll if needed
          }}
        >
          <div style={{ position: "absolute", inset: 0 }}>
            {cards.slice(0, 3).length === 0 && !loading ? (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ color: "var(--clr-grey-600)" }}>No hay perfiles nuevos</p>
              </div>
            ) : (
              cards.slice(0, 3).map((card, i) => {
                const isTop = i === 0;
                const zIndex = 10 - i;
                const scale = 1 - i * 0.04;
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
                      display: "flex",
                      alignItems: "stretch",
                      justifyContent: "center",
                      padding: 0,
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 20,
                        overflow: "hidden",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
                        background: "var(--clr-grey-300)",
                        position: "relative",
                      }}
                    >
                      {card.photo_url ? (
                        <Image src={card.photo_url} alt={card.name} fill style={{ objectFit: "cover" }} priority={i === 0} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: "linear-gradient(180deg,#eee,#ddd)" }} />
                      )}

                      {/* Gradient overlay */}
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent 45%)" }} />

                      {/* Info */}
                      <div style={{ position: "absolute", bottom: 18, left: 16, right: 16 }}>
                        <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 700, margin: 0, textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
                          {card.name}, {card.age}
                        </h2>
                        {card.degree_name && (
                          <p style={{ color: "#fff", fontSize: 16, margin: "6px 0 0", fontWeight: 500, textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
                            {card.degree_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Button row = 10% of main area */}
        <div
          style={{
            flex: 1, // 10%
            display: "flex",
            gap: 18,
            justifyContent: "center",
            alignItems: "center",
            background: "#fff",
            paddingBottom: "env(safe-area-inset-bottom, 8px)",
            boxSizing: "border-box",
          }}
        >
          {isPremium && (
            <button
              onClick={() => showToast("Función de retroceder próximamente")}
              aria-label="Retroceder"
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                border: "none",
                background: "#fff",
                color: "var(--clr-grey-700)",
                fontSize: 20,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
                flexShrink: 0,
              }}
            >
              ↶
            </button>
          )}
          <button
            onClick={() => handleSwipe("left")}
            aria-label="No"
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              border: "none",
              background: "#fff",
              color: "var(--clr-grey-700)",
              fontSize: 28,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
          <button
            onClick={() => handleSwipe("right")}
            aria-label="Like"
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              border: "none",
              background: "var(--clr-pink)",
              color: "#fff",
              fontSize: 28,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 20px rgba(233,30,99,0.28)",
              flexShrink: 0,
            }}
          >
            ❤
          </button>
        </div>
      </div>
    </div>
  );
}
