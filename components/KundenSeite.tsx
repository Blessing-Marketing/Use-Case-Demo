import { Leitstand } from "./Lauf";
import { Logo, MarkenRahmen } from "./Marken";
import { UseCaseKarte } from "./UseCaseKarte";
import { gesamtErsparnis, mengengeruest } from "@/lib/kennzahlen";
import type { Marke } from "@/lib/marke";
import type { UseCase } from "@/lib/usecases/typen";

export function KundenSeite({
  marke,
  useCases,
  hrefBasis,
  hrefSuffix = "",
}: {
  marke: Marke;
  useCases: UseCase[];
  hrefBasis: string;
  hrefSuffix?: string;
}) {
  const ersparnis = gesamtErsparnis(useCases, marke);
  const systeme = Array.from(new Set(useCases.flatMap((uc) => uc.systeme)));
  const mailto = marke.kontakt.mail
    ? `mailto:${marke.kontakt.mail}?subject=${encodeURIComponent(`Demo ${marke.name} – Rückfrage`)}`
    : undefined;

  return (
    <MarkenRahmen marke={marke}>
      {/* Kopfzeile */}
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <div className="flex items-center gap-4">
            <Logo marke={marke} />
            {marke.branche ? (
              <span className="t-mono hidden border-l border-line pl-4 text-[0.68rem] text-faint sm:block">
                {marke.branche}
              </span>
            ) : null}
          </div>
          {mailto ? (
            <a
              href={mailto}
              className="t-mono text-[0.72rem] text-muted underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              Fragen? {marke.kontakt.mail}
            </a>
          ) : null}
        </div>
      </header>

      <main>
        {/* Kopfbereich */}
        <section className="mx-auto max-w-6xl px-5 pb-14 pt-14 sm:px-8 sm:pb-20 sm:pt-20">
          <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
            <div>
              <p className="t-eyebrow text-accent-text">{marke.texte.eyebrow}</p>
              <h1 className="t-display mt-5 text-[clamp(2.6rem,7vw,4.6rem)]">
                {marke.texte.ueberschrift}
              </h1>
              <p className="t-lead mt-6 max-w-xl text-[1.02rem] text-muted">{marke.texte.intro}</p>

              <a
                href="#ablaeufe"
                className="t-mono mt-8 inline-flex items-center gap-2 rounded-brand-sm bg-primary px-5 py-3 text-[0.75rem] text-on-primary transition-opacity hover:opacity-90"
              >
                {useCases.length} Abläufe ansehen
                <svg viewBox="0 0 8 14" className="h-3 w-2" aria-hidden>
                  <path d="M4 0v11m0 0L.5 7.5M4 11l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </a>
            </div>

            {useCases[0] ? (
              <Leitstand uc={useCases[0]} mengen={mengengeruest(useCases[0], marke)} />
            ) : null}
          </div>
        </section>

        {/* Zahlenband */}
        <section className="border-y border-line bg-paper">
          <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-line px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8">
            <div className="py-6 sm:pr-8">
              <p className="t-mono text-[1.6rem] leading-none">{useCases.length}</p>
              <p className="mt-2 text-[0.82rem] text-muted">
                Abläufe, ausgewählt für {marke.name}
              </p>
            </div>
            <div className="py-6 sm:px-8">
              <p className="t-mono flex items-baseline gap-2 text-[1.6rem] leading-none">
                {ersparnis.geschaetzt ? (
                  <span className="text-faint" aria-hidden>
                    ≈
                  </span>
                ) : null}
                {ersparnis.stunden.toLocaleString("de-DE")} h
                {ersparnis.geschaetzt ? (
                  <span className="t-mono rounded-brand-sm border border-line px-1.5 py-0.5 text-[0.6rem] uppercase tracking-[0.12em] text-faint">
                    Schätzung
                  </span>
                ) : null}
              </p>
              <p className="mt-2 text-[0.82rem] text-muted">
                {ersparnis.geschaetzt
                  ? "Handarbeit pro Jahr, die entfällt – geschätzt mit Erfahrungswerten, nicht mit Ihren Zahlen"
                  : `Handarbeit pro Jahr, die entfällt – gerechnet mit Ihren Mengen auf ${marke.arbeitstage} Arbeitstage`}
              </p>
            </div>
            <div className="py-6 sm:pl-8">
              <p className="t-mono text-[1.6rem] leading-none">{systeme.length}</p>
              <p className="mt-2 text-[0.82rem] text-muted">
                angebundene Systeme, z. B. {systeme.slice(0, 3).join(", ")}
              </p>
            </div>
          </div>
        </section>

        {/* Abläufe */}
        <section id="ablaeufe" className="mx-auto max-w-6xl scroll-mt-8 px-5 py-16 sm:px-8 sm:py-24">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="t-eyebrow text-muted">Die Abläufe</p>
              <h2 className="t-display mt-3 text-[clamp(1.8rem,4vw,2.6rem)]">
                Jeder einzeln zum Zuschauen.
              </h2>
            </div>
            <p className="max-w-sm text-[0.88rem] leading-relaxed text-muted">
              Die Demos laufen mit erfundenen, aber realistischen Daten. Keine Anmeldung, nichts zu
              installieren.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {useCases.map((uc) => (
              <UseCaseKarte
                key={uc.slug}
                uc={uc}
                mengen={mengengeruest(uc, marke)}
                href={`${hrefBasis}/${uc.slug}${hrefSuffix}`}
              />
            ))}
          </div>
        </section>

        {/* Abschluss */}
        <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8 sm:pb-28">
          <div className="rounded-brand bg-primary p-8 text-on-primary sm:p-12">
            <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-end">
              <div>
                <h2 className="t-display text-[clamp(1.8rem,4vw,2.8rem)]">
                  {marke.texte.abschlussTitel}
                </h2>
                <p className="t-lead mt-4 max-w-xl text-[1rem] opacity-85">
                  {marke.texte.abschlussText}
                </p>
              </div>
              {mailto ? (
                <div className="lg:text-right">
                  <a
                    href={mailto}
                    className="t-mono inline-flex items-center gap-2 rounded-brand-sm bg-on-primary px-5 py-3 text-[0.75rem] text-primary transition-opacity hover:opacity-90"
                  >
                    Gespräch vereinbaren
                    <svg viewBox="0 0 16 8" className="h-2 w-4" aria-hidden>
                      <path
                        d="M0 4h13m0 0-3.5-3.5M13 4l-3.5 3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.4"
                      />
                    </svg>
                  </a>
                  {marke.kontakt.name ? (
                    <p className="t-mono mt-4 text-[0.7rem] opacity-70">
                      {marke.kontakt.name}
                      {marke.kontakt.rolle ? ` · ${marke.kontakt.rolle}` : ""}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-[0.72rem] text-faint sm:px-8">
          <span className="t-mono">Demo im Erscheinungsbild von {marke.name}</span>
          <span className="t-mono">
            Alle gezeigten Daten sind erfunden. Kein Zugriff auf Ihre Systeme.
          </span>
        </div>
      </footer>
    </MarkenRahmen>
  );
}
