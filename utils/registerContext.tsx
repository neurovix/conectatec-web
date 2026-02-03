"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

/* ── Shape ── */
export interface RegisterData {
  name?: string;
  email?: string;
  password?: string;
  age?: number;
  description?: string;
  instagramUser?: string;
  gender?: string;
  degree?: string;
  customDegree?: string;
  lookingFor?: string;
  interest?: string;
  habits?: string[];
  photos?: File[];          // raw File objects picked by the user
  photoPreviewUrls?: string[]; // objectURL previews for the grid
}

interface RegCtx {
  data: RegisterData;
  setData: (fn: (prev: RegisterData) => RegisterData) => void;
  reset: () => void;
}

const Ctx = createContext<RegCtx>({
  data: {},
  setData: () => {},
  reset: () => {},
});

export function RegisterProvider({ children }: { children: ReactNode }) {
  const [data, setRaw] = useState<RegisterData>({});

  const setData = (fn: (prev: RegisterData) => RegisterData) =>
    setRaw((prev) => fn(prev));

  const reset = () => setRaw({});

  return (
    <Ctx.Provider value={{ data, setData, reset }}>
      {children}
    </Ctx.Provider>
  );
}

export function useRegister() {
  return useContext(Ctx);
}
