type Props = { className?: string };

// İstanbul siluetini SVG olarak çiz: Süleymaniye, Galata, Kız Kulesi,
// 15 Temmuz köprüsü, vapur, martılar.
export function IstanbulSilhouette({ className }: Props) {
  return (
    <svg
      viewBox="0 0 1440 360"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a1d3a" />
          <stop offset="0.55" stopColor="#0f2e5e" />
          <stop offset="1" stopColor="#1d4b8f" />
        </linearGradient>
        <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d4b8f" />
          <stop offset="1" stopColor="#0a1d3a" />
        </linearGradient>
        <radialGradient id="moon" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ffdfa0" />
          <stop offset="1" stopColor="#ffdfa0" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Gökyüzü */}
      <rect width="1440" height="360" fill="url(#sky)" />

      {/* Ay parıltısı */}
      <circle cx="1180" cy="80" r="60" fill="url(#moon)" />
      <circle cx="1180" cy="80" r="22" fill="#ffdfa0" />

      {/* Uzak yaka silüeti (Tarihi Yarımada) */}
      <g fill="#061327" opacity="0.95">
        <path d="M0 250 L60 250 L60 230 L90 230 L90 250 L160 250 L160 215 L180 215 L180 250 L260 250 L260 195 L280 195 L280 250 L1440 250 L1440 360 L0 360 Z" />
      </g>

      {/* Süleymaniye (sol-orta) */}
      <g transform="translate(220 145)" fill="#0a1d3a" stroke="#1d4b8f" strokeWidth="1">
        {/* Kubbe */}
        <path d="M40 50 Q40 10 60 10 Q80 10 80 50 Z" />
        {/* Yan kubbeler */}
        <path d="M20 55 Q20 35 35 35 Q50 35 50 55 Z" />
        <path d="M70 55 Q70 35 85 35 Q100 35 100 55 Z" />
        {/* Minareler */}
        <rect x="8" y="20" width="4" height="60" />
        <circle cx="10" cy="18" r="3" />
        <path d="M10 12 L10 6" stroke="#f5a524" strokeWidth="1.2" />
        <rect x="108" y="20" width="4" height="60" />
        <circle cx="110" cy="18" r="3" />
        <path d="M110 12 L110 6" stroke="#f5a524" strokeWidth="1.2" />
        {/* Gövde */}
        <rect x="15" y="55" width="90" height="50" />
      </g>

      {/* Galata Kulesi */}
      <g transform="translate(620 110)" fill="#0a1d3a" stroke="#2db7ab" strokeWidth="0.6">
        <rect x="0" y="30" width="22" height="110" />
        <path d="M-4 30 L26 30 L22 22 L0 22 Z" />
        <rect x="2" y="14" width="18" height="8" />
        <path d="M-2 14 L24 14 L18 4 L4 4 Z" />
        <path d="M11 4 L11 -8" stroke="#f5a524" strokeWidth="1.5" />
        <circle cx="11" cy="-10" r="2" fill="#f5a524" />
        {/* Pencere ışıkları */}
        <rect x="6" y="50" width="2" height="3" fill="#ffdfa0" />
        <rect x="14" y="50" width="2" height="3" fill="#ffdfa0" />
        <rect x="6" y="65" width="2" height="3" fill="#ffdfa0" />
        <rect x="14" y="65" width="2" height="3" fill="#ffdfa0" />
        <rect x="10" y="80" width="2" height="3" fill="#ffdfa0" />
      </g>

      {/* 15 Temmuz Şehitler Köprüsü */}
      <g stroke="#2db7ab" fill="none" strokeWidth="2" opacity="0.9">
        {/* Pylonlar */}
        <line x1="820" y1="100" x2="820" y2="240" />
        <line x1="1100" y1="100" x2="1100" y2="240" />
        {/* Pylon başlıkları */}
        <rect x="815" y="96" width="10" height="6" fill="#2db7ab" />
        <rect x="1095" y="96" width="10" height="6" fill="#2db7ab" />
        {/* Ana kablo (askıyı tutan) */}
        <path d="M820 105 Q960 200 1100 105" />
        {/* Köprü tabanı */}
        <line x1="780" y1="245" x2="1140" y2="245" strokeWidth="3" stroke="#0a1d3a" />
        {/* Asma teller */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((i) => {
          const x = 820 + i * 20;
          const t = (x - 820) / 280;
          const y = 105 + 95 * 4 * t * (1 - t);
          return <line key={i} x1={x} y1={y} x2={x} y2="245" strokeWidth="0.5" />;
        })}
        {/* Köprü ışıkları */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <circle key={i} cx={820 + i * 47} cy="244" r="1.2" fill="#ffdfa0" stroke="none" />
        ))}
      </g>

      {/* Kız Kulesi */}
      <g transform="translate(960 200)">
        {/* Kayalık ada */}
        <ellipse cx="20" cy="46" rx="35" ry="4" fill="#0a1d3a" />
        {/* Kule gövdesi */}
        <rect x="14" y="20" width="14" height="26" fill="#f6f2e9" />
        {/* Çatı */}
        <path d="M10 20 L32 20 L26 8 L16 8 Z" fill="#c84b4b" />
        {/* Bayrak direği */}
        <line x1="21" y1="8" x2="21" y2="0" stroke="#f5a524" strokeWidth="1" />
        <rect x="21" y="0" width="6" height="3" fill="#c84b4b" />
        {/* Pencere */}
        <rect x="19" y="28" width="4" height="6" fill="#ffdfa0" />
      </g>

      {/* Boğaz suyu */}
      <rect y="250" width="1440" height="110" fill="url(#water)" />

      {/* Su parıltıları (wave class ile hafif kayar) */}
      <g className="wave" opacity="0.5" stroke="#2db7ab" fill="none" strokeWidth="0.8">
        <path d="M0 275 Q120 270 240 275 T 480 275 T 720 275 T 960 275 T 1200 275 T 1440 275" />
        <path d="M0 295 Q120 290 240 295 T 480 295 T 720 295 T 960 295 T 1200 295 T 1440 295" opacity="0.7" />
        <path d="M0 320 Q120 315 240 320 T 480 320 T 720 320 T 960 320 T 1200 320 T 1440 320" opacity="0.4" />
      </g>

      {/* Vapur */}
      <g transform="translate(380 285)" className="drift">
        <rect x="0" y="0" width="120" height="18" fill="#f6f2e9" />
        <path d="M0 0 L-12 12 L0 12 Z" fill="#f6f2e9" />
        <path d="M120 0 L132 12 L120 12 Z" fill="#f6f2e9" />
        <rect x="10" y="-14" width="100" height="14" fill="#c84b4b" />
        {/* Pencereler */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <rect
            key={i}
            x={18 + i * 12}
            y={-10}
            width="4"
            height="6"
            fill="#ffdfa0"
          />
        ))}
        {/* Baca */}
        <rect x="58" y="-26" width="10" height="14" fill="#f6f2e9" />
        <rect x="58" y="-26" width="10" height="3" fill="#c84b4b" />
        {/* Duman */}
        <circle cx="63" cy="-32" r="4" fill="#f6f2e9" opacity="0.5" />
        <circle cx="58" cy="-38" r="5" fill="#f6f2e9" opacity="0.35" />
        <circle cx="68" cy="-42" r="6" fill="#f6f2e9" opacity="0.25" />
      </g>

      {/* Martılar */}
      <g fill="none" stroke="#f6f2e9" strokeWidth="1.5" strokeLinecap="round" className="glide">
        <path d="M780 90 q5 -6 10 0 q5 -6 10 0" />
        <path d="M880 60 q4 -5 8 0 q4 -5 8 0" opacity="0.7" />
        <path d="M340 130 q4 -5 8 0 q4 -5 8 0" opacity="0.8" />
        <path d="M1240 100 q5 -6 10 0 q5 -6 10 0" opacity="0.6" />
      </g>

      {/* Yıldızlar */}
      <g fill="#ffdfa0">
        <circle cx="120" cy="40" r="0.8" />
        <circle cx="240" cy="70" r="0.6" />
        <circle cx="420" cy="50" r="0.7" />
        <circle cx="540" cy="30" r="0.5" />
        <circle cx="1320" cy="60" r="0.6" />
        <circle cx="1380" cy="120" r="0.8" />
        <circle cx="60" cy="90" r="0.5" />
      </g>
    </svg>
  );
}
