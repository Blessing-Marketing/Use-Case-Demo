import Link from "next/link";
import { Lauf, Zeitvergleich } from "./Lauf";
import { Logo, MarkenRahmen } from "./Marken";
import type { Marke } from "@/lib/marke";
import { manuellText, mengengeruest } from "@/lib/kennzahlen";
import type { UseCase } from "@/lib/usecases/typen";

export function UseCaseSeite({
  marke,
  uc,
  weitere,
  hrefBasis,
  hrefSuffix = "",
}: {
  marke: Marke;
  uc: UseCase;
  weitere: UseCase[];
  hrefBasis: string;
  hrefSuffix?: string;
}) {
  const mailto = marke.kontakt.mail
    ? `mailto:${marke.kontakt.mail}?subject=${encodeURIComponent(`${uc.name} – Rückfrage`)}`
    : undefined;

  return (
    <MarkenRahmen marke={marke}>
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <div className="flex items-center gap-4">
            <Link href={`${hrefBasis}${hrefSuffix}`} className="flex items-center gap-4">
              <Logo marke={marke} />
            </Link>
            <span className="t-mono hidden border-l border-line pl-4 text-[0.68rem] text-faint sm:block">
              {uc.kicker}
            </span>
          </div>
          <Link
            href={`${hrefBasis}${hrefSuffix}`}
            className="t-mono inline-flex items-center gap-2 text-[0.72rem] text-muted transition-colors hover:text-primary"
          >
            <svg viewBox="0 0 16 8" className="h-2 w-4" aria-hidden>
              <path d="M16 4H3m0 0 3.5-3.5M3 4l3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            Alle Abläufe
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-20 pt-12 sm:px-8 sm:pb-28 sm:pt-16">
        <div className="mb-10 grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:items-end">
          <div>
            <p className="t-eyebrow text-accent-text">{uc.kicker}</p>
            <h1 className="t-display mt-4 text-[clamp(2.2rem,5.5vw,3.6rem)]">{uc.name}</h1>
            <p className="t-lead mt-5 max-w-xl text-[1.02rem] text-muted">{uc.versprechen}</p>
          </div>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-brand border border-line bg-line">
            <div className="bg-paper p-4">
              <dt className="t-eyebrow text-faint">Auslöser</dt>
              <dd className="mt-2 text-[0.88rem] leading-snug">{uc.ausloeser}</dd>
            </div>
            <div className="bg-paper p-4">
              <dt className="t-eyebrow text-faint">Ergebnis</dt>
              <dd className="mt-2 text-[0.88rem] leading-snug">{uc.ergebnis}</dd>
            </div>
          </dl>
        </div>

        {/* Der Lauf */}
        <Lauf uc={uc} mengen={mengengeruest(uc, marke)} />

        {/* Einordnung */}
        <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-6">
            <Zeitvergleich uc={uc} mengen={mengengeruest(uc, marke)} />
            <div className="rounded-brand border border-line bg-paper p-5 sm:p-6">
              <p className="t-eyebrow mb-4 text-muted">Angebunden werden typischerweise</p>
              <ul className="flex flex-wrap gap-2">
                {uc.systeme.map((s) => (
                  <li
                    key={s}
                    className="t-mono rounded-brand-sm border border-line px-2.5 py-1 text-[0.7rem] text-muted"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-brand border border-line bg-paper p-6 sm:p-8">
            <p className="t-eyebrow text-muted">Was sich dadurch ändert</p>
            <ul className="mt-6 divide-y divide-line">
              {uc.vorteile.map((v) => (
                <li key={v.titel} className="py-5 first:pt-0 last:pb-0">
                  <h3 className="text-[1.05rem] font-semibold leading-snug">{v.titel}</h3>
                  <p className="t-lead mt-2 text-[0.92rem] text-muted">{v.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Weiter */}
        {weitere.length ? (
          <section className="mt-16 border-t border-line pt-10">
            <p className="t-eyebrow mb-6 text-muted">Weitere Abläufe</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {weitere.map((w) => (
                <Link
                  key={w.slug}
                  href={`${hrefBasis}/${w.slug}${hrefSuffix}`}
                  className="group rounded-brand border border-line bg-paper p-5 transition-colors hover:border-primary"
                >
                  <span className="t-mono text-[0.66rem] text-faint">{w.kicker}</span>
                  <span className="mt-2 block text-[1rem] font-medium leading-snug transition-colors group-hover:text-primary">
                    {w.name}
                  </span>
                  <span className="t-mono mt-3 block text-[0.68rem] text-muted">
                    {manuellText(mengengeruest(w, marke))} <span className="text-accent-text">→</span>{" "}
                    {w.autoSekunden} s
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {mailto ? (
          <section className="mt-14 flex flex-wrap items-center justify-between gap-5 rounded-brand bg-primary p-7 text-on-primary sm:p-9">
            <div>
              <h2 className="t-display text-[clamp(1.5rem,3vw,2.1rem)]">
                Diesen Ablauf mit Ihren Daten sehen?
              </h2>
              <p className="mt-2 max-w-lg text-[0.95rem] opacity-85">{marke.texte.abschlussText}</p>
            </div>
            <a
              href={mailto}
              className="t-mono inline-flex shrink-0 items-center gap-2 rounded-brand-sm bg-on-primary px-5 py-3 text-[0.75rem] text-primary transition-opacity hover:opacity-90"
            >
              Kontakt aufnehmen
            </a>
          </section>
        ) : null}
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-[0.72rem] text-faint sm:px-8">
          <span className="t-mono">Demo im Erscheinungsbild von {marke.name}</span>
          <span className="t-mono">Alle gezeigten Daten sind erfunden.</span>
        </div>
      </footer>
    </MarkenRahmen>
  );
}
