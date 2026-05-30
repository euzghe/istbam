"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";
type Pref = Theme | "system";

type Ctx = {
  theme: Pref;
  resolvedTheme: Theme;
  setTheme: (t: Pref) => void;
};

const Context = createContext<Ctx | null>(null);
const STORE_KEY = "istbam:theme";

function systemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function apply(t: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", t === "dark");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [pref, setPref] = useState<Pref>("system");
  const [resolved, setResolved] = useState<Theme>("light");

  useEffect(() => {
    let saved: Pref = "system";
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw === "light" || raw === "dark") saved = raw;
    } catch {}

    setPref(saved);
    const sys = systemTheme();
    const next: Theme = saved === "system" ? sys : saved;
    setResolved(next);
    apply(next);

    // Sistem teması değişirse "system" modunda otomatik takip et
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      // Sadece kullanıcı override etmediğinde
      const cur = localStorage.getItem(STORE_KEY);
      if (cur === "light" || cur === "dark") return;
      const t: Theme = e.matches ? "dark" : "light";
      setResolved(t);
      apply(t);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const setTheme = (t: Pref) => {
    try {
      if (t === "system") localStorage.removeItem(STORE_KEY);
      else localStorage.setItem(STORE_KEY, t);
    } catch {}
    setPref(t);
    const next: Theme = t === "system" ? systemTheme() : t;
    setResolved(next);
    apply(next);
  };

  return (
    <Context.Provider value={{ theme: pref, resolvedTheme: resolved, setTheme }}>
      {children}
    </Context.Provider>
  );
}

export function useTheme(): Ctx {
  const ctx = useContext(Context);
  if (ctx) return ctx;
  return {
    theme: "system",
    resolvedTheme: "light",
    setTheme: () => {},
  };
}
