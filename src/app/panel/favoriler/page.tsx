"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/panel/sections/PageHeader";
import { usePanel } from "@/components/panel/PanelContext";
import {
  addOrUpdate,
  loadFavorites,
  newId,
  remove,
  type Favorite,
} from "@/lib/favorites";

export default function Page() {
  const { live, destination } = usePanel();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [adding, setAdding] = useState<null | "ev" | "is" | "ozel">(null);
  const [draftLabel, setDraftLabel] = useState("");
  const [draftEmoji, setDraftEmoji] = useState("⭐");

  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  function startAdd(kind: "ev" | "is" | "ozel") {
    setAdding(kind);
    setDraftLabel(
      destination?.label ?? (kind === "ev" ? "Evim" : kind === "is" ? "İş" : "")
    );
  }

  function save() {
    if (!adding) return;
    const src = destination ?? live;
    if (!src) {
      alert("Önce konum aç veya bir hedef seç.");
      return;
    }
    const fav: Favorite = {
      id: newId(),
      kind: adding,
      label: draftLabel.trim() || (adding === "ev" ? "Ev" : adding === "is" ? "İş" : "Favori"),
      lng: src.lng,
      lat: src.lat,
      emoji: adding === "ozel" ? draftEmoji : undefined,
      savedAt: Date.now(),
    };
    setFavorites(addOrUpdate(fav));
    setAdding(null);
    setDraftLabel("");
  }

  function del(id: string) {
    setFavorites(remove(id));
  }

  const ev = favorites.find((f) => f.kind === "ev");
  const is = favorites.find((f) => f.kind === "is");
  const ozel = favorites.filter((f) => f.kind === "ozel");

  return (
    <>
      <PageHeader
        icon="⭐"
        eyebrow="Yerel hafıza"
        title="Favoriler"
        description="Ev, iş ve sık gittiğin yerler — tek tıkla yönlendirme. localStorage'da, sunucuya gitmez."
        accent="vapur"
      />

      <div className="animate-fade-in-up delay-1 space-y-3">
        {/* Ev */}
        <FavSlot
          icon="🏠"
          title="Ev"
          fav={ev}
          onAdd={() => startAdd("ev")}
          onDel={(id) => del(id)}
        />

        {/* İş */}
        <FavSlot
          icon="💼"
          title="İş"
          fav={is}
          onAdd={() => startAdd("is")}
          onDel={(id) => del(id)}
        />

        {/* Özel favoriler */}
        <section className="rounded-2xl bg-card/70 backdrop-blur ring-1 ring-line shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-semibold text-on">
              Diğer favoriler
            </h2>
            <button
              onClick={() => startAdd("ozel")}
              className="rounded-full bg-vapur text-bogaz-deep font-semibold text-xs px-3 py-1.5 hover:bg-vapur-soft transition"
            >
              + Ekle
            </button>
          </div>

          {ozel.length === 0 ? (
            <p className="text-sm text-on-mute">
              Sık gittiğin yerleri ekle. Mevcut hedefini ya da canlı konumunu kaydeder.
            </p>
          ) : (
            <ul className="space-y-2">
              {ozel.map((f) => (
                <li
                  key={f.id}
                  className="rounded-xl bg-card ring-1 ring-line px-3 py-2 flex items-center gap-3"
                >
                  <span className="text-xl">{f.emoji ?? "⭐"}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-on truncate">
                      {f.label}
                    </div>
                    <div className="text-[10px] text-on-mute font-mono">
                      {f.lat.toFixed(5)}, {f.lng.toFixed(5)}
                    </div>
                  </div>
                  <button
                    onClick={() => del(f.id)}
                    className="text-[11px] text-vapur-red hover:underline"
                  >
                    Sil
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Ekleme form modal'ı (basit inline) */}
        {adding && (
          <section className="rounded-2xl bg-bogaz text-sis ring-1 ring-vapur/40 shadow-xl shadow-bogaz-deep/30 p-4">
            <h3 className="font-display text-lg font-semibold">
              {adding === "ev"
                ? "🏠 Ev kaydet"
                : adding === "is"
                ? "💼 İş kaydet"
                : "⭐ Favori ekle"}
            </h3>
            <p className="text-xs text-sis/70 mt-1">
              {destination
                ? `Mevcut hedef "${destination.label}" kullanılacak.`
                : live
                ? `Şu anki konumun kullanılacak (±${Math.round(live.accuracy)}m).`
                : "Önce hedef seç ya da konum aç."}
            </p>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={draftLabel}
                onChange={(e) => setDraftLabel(e.target.value)}
                placeholder="İsim"
                className="flex-1 rounded-lg bg-sis/10 text-sis ring-1 ring-sis/20 px-3 py-2 text-sm outline-none focus:ring-vapur transition placeholder:text-sis/50"
              />
              {adding === "ozel" && (
                <input
                  type="text"
                  value={draftEmoji}
                  onChange={(e) => setDraftEmoji(e.target.value)}
                  placeholder="⭐"
                  maxLength={2}
                  className="w-14 rounded-lg bg-sis/10 text-sis ring-1 ring-sis/20 px-3 py-2 text-base text-center outline-none focus:ring-vapur transition"
                />
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={save}
                disabled={!live && !destination}
                className="rounded-full bg-vapur text-bogaz-deep font-semibold text-xs px-4 py-2 hover:bg-vapur-soft transition disabled:opacity-40"
              >
                Kaydet
              </button>
              <button
                onClick={() => setAdding(null)}
                className="rounded-full ring-1 ring-sis/25 text-sis/80 text-xs px-4 py-2 hover:bg-sis/10 transition"
              >
                İptal
              </button>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

function FavSlot({
  icon,
  title,
  fav,
  onAdd,
  onDel,
}: {
  icon: string;
  title: string;
  fav?: Favorite;
  onAdd: () => void;
  onDel: (id: string) => void;
}) {
  const { setDestination } = usePanel();
  return (
    <section className="rounded-2xl bg-card/70 backdrop-blur ring-1 ring-line shadow-sm p-4 flex items-center gap-3">
      <span className="text-3xl shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-widest text-on-mute font-bold">
          {title}
        </div>
        {fav ? (
          <>
            <div className="text-base font-semibold text-on truncate">
              {fav.label}
            </div>
            <div className="text-[10px] text-on-mute font-mono">
              {fav.lat.toFixed(5)}, {fav.lng.toFixed(5)}
            </div>
          </>
        ) : (
          <div className="text-sm text-on-mute mt-0.5">
            Henüz kaydedilmedi.
          </div>
        )}
      </div>
      <div className="flex gap-1.5 shrink-0">
        {fav ? (
          <>
            <button
              onClick={() =>
                setDestination({ label: fav.label, lng: fav.lng, lat: fav.lat })
              }
              className="rounded-full bg-vapur text-bogaz-deep font-semibold text-xs px-3 py-1.5 hover:bg-vapur-soft transition"
            >
              ▶ Git
            </button>
            <button
              onClick={onAdd}
              className="rounded-full bg-chip text-on text-xs px-3 py-1.5 hover:bg-line transition"
              title="Konumu değiştir"
            >
              ✎
            </button>
            <button
              onClick={() => onDel(fav.id)}
              className="rounded-full ring-1 ring-vapur-red/30 text-vapur-red text-xs px-2.5 py-1.5 hover:bg-vapur-red/10 transition"
            >
              Sil
            </button>
          </>
        ) : (
          <button
            onClick={onAdd}
            className="rounded-full bg-vapur text-bogaz-deep font-semibold text-xs px-3 py-1.5 hover:bg-vapur-soft transition"
          >
            + Kaydet
          </button>
        )}
      </div>
    </section>
  );
}
