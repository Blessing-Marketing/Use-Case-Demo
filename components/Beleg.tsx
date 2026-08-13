import type { Beleg } from "@/lib/usecases/typen";

/**
 * Rendert einen Beleg auf der Buehne. Jede Belegart hat eine eigene Darstellung,
 * damit ein Ablauf nicht wie eine Liste aussieht, sondern wie das, was er ist:
 * eine Mail, ein Angebot, eine Pruefliste.
 */

function Marke({ stand }: { stand: "ok" | "warnung" | "info" }) {
  if (stand === "ok") {
    return (
      <svg viewBox="0 0 12 12" className="mt-[3px] h-3 w-3 shrink-0 text-stage-primary" aria-hidden>
        <path
          d="M2 6.4 4.6 9 10 3"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="square"
        />
      </svg>
    );
  }
  if (stand === "warnung") {
    return (
      <svg viewBox="0 0 12 12" className="mt-[3px] h-3 w-3 shrink-0 text-accent-stage" aria-hidden>
        <path d="M6 1 11.5 11h-11z" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 12 12" className="mt-[3px] h-3 w-3 shrink-0 text-stage-muted" aria-hidden>
      <circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function Titel({ children }: { children: React.ReactNode }) {
  return <p className="t-eyebrow mb-3 text-stage-muted">{children}</p>;
}

/** Helles Blatt auf dunkler Buehne - fuer alles, was im Alltag Papier waere. */
function Blatt({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-brand bg-paper p-5 text-ink shadow-[0_18px_40px_-24px_rgba(0,0,0,0.8)] sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

function Karte({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-brand border border-stage-line bg-[color-mix(in_oklab,var(--c-stage-ink)_5%,var(--c-stage))] p-5 sm:p-6">
      {children}
    </div>
  );
}

export function BelegAnsicht({ beleg }: { beleg: Beleg }) {
  switch (beleg.art) {
    case "mail":
      return (
        <Blatt>
          <div className="mb-4 border-b border-line pb-3">
            <p className="t-mono text-[0.7rem] text-muted">{beleg.von}</p>
            <p className="mt-1 font-semibold leading-snug">{beleg.betreff}</p>
          </div>
          <div className="space-y-2 text-[0.9rem] leading-relaxed text-ink/85">
            {beleg.zeilen.map((z, i) => (
              <p key={i}>{z}</p>
            ))}
          </div>
          {beleg.anhang ? (
            <p className="t-mono mt-4 inline-flex items-center gap-2 border border-line px-2 py-1 text-[0.68rem] text-muted">
              <span className="inline-block h-1.5 w-1.5 bg-accent" />
              {beleg.anhang}
            </p>
          ) : null}
        </Blatt>
      );

    case "felder":
      return (
        <Karte>
          {beleg.titel ? <Titel>{beleg.titel}</Titel> : null}
          <dl className="divide-y divide-stage-line">
            {beleg.zeilen.map((z, i) => (
              <div
                key={i}
                className="anim-slide grid grid-cols-[minmax(6.5rem,9rem)_1fr] gap-4 py-2.5"
                style={{ animationDelay: `${i * 55}ms` }}
              >
                <dt className="t-mono pt-0.5 text-[0.7rem] text-stage-muted">{z.feld}</dt>
                <dd className="text-[0.92rem] leading-snug text-stage-ink">
                  {z.wert}
                  {z.hinweis ? (
                    <span className="t-mono ml-2 text-[0.68rem] text-stage-muted">({z.hinweis})</span>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
        </Karte>
      );

    case "pruefung":
      return (
        <Karte>
          {beleg.titel ? <Titel>{beleg.titel}</Titel> : null}
          <ul className="space-y-3">
            {beleg.punkte.map((p, i) => (
              <li
                key={i}
                className="anim-slide flex gap-3 text-[0.92rem] leading-snug"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <Marke stand={p.stand} />
                <span className="text-stage-ink">
                  {p.text}
                  {p.hinweis ? (
                    <span className="t-mono ml-2 text-[0.68rem] text-stage-muted">{p.hinweis}</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </Karte>
      );

    case "dokument":
      return (
        <Blatt>
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
            <p className="t-display text-[1.15rem]" style={{ fontStretch: "92%" }}>
              {beleg.titel}
            </p>
            {beleg.untertitel ? (
              <p className="t-mono text-[0.68rem] text-muted">{beleg.untertitel}</p>
            ) : null}
          </div>
          <ul className="divide-y divide-line">
            {beleg.positionen.map((p, i) => (
              <li
                key={i}
                className="anim-slide flex items-baseline justify-between gap-6 py-2 text-[0.9rem]"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <span className="text-ink/85">{p.text}</span>
                <span className="t-mono shrink-0 text-[0.82rem]">{p.wert}</span>
              </li>
            ))}
          </ul>
          {beleg.summe ? (
            <div className="mt-3 flex items-baseline justify-between border-t-2 border-ink pt-3">
              <span className="t-eyebrow">{beleg.summe.text}</span>
              <span className="t-mono text-[1.05rem] font-semibold">{beleg.summe.wert}</span>
            </div>
          ) : null}
        </Blatt>
      );

    case "tabelle":
      return (
        <Karte>
          {beleg.titel ? <Titel>{beleg.titel}</Titel> : null}
          <div className="thin-scroll -mx-1 overflow-x-auto px-1">
            <table className="w-full min-w-[30rem] border-collapse text-left">
              <thead>
                <tr>
                  {beleg.kopf.map((k, i) => (
                    <th
                      key={i}
                      className="t-eyebrow border-b border-stage-line pb-2 pr-4 font-medium text-stage-muted"
                    >
                      {k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {beleg.zeilen.map((zeile, i) => (
                  <tr
                    key={i}
                    className="anim-slide border-b border-stage-line/60"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    {zeile.map((zelle, j) => (
                      <td
                        key={j}
                        className={`py-2.5 pr-4 align-top text-[0.86rem] text-stage-ink ${
                          j === 0 ? "" : "t-mono text-[0.8rem]"
                        }`}
                      >
                        {zelle}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Karte>
      );

    case "uebergabe":
      return (
        <Karte>
          <Titel>Übergabe</Titel>
          <div className="flex flex-wrap items-center gap-3">
            <span className="t-mono rounded-brand-sm bg-primary px-2.5 py-1 text-[0.7rem] text-on-primary">
              {beleg.kanal}
            </span>
            <svg viewBox="0 0 24 10" className="h-2.5 w-8 text-accent-stage" aria-hidden>
              <path
                d="M0 5h20m0 0-4-4m4 4-4 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              />
            </svg>
            <span className="text-[1rem] font-medium text-stage-ink">{beleg.ziel}</span>
          </div>
          {beleg.betreff ? (
            <p className="mt-4 border-l-2 border-accent pl-3 text-[0.92rem] leading-snug text-stage-ink">
              {beleg.betreff}
            </p>
          ) : null}
          {beleg.hinweis ? (
            <p className="mt-3 text-[0.82rem] leading-snug text-stage-muted">{beleg.hinweis}</p>
          ) : null}
        </Karte>
      );

    case "bewertung": {
      const max = beleg.max ?? 100;
      return (
        <Karte>
          <Titel>{beleg.text}</Titel>
          <div className="flex items-end gap-3">
            <span className="t-display text-[3.4rem] leading-none text-stage-ink">{beleg.wert}</span>
            <span className="t-mono pb-2 text-[0.8rem] text-stage-muted">von {max}</span>
          </div>
          <div className="mt-4 h-1.5 w-full bg-stage-line">
            <div
              className="h-full bg-accent transition-[width] duration-700 ease-out"
              style={{ width: `${Math.min(100, (beleg.wert / max) * 100)}%` }}
            />
          </div>
          <ul className="mt-5 space-y-2">
            {beleg.faktoren.map((f, i) => (
              <li
                key={i}
                className="anim-slide flex items-baseline justify-between gap-4 text-[0.86rem]"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span className="text-stage-ink/85">{f.text}</span>
                <span
                  className={`t-mono shrink-0 text-[0.8rem] ${
                    f.delta.startsWith("−") || f.delta.startsWith("-")
                      ? "text-stage-muted"
                      : "text-accent-stage"
                  }`}
                >
                  {f.delta}
                </span>
              </li>
            ))}
          </ul>
        </Karte>
      );
    }

    case "dialog":
      return (
        <div className="space-y-4">
          {beleg.beitraege.map((b, i) =>
            b.rolle === "kunde" ? (
              <Karte key={i}>
                <Titel>Frage</Titel>
                <p className="text-[0.98rem] leading-relaxed text-stage-ink">{b.text}</p>
              </Karte>
            ) : (
              <Blatt key={i}>
                <p className="t-eyebrow mb-3 text-muted">Entwurf – wartet auf Freigabe</p>
                <p className="whitespace-pre-line text-[0.94rem] leading-relaxed text-ink/90">
                  {b.text}
                </p>
                {b.quellen?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3">
                    {b.quellen.map((q) => (
                      <span
                        key={q}
                        className="t-mono border border-line px-2 py-0.5 text-[0.66rem] text-muted"
                      >
                        {q}
                      </span>
                    ))}
                  </div>
                ) : null}
              </Blatt>
            ),
          )}
        </div>
      );

    case "dateien":
      return (
        <Karte>
          {beleg.titel ? <Titel>{beleg.titel}</Titel> : null}
          <ul className="space-y-2">
            {beleg.eintraege.map((e, i) => (
              <li
                key={i}
                className="anim-slide flex items-baseline gap-3 border border-stage-line px-3 py-2.5"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-accent" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.9rem] text-stage-ink">{e.name}</span>
                  <span className="t-mono text-[0.68rem] text-stage-muted">
                    {e.typ}
                    {e.hinweis ? ` · ${e.hinweis}` : ""}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Karte>
      );

    case "notiz":
      return (
        <Karte>
          <Titel>Offener Punkt</Titel>
          <p className="border-l-2 border-accent pl-4 text-[0.98rem] leading-relaxed text-stage-ink">
            {beleg.text}
          </p>
        </Karte>
      );
  }
}
