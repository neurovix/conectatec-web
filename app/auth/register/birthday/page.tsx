"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRegister } from "@/utils/registerContext";

/* ── helpers ── */
const DAYS   = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const curYear = new Date().getFullYear();
const YEARS  = Array.from({ length: 60 }, (_, i) => curYear - i);

function calcAge(y: number, m: number, d: number): number {
  const today = new Date();
  let age = today.getFullYear() - y;
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age--;
  return age;
}

/* ── Scroll‑snap picker column ── */
function PickerCol({ items, onSelect }: { items: number[]; onSelect: (v: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const ITEM_H = 40;

  // Snap on scroll-end / touch-end
  const snap = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / ITEM_H);
    el.scrollTo({ top: idx * ITEM_H, behavior: "smooth" });
    onSelect(items[Math.min(idx, items.length - 1)]);
  }, [items, onSelect]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scrollend", snap);
    el.addEventListener("scroll", snap); // fallback for browsers without scrollend
    return () => { el.removeEventListener("scrollend", snap); el.removeEventListener("scroll", snap); };
  }, [snap]);

  return (
    <div style={{ flex: 1, position: "relative", overflow: "hidden", height: 150 }}>
      {/* highlight bar */}
      <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: ITEM_H, transform: "translateY(-50%)", borderTop: "2px solid var(--clr-grey-300)", borderBottom: "2px solid var(--clr-grey-300)", pointerEvents: "none", zIndex: 1 }} />

      <div
        ref={ref}
        style={{ height: "100%", overflowY: "scroll", scrollSnapType: "y mandatory", WebkitOverflowScrolling: "touch", paddingTop: 55, paddingBottom: 55 }}
      >
        {items.map((v) => (
          <div key={v} style={{ height: ITEM_H, scrollSnapAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 500, color: "var(--clr-black)" }}>
            {String(v).padStart(2, "0")}
          </div>
        ))}
      </div>

      {/* hide scrollbar via <style> */}
      <style>{`div::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}

export default function BirthdayPage() {
  const router  = useRouter();
  const { setData } = useRegister();

  const [day,   setDay]   = useState(1);
  const [month, setMonth] = useState(1);
  const [year,  setYear]  = useState(curYear);

  const age = calcAge(year, month, day);
  const ok  = age >= 18;

  return (
    <div className="mobile-shell" style={{ background: "#fff" }}>
      <div className="scroll-body" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <button className="back-btn" onClick={() => router.back()} style={{ alignSelf: "flex-start" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>

        <h1 style={{ fontSize: 26, fontWeight: 600, margin: "40px 0", textAlign: "center" }}>¿Tu cumpleaños?</h1>

        {/* Picker row */}
        <div style={{ display: "flex", alignItems: "center", width: "100%", height: 150 }}>
          <PickerCol items={DAYS}   onSelect={setDay} />
          <span style={{ fontSize: 26, padding: "0 4px", fontWeight: 600 }}>/</span>
          <PickerCol items={MONTHS} onSelect={setMonth} />
          <span style={{ fontSize: 26, padding: "0 4px", fontWeight: 600 }}>/</span>
          <PickerCol items={YEARS}  onSelect={setYear} />
        </div>

        <p style={{ fontSize: 13, marginTop: 20, textAlign: "center", color: "var(--clr-black)" }}>
          Tu perfil muestra tu edad, no tu fecha de nacimiento
        </p>
        {!ok && <p style={{ fontSize: 13, color: "red", fontWeight: 600, margin: "10px 0 0", textAlign: "center" }}>Debes ser mayor de 18 años</p>}
      </div>

      <div className="bottom-bar">
        <button
          className={`btn-primary ${ok ? "btn-black" : "btn-grey"}`}
          disabled={!ok}
          onClick={() => {
            setData((p) => ({ ...p, age }));
            router.push("/auth/register/degree");
          }}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
