type LogoProps = {
  className?: string;
  size?: number;
  variant?: "ink" | "light";
};

export function Logo({ className, size = 28, variant = "ink" }: LogoProps) {
  const stroke = variant === "ink" ? "#0a1d3a" : "#f6f2e9";
  const accent = "#f5a524";

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden
      >
        {/* Yarım ay (İstanbul) */}
        <path
          d="M22 6a10 10 0 1 0 0 20 8 8 0 1 1 0-20Z"
          fill={stroke}
        />
        {/* Yıldız (vapur amber) */}
        <path
          d="m26 13 .9 1.9 2.1.3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2-1.5-1.4 2.1-.3z"
          fill={accent}
        />
      </svg>
      <span
        className="font-display font-semibold tracking-tight hidden xs:inline sm:inline"
        style={{
          color: variant === "ink" ? "#0a1d3a" : "#f6f2e9",
          fontSize: size * 0.7,
          lineHeight: 1,
        }}
      >
        İstbam
      </span>
    </div>
  );
}
