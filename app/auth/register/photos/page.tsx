"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useRegister } from "@/utils/registerContext";

const MAX_PHOTOS = 6;

/**
 * Compress an image File via an off-screen canvas.
 * Mirrors Flutter's flutter_image_compress (quality 60, max 1080px wide).
 */
async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 1080;
        const scale = img.width > maxW ? maxW / img.width : 1;
        const w = Math.round(img.width  * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width  = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject("compress failed");
            resolve(new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }));
          },
          "image/jpeg",
          0.6 // quality 60 %
        );
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PhotosPage() {
  const router  = useRouter();
  const { setData } = useRegister();

  // Array of 6 slots: null = empty, otherwise { file, preview }
  const [slots, setSlots] = useState<({ file: File; preview: string } | null)[]>(Array(MAX_PHOTOS).fill(null));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeSlotRef = useRef<number>(0);

  const photoCount = slots.filter(Boolean).length;

  const openPicker = (index: number) => {
    activeSlotRef.current = index;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ""; // reset so same file can be re-picked

    const compressed = await compressImage(file);
    const preview = URL.createObjectURL(compressed);

    setSlots((prev) => {
      const next = [...prev];
      next[activeSlotRef.current] = { file: compressed, preview };
      return next;
    });
  };

  const handleNext = () => {
    const files   = slots.filter(Boolean)!.map((s) => s!.file);
    const previews = slots.filter(Boolean)!.map((s) => s!.preview);
    setData((p) => ({ ...p, photos: files, photoPreviewUrls: previews }));
    router.push("/auth/register/instagram");
  };

  return (
    <div className="mobile-shell" style={{ background: "#fff", paddingBottom: 50 }}>
      <div className="scroll-body">
        <button className="back-btn" onClick={() => router.back()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>

        <h1 style={{ fontSize: 26, fontWeight: 600, margin: "30px 0 10px" }}>Agrega tus fotos</h1>
        <p style={{ fontSize: 15, margin: "0 0 15px", color: "var(--clr-black)" }}>Elige bien tus fotos, no podrás cambiarlas después</p>
        <p style={{ fontSize: 15, margin: "0 0 25px", fontWeight: 800, color: "var(--clr-black)" }}>
          La primera foto será tu foto principal, la que aparecerá en las cartas a los demás usuarios
        </p>

        {/* Photo grid */}
        <div className="photo-grid">
          {slots.map((slot, i) => (
            <button key={i} className="photo-slot" onClick={() => openPicker(i)}>
              {slot ? (
                <img src={slot.preview} alt={`foto ${i + 1}`} />
              ) : (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,.54)" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              )}
            </button>
          ))}
        </div>

        {/* Counter circle */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 30 }}>
          <div style={{ width: 70, height: 70, borderRadius: "50%", background: "var(--clr-grey-300)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 500 }}>
            {photoCount}/{MAX_PHOTOS}
          </div>
        </div>
      </div>

      {/* Hidden native file input */}
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />

      <div className="bottom-bar">
        <button
          className={`btn-primary ${photoCount > 0 ? "btn-black" : "btn-grey"}`}
          disabled={photoCount === 0}
          onClick={handleNext}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
