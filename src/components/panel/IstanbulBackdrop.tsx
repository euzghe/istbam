// İstanbul simgelerinin sayfa arkasında silik dağıtılması.
// pointer-events-none — etkileşim yok. Hem light hem dark uyumlu.

export function IstanbulBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full text-bogaz-deep dark:text-sis opacity-[0.055] dark:opacity-[0.045]"
        fill="currentColor"
      >
        {/* Yıldızlar — üst kısım */}
        {[
          [90, 80], [260, 110], [410, 70], [560, 130], [720, 90],
          [880, 60], [1040, 110], [1200, 80], [1380, 130], [1520, 90],
          [180, 200], [340, 160], [500, 220], [660, 180], [820, 240],
          [980, 200], [1140, 160], [1300, 220], [1460, 180]
        ].map(([x, y], i) => (
          <circle key={`s${i}`} cx={x} cy={y} r={i % 3 === 0 ? 2 : 1.3} />
        ))}

        {/* Martılar */}
        {[
          [220, 320], [430, 280], [640, 350], [870, 290], [1100, 330],
          [1320, 280], [1500, 360], [180, 460], [550, 480], [1020, 470]
        ].map(([x, y], i) => (
          <path
            key={`g${i}`}
            d={`M ${x} ${y} q 7 -8 14 0 q 7 -8 14 0`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
          />
        ))}

        {/* Galata Kulesi — sağ üst bölgesi */}
        <g transform="translate(1280, 240)">
          <rect x="0" y="80" width="36" height="220" />
          <path d="M-8 80 L44 80 L36 60 L0 60 Z" />
          <rect x="2" y="40" width="32" height="20" />
          <path d="M-4 40 L40 40 L34 22 L2 22 Z" />
          <rect x="14" y="6" width="8" height="16" />
          <path d="M18 6 L18 -14" stroke="currentColor" strokeWidth="2" fill="none" />
        </g>

        {/* Süleymaniye — sol üst bölgesi */}
        <g transform="translate(140, 320)">
          {/* Ana kubbe */}
          <path d="M40 80 Q40 24 80 24 Q120 24 120 80 Z" />
          {/* Yan kubbeler */}
          <path d="M14 88 Q14 56 38 56 Q62 56 62 88 Z" />
          <path d="M98 88 Q98 56 122 56 Q146 56 146 88 Z" />
          {/* Gövde */}
          <rect x="10" y="86" width="140" height="70" />
          {/* Minareler */}
          <rect x="-2" y="32" width="6" height="124" />
          <circle cx="1" cy="28" r="5" />
          <path d="M1 22 L1 4" stroke="currentColor" strokeWidth="2" fill="none" />
          <rect x="156" y="32" width="6" height="124" />
          <circle cx="159" cy="28" r="5" />
          <path d="M159 22 L159 4" stroke="currentColor" strokeWidth="2" fill="none" />
        </g>

        {/* Kız Kulesi — orta sağ */}
        <g transform="translate(960, 540)">
          <ellipse cx="22" cy="56" rx="42" ry="4" />
          <rect x="14" y="20" width="16" height="36" />
          <path d="M8 20 L36 20 L30 4 L14 4 Z" />
          <path d="M22 4 L22 -10" stroke="currentColor" strokeWidth="2" fill="none" />
          <rect x="22" y="-10" width="8" height="4" />
        </g>

        {/* Sultanahmet külliyesi — sol orta */}
        <g transform="translate(320, 600)">
          <path d="M30 60 Q30 16 60 16 Q90 16 90 60 Z" />
          <rect x="6" y="64" width="108" height="40" />
          {/* 6 minare */}
          {[-6, 18, 42, 78, 102, 126].map((x, i) => (
            <g key={`min${i}`}>
              <rect x={x} y="24" width="4" height="80" />
              <circle cx={x + 2} cy="22" r="3.5" />
              <path d={`M${x + 2} 18 L${x + 2} 4`} stroke="currentColor" strokeWidth="1.6" fill="none" />
            </g>
          ))}
        </g>

        {/* 15 Temmuz Köprüsü — altta yatay */}
        <g transform="translate(0, 720)" stroke="currentColor" fill="none" strokeWidth="2.2">
          {/* pylons */}
          <line x1="380" y1="0" x2="380" y2="100" />
          <line x1="1160" y1="0" x2="1160" y2="100" />
          <rect x="372" y="-6" width="16" height="8" fill="currentColor" />
          <rect x="1152" y="-6" width="16" height="8" fill="currentColor" />
          {/* ana kablo */}
          <path d="M380 14 Q770 80 1160 14" />
          {/* baz */}
          <line x1="320" y1="100" x2="1220" y2="100" strokeWidth="3" />
          {/* asma teller */}
          {Array.from({ length: 28 }).map((_, i) => {
            const t = i / 27;
            const x = 380 + t * 780;
            const y = 14 + 66 * 4 * t * (1 - t);
            return <line key={`hg${i}`} x1={x} y1={y} x2={x} y2="100" strokeWidth="0.9" />;
          })}
        </g>

        {/* Vapur — alt orta */}
        <g transform="translate(680, 800)">
          {/* gövde */}
          <path d="M0 0 L160 0 L150 20 L10 20 Z" />
          {/* üst yapı */}
          <rect x="20" y="-22" width="120" height="22" />
          {/* baca */}
          <rect x="74" y="-44" width="12" height="22" />
          {/* duman */}
          <circle cx="80" cy="-52" r="6" opacity="0.6" />
          <circle cx="74" cy="-62" r="8" opacity="0.4" />
          <circle cx="86" cy="-70" r="10" opacity="0.25" />
          {/* küçük dalgalar */}
          <path
            d="M -20 30 Q 20 26 60 30 T 140 30 T 220 30"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.4"
          />
        </g>

        {/* Pusula — sol alt köşe ipucu */}
        <g transform="translate(120, 760)" stroke="currentColor" strokeWidth="1.5" fill="none">
          <circle cx="0" cy="0" r="28" />
          <path d="M0 -22 L6 0 L0 22 L-6 0 Z" fill="currentColor" stroke="none" opacity="0.6" />
          <text x="0" y="-32" textAnchor="middle" fontSize="10" fontWeight="700" fill="currentColor">
            K
          </text>
        </g>
      </svg>
    </div>
  );
}
