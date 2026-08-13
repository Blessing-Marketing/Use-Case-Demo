import type { ReactNode } from "react";
import { markenVariablen, type Marke } from "@/lib/marke";

/**
 * Setzt die Marke fuer alles darunter. Jede Farbe, Schrift und Rundung im
 * System liest aus diesen Variablen - deshalb ist ein Kundenwechsel hier
 * genau eine Zeile.
 */
export function MarkenRahmen({
  marke,
  children,
  className = "",
}: {
  marke: Marke;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      data-brand={marke.slug}
      style={markenVariablen(marke)}
      className={`min-h-dvh bg-surface text-ink ${className}`}
    >
      {children}
    </div>
  );
}

/** Wortmarke oder Bild - je nachdem, was der Kunde hinterlegt hat. */
export function Logo({ marke, invers = false }: { marke: Marke; invers?: boolean }) {
  if (marke.logo.bild) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={marke.logo.bild}
        alt={marke.name}
        style={{ height: marke.logo.hoehe }}
        className="w-auto max-w-[220px] object-contain"
      />
    );
  }
  return (
    <span
      className={`t-display text-[1.35rem] leading-none ${invers ? "text-stage-ink" : "text-ink"}`}
      style={{ fontStretch: "92%" }}
    >
      {marke.logo.text}
    </span>
  );
}
