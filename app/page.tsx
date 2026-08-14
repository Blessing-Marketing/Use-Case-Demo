import Link from "next/link";
import { alleKunden, kundenFehler } from "@/lib/kunden";
import { markenVariablen } from "@/lib/marke";
import { ALLE_USE_CASES, useCasesFuer } from "@/lib/usecases";

/** Die Liste muss neu angelegte Kunden zeigen, nicht den Stand vom Bauen. */
export const dynamic = "force-dynamic";

export default function Uebersicht() {
  const kunden = alleKunden();
  const fehler = kundenFehler();

  return (
    <div className="min-h-dvh bg-surface text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-baseline gap-3">
            <span className="t-display text-[1.3rem]" style={{ fontStretch: "92%" }}>
              Demo-System
            </span>
            <span className="t-mono text-[0.68rem] text-faint">interne Übersicht</span>
          </div>
          <Link
            href="/studio"
            className="t-mono rounded-brand-sm bg-primary px-4 py-2 text-[0.72rem] text-on-primary transition-opacity hover:opacity-90"
          >
            Neuen Kunden anlegen
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-14">
        <p className="t-eyebrow text-accent">Für den Vertrieb</p>
        <h1 className="t-display mt-4 max-w-2xl text-[clamp(2.2rem,5vw,3.4rem)]">
          Dieselben Abläufe, im Erscheinungsbild des Kunden.
        </h1>
        <p className="t-lead mt-5 max-w-2xl text-muted">
          Jede Demo zeigt {ALLE_USE_CASES.length} mögliche Abläufe als Lauf über Stationen, mit
          Zeitvergleich. Für einen neuen Kunden wird nur das Branding getauscht – die Abläufe
          bleiben.
        </p>

        {fehler.length ? (
          <div className="mt-10 rounded-brand border border-accent bg-accent-soft p-5">
            <p className="font-medium">
              {fehler.length} Kundendatei{fehler.length === 1 ? "" : "en"} wird übersprungen
            </p>
            <ul className="mt-3 space-y-1">
              {fehler.map((f) => (
                <li key={f.datei} className="t-mono text-[0.74rem] leading-relaxed">
                  content/kunden/{f.datei} – {f.grund}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <section className="mt-14">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="t-eyebrow text-muted">Angelegte Demos</h2>
            <span className="t-mono text-[0.7rem] text-faint">{kunden.length}</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {kunden.map((k) => {
              const anzahl = useCasesFuer(k.useCases).length;
              return (
                <Link
                  key={k.slug}
                  href={`/kunde/${k.slug}`}
                  className="group rounded-brand border border-line bg-paper p-5 transition-colors hover:border-primary"
                >
                  <div
                    style={markenVariablen(k)}
                    className="mb-4 flex h-16 items-center justify-between gap-3 rounded-brand-sm bg-surface px-4"
                  >
                    <span
                      className="t-display truncate text-[1.05rem] text-ink"
                      style={{ fontStretch: "92%" }}
                    >
                      {k.logo.text}
                    </span>
                    <span className="flex shrink-0 gap-1.5">
                      <span className="h-6 w-6 rounded-full" style={{ background: k.farben.primaer }} />
                      <span className="h-6 w-6 rounded-full" style={{ background: k.farben.akzent }} />
                      <span
                        className="h-6 w-6 rounded-full border"
                        style={{ background: k.farben.papier, borderColor: k.farben.ink }}
                      />
                    </span>
                  </div>
                  <p className="text-[1rem] font-medium transition-colors group-hover:text-primary">
                    {k.name}
                  </p>
                  <p className="t-mono mt-1.5 text-[0.68rem] text-faint">
                    /kunde/{k.slug} · {anzahl} Abläufe
                    {k.branche ? ` · ${k.branche}` : ""}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-16 grid gap-4 border-t border-line pt-10 sm:grid-cols-3">
          <div>
            <p className="t-eyebrow mb-2 text-accent">Kunde anlegen</p>
            <p className="text-[0.86rem] leading-relaxed text-muted">
              Im Studio die Kundenwebsite eintragen. Logo, Farben und Schriften werden ausgelesen,
              der Rest ist Feinschliff.
            </p>
          </div>
          <div>
            <p className="t-eyebrow mb-2 text-accent">Sofort verschicken</p>
            <p className="text-[0.86rem] leading-relaxed text-muted">
              Der Vorschau-Link enthält die komplette Marke und funktioniert ohne Veröffentlichung.
            </p>
          </div>
          <div>
            <p className="t-eyebrow mb-2 text-accent">Ablauf ergänzen</p>
            <p className="text-[0.86rem] leading-relaxed text-muted">
              Neue Abläufe sind reine Datendateien unter{" "}
              <span className="t-mono text-ink">lib/usecases/</span>. Ab dann stehen sie jedem
              Kunden zur Verfügung.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
