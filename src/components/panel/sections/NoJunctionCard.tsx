"use client";

export function NoJunctionCard({
  hasLive,
  hasDestination,
}: {
  hasLive: boolean;
  hasDestination: boolean;
}) {
  return (
    <section className="rounded-2xl bg-card/70 backdrop-blur ring-1 ring-line shadow-sm px-5 py-5">
      <div className="flex items-start gap-3">
        <div className="size-9 rounded-full bg-cini/15 ring-1 ring-cini/30 flex items-center justify-center text-cini text-lg shrink-0">
          ↑
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-on-mute font-semibold">
            Şerit Rehberi
          </div>
          <h2 className="mt-1 font-display text-lg font-semibold text-on leading-tight">
            {hasLive
              ? "Yakında karar verilecek kavşak yok."
              : hasDestination
              ? "Hedefin civarında kayıtlı kavşak yok."
              : "Önce konumu ya da hedefi belirt."}
          </h2>
          <p className="text-xs text-on-soft mt-1.5 leading-relaxed">
            {hasLive
              ? "1.5 km içine bir kavşak geldiğinde otomatik açılır."
              : "Konumun açılınca yakındaki ilk kavşak burada görünür."}
          </p>
        </div>
      </div>
    </section>
  );
}

export function LocationBanner({
  geoError,
  hasDestination,
}: {
  geoError: string | null;
  hasDestination: boolean;
}) {
  const blocked =
    geoError &&
    (geoError.toLowerCase().includes("denied") ||
      geoError.toLowerCase().includes("permission"));
  return (
    <div className="rounded-card bg-bogaz text-sis ring-1 ring-cini/30 shadow-lg shadow-bogaz-deep/15 px-5 py-4">
      <div className="flex items-start gap-3">
        <div className="size-9 rounded-full bg-cini/20 ring-1 ring-cini/40 flex items-center justify-center text-cini-soft text-lg shrink-0">
          📍
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-semibold">
            {blocked
              ? "Konum izni reddedildi"
              : geoError
              ? "Konuma ulaşılamıyor"
              : "Konum alınıyor…"}
          </h3>
          <p className="text-xs text-sis/75 mt-1 leading-relaxed">
            {blocked
              ? "Tarayıcı ayarlarından İstbam'a konum izni vermen lazım — şerit rehberi ve İSPARK önerileri canlı konumuna göre çalışıyor."
              : hasDestination
              ? "Hedefini referans alıyorum, ama canlı konum daha doğru olur."
              : "İstanbul içinde her şeyi senin bulunduğun yere göre hesaplıyorum."}
          </p>
          {blocked && (
            <button
              onClick={() => location.reload()}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-vapur text-bogaz-deep font-semibold text-xs px-3.5 py-1.5 hover:bg-vapur-soft transition"
            >
              İzin verdim, tekrar dene
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
