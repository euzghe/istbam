"use client";

import { useEffect, useRef, useState } from "react";
import { usePanel } from "./PanelContext";

const STORE = "istbam:voice";

// Anons eşikleri (m). Yakından uzağa.
const THRESHOLDS = [50, 200, 500, 1000];

type StepKey = string;

export function VoiceNavigation() {
  const { nextManeuver, route } = usePanel();
  const [enabled, setEnabled] = useState(true);
  const [supported, setSupported] = useState(false);

  // Hangi step için hangi eşik anons edilmiş — tekrarı önlemek için
  const announcedRef = useRef<Map<StepKey, Set<number>>>(new Map());
  const lastSpokenAtRef = useRef<number>(0);

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" && "speechSynthesis" in window
    );
    try {
      const raw = localStorage.getItem(STORE);
      if (raw === "0") setEnabled(false);
    } catch {}
  }, []);

  // Hedef temizlenirse anons hafızasını sıfırla
  useEffect(() => {
    if (!route) {
      announcedRef.current.clear();
    }
  }, [route]);

  useEffect(() => {
    if (!enabled || !supported || !nextManeuver) return;

    const [mlng, mlat] = nextManeuver.step.maneuver.location;
    const stepKey: StepKey = `${mlng.toFixed(5)},${mlat.toFixed(5)}`;
    const dist = nextManeuver.distM;

    // Bu step için hangi eşikler geçildi
    const seen = announcedRef.current.get(stepKey) ?? new Set<number>();

    // Geçilen ama henüz anons edilmemiş eşik var mı?
    let toAnnounce: number | null = null;
    for (const th of THRESHOLDS) {
      if (dist <= th && !seen.has(th)) {
        toAnnounce = th;
        break;
      }
    }

    if (toAnnounce == null) return;

    // Spam koruması — son anonstan 5 sn geçmemişse atla
    const now = Date.now();
    if (now - lastSpokenAtRef.current < 5000) return;

    seen.add(toAnnounce);
    announcedRef.current.set(stepKey, seen);
    lastSpokenAtRef.current = now;

    const arrow = nextManeuver.step.maneuver.instruction;
    const distText =
      toAnnounce >= 1000
        ? `Bir kilometre`
        : toAnnounce === 500
        ? `Beş yüz metre`
        : toAnnounce === 200
        ? `İki yüz metre`
        : `Elli metre`;

    const text =
      toAnnounce === 50
        ? `Şimdi ${arrow.toLowerCase()}`
        : `${distText} sonra ${arrow.toLowerCase()}`;

    speak(text);
  }, [nextManeuver, enabled, supported]);

  function speak(text: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "tr-TR";
      u.rate = 1.05;
      u.volume = 1;
      window.speechSynthesis.speak(u);
    } catch {}
  }

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    try {
      localStorage.setItem(STORE, next ? "1" : "0");
    } catch {}
    if (next) speak("Sesli yönlendirme açıldı");
    else window.speechSynthesis?.cancel();
  }

  if (!supported) return null;

  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
        enabled
          ? "bg-vapur text-bogaz-deep ring-vapur"
          : "ring-sis/25 text-sis/85 hover:bg-sis/10"
      }`}
      title={enabled ? "Sesli yönlendirmeyi kapat" : "Sesli yönlendirmeyi aç"}
      aria-label="Sesli yönlendirme"
    >
      <span className="text-sm leading-none">{enabled ? "🔊" : "🔇"}</span>
      <span className="hidden md:inline">{enabled ? "Sesli" : "Sessiz"}</span>
    </button>
  );
}
