"use client";

import { useEffect, useState } from "react";

// Android Chrome / Edge / Samsung Internet'in 'beforeinstallprompt' eventini yakalar.
// iOS Safari bu eventi tetiklemez — orada manuel "Paylaş → Ana Ekrana Ekle" gerekir.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "istbam:install-dismissed-at";
const DISMISS_TTL_DAYS = 14;

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  // iOS Safari ile Android Chrome'un farklı bayrakları var
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function InstallAppCard() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }
    // Önceden kapatıldıysa 14 gün gösterme
    try {
      const raw = localStorage.getItem(DISMISS_KEY);
      if (raw) {
        const at = Number(raw);
        if (Date.now() - at < DISMISS_TTL_DAYS * 86400 * 1000) {
          setDismissed(true);
          return;
        }
      }
    } catch {}

    function onPrompt(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setInstalled(true);
      setDeferred(null);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || dismissed) return null;

  async function install() {
    if (!deferred) {
      // iOS veya prompt henüz hazır değil — iOS yardımını göster
      setShowIosHelp(true);
      return;
    }
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setDeferred(null);
    } catch {
      /* user iptal etti */
    }
  }

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setDismissed(true);
  }

  const ios = isIOS();

  return (
    <section className="animate-fade-in-up rounded-card border border-vapur/30 bg-gradient-to-br from-bogaz-deep to-bogaz-deep/80 text-sis overflow-hidden relative">
      <button
        onClick={dismiss}
        aria-label="Kapat"
        className="absolute top-2 right-2 size-7 rounded-full bg-sis/10 hover:bg-sis/20 text-sis text-sm font-bold flex items-center justify-center"
      >
        ✕
      </button>

      <div className="px-5 pt-4 pb-4">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-vapur font-bold">
          <span className="inline-block size-1.5 rounded-full bg-vapur animate-pulse" />
          Telefonuna ekle
        </div>
        <h2 className="mt-1 font-display text-xl font-semibold leading-tight">
          İstbam'ı uygulama gibi kullan
        </h2>
        <p className="text-xs text-sis/70 mt-1.5 leading-relaxed">
          Ana ekrana eklediğinde tarayıcı çubuğu olmadan, tam ekran açılır.
          Çevrimdışı temel sayfalar yüklenmeye devam eder, simgesi telefonunda
          ayrı bir uygulama gibi durur.
        </p>

        {!showIosHelp ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={install}
              className="rounded-full bg-vapur text-bogaz-deep font-semibold text-sm px-4 py-2 hover:bg-vapur-soft transition inline-flex items-center gap-1.5"
            >
              📲 {ios ? "iOS'a ekle" : "Uygulama olarak yükle"}
            </button>
            {!ios && !deferred && (
              <span className="self-center text-[11px] text-sis/55">
                Chrome menüsü → "Uygulamayı yükle" de aynı işi yapar
              </span>
            )}
          </div>
        ) : (
          <div className="mt-4 rounded-lg bg-sis/8 ring-1 ring-sis/15 px-3 py-2.5 text-[13px] leading-relaxed">
            <div className="font-semibold mb-1.5 text-vapur">
              iPhone'da nasıl eklenir
            </div>
            <ol className="space-y-1 list-decimal pl-4 text-sis/85">
              <li>Sayfayı Safari'de aç (Chrome'da çalışmaz)</li>
              <li>
                Altta <span className="font-mono">⬆️</span> paylaş tuşuna dokun
              </li>
              <li>
                Listede <span className="font-semibold">"Ana Ekrana Ekle"</span>
              </li>
              <li>Sağ üstte "Ekle" — bitti</li>
            </ol>
            <button
              onClick={() => setShowIosHelp(false)}
              className="mt-2 text-[11px] font-semibold text-vapur hover:text-vapur-soft"
            >
              ← Geri
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
