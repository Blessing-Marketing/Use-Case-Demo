"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BelegAnsicht } from "./Beleg";
import {
  ersparnisStunden,
  faktor,
  manuellText,
  mengengeruest,
  mengeText,
  type Mengengeruest,
} from "@/lib/kennzahlen";
import type { UseCase } from "@/lib/usecases/typen";

/* --------------------------------------------------------------------------
   Der Lauf ist das wiederkehrende Element des ganzen Systems: ein Vorgang
   wandert ueber Stationen, waehrend eine Uhr mitlaeuft. Jeder neue Use Case
   bekommt diese Darstellung geschenkt.
-------------------------------------------------------------------------- */

function useReduzierteBewegung(): boolean {
  const [reduziert, setReduziert] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const setzen = () => setReduziert(mq.matches);
    setzen();
    mq.addEventListener("change", setzen);
    return () => mq.removeEventListener("change", setzen);
  }, []);
  return reduziert;
}

function useZaehler(ziel: number, dauerMs: number, sofort: boolean): number {
  const [wert, setWert] = useState(ziel);
  const aktuell = useRef(ziel);

  useEffect(() => {
    if (sofort || ziel < aktuell.current) {
      aktuell.current = ziel;
      setWert(ziel);
      return;
    }
    const von = aktuell.current;
    if (von === ziel) return;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / Math.max(1, dauerMs));
      const neu = von + (ziel - von) * p;
      aktuell.current = neu;
      setWert(neu);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ziel, dauerMs, sofort]);

  return wert;
}

function sek(n: number): string {
  return `${n.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} s`;
}

function schrittDauer(sekunden: number): number {
  return Math.min(2600, Math.max(950, sekunden * 800));
}

/* -------------------------------------------------------------------------- */

export function Lauf({ uc, mengen }: { uc: UseCase; mengen?: Mengengeruest }) {
  const werte = mengen ?? mengengeruest(uc);
  const reduziert = useReduzierteBewegung();
  const [aktiv, setAktiv] = useState(0);
  const [laeuft, setLaeuft] = useState(true);
  const [durchgang, setDurchgang] = useState(0);

  const stationen = uc.stationen;
  const letzte = stationen.length - 1;

  /** Zeitpunkt, zu dem jede Station beginnt bzw. endet. */
  const zeiten = useMemo(() => {
    let summe = 0;
    return stationen.map((s) => {
      const start = summe;
      summe += s.sekunden;
      return { start, ende: summe };
    });
  }, [stationen]);

  const dauer = schrittDauer(stationen[aktiv].sekunden);
  const uhr = useZaehler(zeiten[aktiv].ende, dauer, reduziert);

  useEffect(() => {
    if (!laeuft || aktiv >= letzte) {
      if (laeuft && aktiv >= letzte) setLaeuft(false);
      return;
    }
    const t = window.setTimeout(() => setAktiv((a) => a + 1), reduziert ? 260 : dauer);
    return () => window.clearTimeout(t);
  }, [aktiv, laeuft, letzte, dauer, reduziert, durchgang]);

  const neuStarten = useCallback(() => {
    setAktiv(0);
    setLaeuft(true);
    setDurchgang((d) => d + 1);
  }, []);

  const springe = useCallback((i: number) => {
    setAktiv(i);
    setLaeuft(false);
  }, []);

  const station = stationen[aktiv];
  const fertig = aktiv === letzte && !laeuft;

  return (
    <div className="grid gap-px overflow-hidden rounded-brand border border-stage-line bg-stage-line lg:grid-cols-[16.5rem_1fr]">
      {/* Schiene, kompakt - auf schmalen Geräten steht die Bühne im Vordergrund */}
      <div className="stage-grid p-5 sm:p-6 lg:hidden">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="t-eyebrow text-stage-muted">Laufzeit</p>
            <p className="t-mono mt-1 text-[1.9rem] leading-none text-accent-stage tabular-nums">
              {sek(uhr)}
            </p>
          </div>
          <p className="t-mono pb-1 text-right text-[0.68rem] leading-tight text-stage-muted">
            {aktiv + 1}/{stationen.length}
            <br />
            statt {manuellText(werte)}
          </p>
        </div>

        <div className="thin-scroll -mx-5 mt-5 overflow-x-auto px-5 sm:-mx-6 sm:px-6">
          <ol className="flex w-max gap-2">
            {stationen.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => springe(i)}
                  aria-current={i === aktiv ? "step" : undefined}
                  className={`flex items-center gap-2 rounded-brand-sm border px-3 py-2 transition-colors ${
                    i === aktiv
                      ? "border-accent text-stage-ink"
                      : "border-stage-line text-stage-muted"
                  }`}
                >
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      i <= aktiv ? "bg-accent" : "bg-stage-line"
                    }`}
                    aria-hidden
                  />
                  <span className="whitespace-nowrap text-[0.82rem]">{s.station}</span>
                  <span className="t-mono whitespace-nowrap text-[0.62rem] text-stage-muted">
                    {sek(zeiten[i].start)}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Schiene */}
      <div className="stage-grid hidden p-5 sm:p-6 lg:block">
        <div className="mb-5 flex items-baseline justify-between gap-3">
          <p className="t-eyebrow text-stage-muted">Stationen</p>
          <p className="t-mono text-[0.7rem] text-stage-muted">
            {aktiv + 1}/{stationen.length}
          </p>
        </div>

        <ol className="relative">
          <span
            className="absolute left-[5px] top-2 w-px bg-stage-line"
            style={{ height: "calc(100% - 1.5rem)" }}
            aria-hidden
          />
          <span
            className="absolute left-[5px] top-2 w-px bg-accent transition-[height] duration-500 ease-out"
            style={{ height: `calc((100% - 1.5rem) * ${letzte ? aktiv / letzte : 1})` }}
            aria-hidden
          />
          {stationen.map((s, i) => {
            const zustand = i < aktiv ? "erledigt" : i === aktiv ? "aktiv" : "offen";
            return (
              <li key={s.id} className="relative">
                <button
                  type="button"
                  onClick={() => springe(i)}
                  aria-current={zustand === "aktiv" ? "step" : undefined}
                  className="group flex w-full items-start gap-3 py-2 text-left"
                >
                  <span
                    className={[
                      "mt-[7px] h-[11px] w-[11px] shrink-0 rounded-full border transition-colors",
                      zustand === "offen"
                        ? "border-stage-line bg-stage"
                        : zustand === "erledigt"
                          ? "border-accent bg-accent"
                          : "border-accent bg-accent anim-ring",
                    ].join(" ")}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-[0.92rem] leading-tight transition-colors ${
                        zustand === "offen"
                          ? "text-stage-muted group-hover:text-stage-ink"
                          : "text-stage-ink"
                      }`}
                    >
                      {s.station}
                    </span>
                    <span className="t-mono block text-[0.66rem] text-stage-muted">
                      {sek(zeiten[i].start)}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 border-t border-stage-line pt-4">
          <p className="t-eyebrow text-stage-muted">Laufzeit</p>
          <p className="t-mono mt-1 text-[2rem] leading-none text-accent-stage tabular-nums">
            {sek(uhr)}
          </p>
          <p className="mt-2 text-[0.78rem] leading-snug text-stage-muted">
            Von Hand dauert derselbe Vorgang rund {manuellText(werte)}.
          </p>
        </div>
      </div>

      {/* Bühne */}
      <div className="flex min-h-[30rem] flex-col bg-stage">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stage-line px-5 py-4 sm:px-7">
          <div className="min-w-0">
            <p className="t-eyebrow text-accent-stage">{station.station}</p>
            <h2 className="mt-1.5 text-[1.15rem] font-semibold leading-snug text-stage-ink">
              {station.titel}
            </h2>
            <p className="mt-1 max-w-prose text-[0.88rem] leading-snug text-stage-muted">
              {station.detail}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            {!fertig ? (
              <button
                type="button"
                onClick={() => setLaeuft((l) => !l)}
                className="t-mono rounded-brand-sm border border-stage-line px-3 py-1.5 text-[0.7rem] text-stage-ink transition-colors hover:border-accent hover:text-accent-stage"
              >
                {laeuft ? "Anhalten" : "Weiter"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={neuStarten}
              className="t-mono rounded-brand-sm bg-primary px-3 py-1.5 text-[0.7rem] text-on-primary transition-opacity hover:opacity-90"
            >
              {fertig ? "Noch einmal" : "Neu starten"}
            </button>
          </div>
        </div>

        <div
          key={`${durchgang}-${aktiv}`}
          className="anim-rise flex flex-1 flex-col justify-center p-5 sm:p-7"
        >
          <BelegAnsicht beleg={station.beleg} />
        </div>

        {fertig ? (
          <div className="anim-rise border-t border-stage-line px-5 py-4 sm:px-7">
            <p className="t-eyebrow mb-1 text-accent-stage">Ergebnis</p>
            <p className="text-[0.95rem] leading-snug text-stage-ink">{uc.ergebnis}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Zeitvergleich: die eine Zahl, die Kunden im Kopf bleibt.
-------------------------------------------------------------------------- */

export function Zeitvergleich({
  uc,
  mengen,
  kompakt = false,
}: {
  uc: UseCase;
  mengen?: Mengengeruest;
  kompakt?: boolean;
}) {
  const werte = mengen ?? mengengeruest(uc);
  const manuellSek = werte.manuellMinuten * 60;
  const anteil = Math.max(0.7, (werte.autoSekunden / manuellSek) * 100);
  const stundenProJahr = ersparnisStunden(werte);

  return (
    <div className={kompakt ? "" : "rounded-brand border border-line bg-paper p-5 sm:p-6"}>
      <p className="t-eyebrow text-muted">Pro Vorgang</p>

      {/* Eine Leiste, nicht zwei: die ganze Breite ist die Handarbeit, das
          farbige Stück links ist, was davon übrig bleibt. */}
      <div className="mt-4">
        <div className="relative flex h-10 w-full items-center overflow-hidden rounded-brand-sm border border-line bg-line">
          <span
            className="absolute inset-y-0 left-0 bg-accent"
            style={{ width: `max(3px, ${anteil}%)` }}
            aria-hidden
          />
          <span className="t-mono absolute right-3 text-[0.82rem] text-ink">
            {manuellText(werte)} von Hand
          </span>
        </div>

        <div className="mt-2 flex items-start justify-between gap-4">
          <span className="flex items-start gap-2">
            <span className="h-4 w-px shrink-0 bg-accent" aria-hidden />
            <span className="t-mono text-[0.82rem] leading-none text-accent-text">
              {werte.autoSekunden} s bleiben automatisch
            </span>
          </span>
          <span className="t-mono shrink-0 text-[0.82rem] leading-none text-muted">
            {faktor(werte)}× schneller
          </span>
        </div>
      </div>

      {!kompakt ? (
        <p className="mt-5 border-t border-line pt-4 text-[0.86rem] leading-relaxed text-muted">
          {werte.geschaetzt ? "Angenommen: " : "Ihre "}
          {mengeText(werte)} am Tag ergeben rund{" "}
          <span className="font-semibold text-ink">
            {stundenProJahr.toLocaleString("de-DE")} Stunden
          </span>{" "}
          im Jahr, die nicht mehr anfallen.
          {werte.geschaetzt ? (
            <span className="mt-1 block text-[0.78rem] text-faint">
              Die Menge ist ein Erfahrungswert, kein Wert aus Ihrem Haus – im Gespräch rechnen wir
              mit Ihren Zahlen.
            </span>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}

/* --------------------------------------------------------------------------
   Leitstand: laeuft im Kopfbereich in Endlosschleife und zeigt in fuenf
   Sekunden, worum es geht - ohne dass jemand klicken muss.
-------------------------------------------------------------------------- */

export function Leitstand({ uc, mengen }: { uc: UseCase; mengen?: Mengengeruest }) {
  const werte = mengen ?? mengengeruest(uc);
  const reduziert = useReduzierteBewegung();
  const [aktiv, setAktiv] = useState(0);
  const stationen = uc.stationen;

  const zeiten = useMemo(() => {
    let summe = 0;
    return stationen.map((s) => {
      summe += s.sekunden;
      return summe;
    });
  }, [stationen]);

  const dauer = schrittDauer(stationen[aktiv].sekunden);
  const uhr = useZaehler(zeiten[aktiv], dauer, reduziert);

  useEffect(() => {
    if (reduziert) return;
    const t = window.setTimeout(
      () => setAktiv((a) => (a + 1) % stationen.length),
      aktiv === stationen.length - 1 ? 1800 : dauer,
    );
    return () => window.clearTimeout(t);
  }, [aktiv, dauer, stationen.length, reduziert]);

  return (
    <div className="stage-grid rounded-brand border border-stage-line p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="t-eyebrow text-stage-muted">Laufender Vorgang</p>
          <p className="mt-1 truncate text-[0.95rem] text-stage-ink">{uc.name}</p>
        </div>
        <span className="t-mono shrink-0 rounded-brand-sm border border-accent px-2 py-0.5 text-[0.62rem] uppercase tracking-[0.14em] text-accent-stage">
          live
        </span>
      </div>

      <div className="mt-7 flex items-end gap-4">
        <span className="t-mono text-[3.2rem] font-medium leading-none text-accent-stage tabular-nums sm:text-[4rem]">
          {sek(uhr)}
        </span>
        <span className="pb-2 text-[0.8rem] leading-tight text-stage-muted">
          statt {manuellText(werte)}
          <br />
          von Hand
        </span>
      </div>

      <ol className="mt-7 space-y-px">
        {stationen.map((s, i) => (
          <li
            key={s.id}
            className={`flex items-baseline gap-3 border-l-2 py-1.5 pl-3 transition-colors ${
              i === aktiv
                ? "border-accent"
                : i < aktiv
                  ? "border-stage-line"
                  : "border-transparent"
            }`}
          >
            <span className="t-mono w-12 shrink-0 text-[0.66rem] text-stage-muted">
              {sek(zeiten[i])}
            </span>
            <span
              className={`text-[0.88rem] transition-colors ${
                i === aktiv ? "text-stage-ink" : i < aktiv ? "text-stage-muted" : "text-stage-muted/50"
              }`}
            >
              {s.titel}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Streifen: die Schiene als schmale Vorschau - auf Karten und im Kopfbereich.
-------------------------------------------------------------------------- */

export function LaufStreifen({
  uc,
  auto = false,
  intervall = 1400,
}: {
  uc: UseCase;
  auto?: boolean;
  intervall?: number;
}) {
  const reduziert = useReduzierteBewegung();
  const [aktiv, setAktiv] = useState(0);
  const anzahl = uc.stationen.length;

  useEffect(() => {
    if (!auto || reduziert) return;
    const t = window.setInterval(() => setAktiv((a) => (a + 1) % anzahl), intervall);
    return () => window.clearInterval(t);
  }, [auto, anzahl, intervall, reduziert]);

  return (
    <div className="w-full">
      <div className="relative flex items-center">
        <span className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-line" aria-hidden />
        <span
          className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-accent transition-[width] duration-500 ease-out"
          style={{ width: `${anzahl > 1 ? (aktiv / (anzahl - 1)) * 100 : 100}%` }}
          aria-hidden
        />
        <ul className="relative flex w-full justify-between">
          {uc.stationen.map((s, i) => (
            <li key={s.id} className="flex flex-col items-center">
              <span
                className={`h-2 w-2 rounded-full border transition-colors ${
                  i <= aktiv ? "border-accent bg-accent" : "border-line bg-paper"
                }`}
                aria-hidden
              />
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-2.5 flex justify-between gap-1">
        {uc.stationen.map((s, i) => (
          <span
            key={s.id}
            className={`t-mono truncate text-[0.6rem] uppercase tracking-[0.1em] transition-colors ${
              i === aktiv ? "text-accent-text" : "text-faint"
            }`}
          >
            {s.station}
          </span>
        ))}
      </div>
    </div>
  );
}
