"use client";

import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";

type Variant = "light-bar" | "dark-bar";

export function ThemeToggle({ variant = "light-bar" }: { variant?: Variant }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  const ring =
    variant === "light-bar"
      ? "ring-sis/25 text-sis/85 hover:bg-sis/10"
      : "ring-on/15 text-on hover:bg-chip";

  if (!mounted) {
    return (
      <span
        aria-hidden
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${ring}`}
      >
        <span className="opacity-50">·</span>
      </span>
    );
  }

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${ring}`}
      title={isDark ? "Gündüz moduna geç" : "Gece moduna geç"}
      aria-label="Tema değiştir"
    >
      <span className="text-sm leading-none">{isDark ? "☀" : "☾"}</span>
      <span className="hidden sm:inline">{isDark ? "Gündüz" : "Gece"}</span>
    </button>
  );
}
