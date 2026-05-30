"use client";

import { type ReactNode } from "react";

type Props = {
  icon: string;
  eyebrow: string;
  title: string;
  description?: string;
  badge?: ReactNode;
  accent?: "cini" | "vapur" | "vapur-red" | "mehtap";
};

export function PageHeader({
  icon,
  eyebrow,
  title,
  description,
  badge,
  accent = "cini",
}: Props) {
  const accentColor = {
    cini: "text-cini",
    vapur: "text-vapur",
    "vapur-red": "text-vapur-red",
    mehtap: "text-mehtap",
  }[accent];
  const accentBg = {
    cini: "bg-cini/12 ring-cini/30",
    vapur: "bg-vapur/12 ring-vapur/30",
    "vapur-red": "bg-vapur-red/12 ring-vapur-red/30",
    mehtap: "bg-mehtap/15 ring-mehtap/30",
  }[accent];

  return (
    <header className="relative pt-1 pb-1 animate-fade-in-up">
      <div className="flex items-start gap-4">
        <div
          className={`size-12 rounded-2xl ${accentBg} ring-1 flex items-center justify-center shrink-0 text-2xl shadow-sm`}
        >
          <span>{icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div
            className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold ${accentColor}`}
          >
            {eyebrow}
            {badge}
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-on leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-on-soft mt-1.5 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
