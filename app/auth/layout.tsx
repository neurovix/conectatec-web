"use client";
import { RegisterProvider } from "@/utils/registerContext";

/**
 * Shared layout for every page under /auth/*
 * Wraps children in RegisterProvider so all registration
 * steps share the same in-memory form state.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <RegisterProvider>{children}</RegisterProvider>;
}
