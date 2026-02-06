"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRegister } from "@/utils/registerContext";

/* ── Helpers ── */
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const curYear = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => curYear - i);

function calcAge(y: number, m: number, d: number): number {
  const today = new Date();
  let age = today.getFullYear() - y;
  const mDiff = today.getMonth() + 1 - m;
  if (mDiff < 0 || (mDiff === 0 && today.getDate() < d)) age--;
  return age;
}

/* ── Scroll‑snap picker column ── */
function PickerCol({ 
  items, 
  value, 
  onSelect 
}: { 
  items: number[]; 
  value: number; 
  onSelect: (v: number) => void 
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const ITEM_HEIGHT = 48; // h-12 in Tailwind

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const scrollTop = scrollRef.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const selectedValue = items[index];
    
    if (selectedValue !== undefined && selectedValue !== value) {
      onSelect(selectedValue);
    }
  }, [items, onSelect, value]);

  return (
    <div className="relative flex-1 h-[144px] overflow-hidden group">
      {/* Selection Overlay (Highlight Bar) */}
      <div className="absolute top-1/2 left-0 right-0 h-12 -translate-y-1/2 border-y border-gray-200 pointer-events-none z-10" />
      
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide py-[48px]"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((v) => (
          <div
            key={v}
            className={`h-12 flex items-center justify-center text-xl font-medium snap-center transition-colors ${
              value === v ? "text-black scale-110" : "text-gray-300"
            }`}
          >
            {String(v).padStart(2, "0")}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BirthdayPage() {
  const router = useRouter();
  const { setData } = useRegister();

  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(curYear - 18); // Default to 18 for UX

  const age = calcAge(year, month, day);
  const isAdult = age >= 18;

  const handleNext = () => {
    if (!isAdult) return;
    setData((prev: any) => ({ ...prev, age }));
    router.push("/auth/register/degree");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      {/* Header */}
      <div className="p-4">
        <button 
          onClick={() => router.back()} 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex flex-col items-center px-6 pt-10">
        <h1 className="text-3xl font-bold mb-10">¿Tu cumpleaños?</h1>

        {/* Picker Container */}
        <div className="flex items-center w-full max-w-xs mx-auto">
          <PickerCol items={DAYS} value={day} onSelect={setDay} />
          <span className="text-2xl font-bold text-gray-400 px-2">/</span>
          <PickerCol items={MONTHS} value={month} onSelect={setMonth} />
          <span className="text-2xl font-bold text-gray-400 px-2">/</span>
          <PickerCol items={YEARS} value={year} onSelect={setYear} />
        </div>

        <div className="mt-8 text-center space-y-2">
          <p className="text-sm text-gray-500">
            Tu perfil muestra tu edad, no tu fecha de nacimiento.
          </p>
          {!isAdult && (
            <p className="text-sm font-semibold text-red-500 animate-pulse">
              Debes ser mayor de 18 años
            </p>
          )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="p-6 border-t border-gray-100">
        <button
          onClick={handleNext}
          disabled={!isAdult}
          className={`w-full py-4 rounded-full text-lg font-bold transition-all ${
            isAdult 
              ? "bg-black text-white active:scale-[0.98]" 
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Siguiente
        </button>
      </div>

      {/* Global CSS for hiding scrollbars if not using a plugin */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}