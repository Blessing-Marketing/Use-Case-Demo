import Link from "next/link";
import { LaufStreifen } from "./Lauf";
import { manuellText, mengengeruest, type Mengengeruest } from "@/lib/kennzahlen";
import type { UseCase } from "@/lib/usecases/typen";

export function UseCaseKarte({
  uc,
  href,
  mengen,
}: {
  uc: UseCase;
  href: string;
  mengen?: Mengengeruest;
}) {
  const werte = mengen ?? mengengeruest(uc);
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-brand border border-line bg-paper p-6 transition-colors hover:border-primary sm:p-7"
    >
      <div className="flex items-baseline justify-between gap-4">
        <span className="t-eyebrow text-muted">{uc.kicker}</span>
        <span className="t-mono shrink-0 text-[0.72rem] text-muted">
          {manuellText(werte)} <span className="text-accent-text">→</span> {uc.autoSekunden} s
        </span>
      </div>

      <h3
        className="t-display mt-4 text-[1.6rem] transition-colors group-hover:text-primary sm:text-[1.75rem]"
        style={{ fontStretch: "92%" }}
      >
        {uc.name}
      </h3>

      <p className="t-lead mt-3 flex-1 text-[0.92rem] text-muted">{uc.beschreibung}</p>

      <div className="mt-7">
        <LaufStreifen uc={uc} />
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <span className="t-mono text-[0.7rem] text-faint">
          {uc.ausloeser} <span className="text-accent-text">→</span> {uc.ergebnis}
        </span>
        <span className="t-mono inline-flex items-center gap-1.5 rounded-brand-sm bg-primary px-3 py-1.5 text-[0.7rem] text-on-primary transition-opacity group-hover:opacity-90">
          Ansehen
          <svg viewBox="0 0 16 8" className="h-2 w-4" aria-hidden>
            <path d="M0 4h13m0 0-3.5-3.5M13 4l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
