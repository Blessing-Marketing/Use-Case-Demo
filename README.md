# Demo-System

Kundenspezifische Demos für Automatisierungs-Abläufe. Die Abläufe sind für alle Kunden dieselben,
getauscht wird nur das Erscheinungsbild. Ein neuer Kunde ist eine JSON-Datei, ein neuer Ablauf eine
TypeScript-Datei – beides ohne Eingriff in die Oberfläche.

## Was der Kunde sieht

| Seite | Adresse | Inhalt |
| --- | --- | --- |
| Übersicht | `/kunde/<kürzel>` | Kopfbereich mit laufendem Vorgang, ausgewählte Abläufe als Karten |
| Ablauf | `/kunde/<kürzel>/<ablauf>` | Der Lauf über die Stationen, Zeitvergleich, Nutzen |

Jeder Ablauf läuft als **Lauf**: ein Vorgang wandert über Stationen, eine Uhr läuft mit, daneben
steht die Dauer derselben Arbeit von Hand. Das ist das wiederkehrende Element des Systems – jeder
neue Ablauf bekommt es geschenkt.

## Was der Vertrieb benutzt

| Seite | Adresse | Zweck |
| --- | --- | --- |
| Interne Übersicht | `/` | Alle angelegten Demos |
| Studio | `/studio` | Kunden einrichten, Vorschau, Export |
| Vorschau | `/vorschau?b=…` | Teilbarer Entwurf, ohne Veröffentlichung |

## Kunden anlegen

1. `/studio` öffnen, Kundenwebsite eintragen, **Übernehmen**.
   Gelesen werden Firmenname, Logo, Markenfarben und Schriften. Alles bleibt änderbar.
2. Farben und Schriften prüfen. Gefundene Farben lassen sich anklicken – vorher oben auswählen,
   welches Feld sie füllen sollen.
3. Abläufe auswählen. Die Reihenfolge folgt der Auswahl, keine Auswahl bedeutet: alle.
   Je ausgewähltem Ablauf lassen sich die **Mengen des Kunden** eintragen (siehe unten).
4. Verschicken:
   - **Sofort:** *Vorschau-Link kopieren*. Die komplette Marke steckt in der Adresse, es muss
     nichts gespeichert oder veröffentlicht werden.
   - **Dauerhaft:** *Kunde speichern*. Legt `content/kunden/<kürzel>.json` an, die Demo läuft
     danach unter `/kunde/<kürzel>` und erscheint in der Übersicht. Zum Veröffentlichen die Datei
     mit einchecken.

Speichern schreibt eine Datei und geht deshalb nur dort, wo das Dateisystem beschreibbar ist:
lokal beim `npm run dev`, oder auf einem eigenen Server mit `DEMO_STUDIO_SCHREIBEN=1`. Auf Vercel
ist das Dateisystem zur Laufzeit schreibgeschützt – dort ist der Knopf abgeschaltet und der Weg
führt über *JSON laden* und Einchecken. Das Studio sagt das im Abschnitt „Fertig – und jetzt?"
jeweils dazu.

### Kunden ändern und löschen

Abschnitt 00 im Studio listet alle angelegten Kunden. Ein Klick lädt einen in das Formular –
*Kunde speichern* überschreibt ihn dann. *löschen* fragt einmal nach und entfernt die Datei.
*neu anfangen* oben neben dem Titel setzt das Formular zurück.

Beim Anlegen wird die Herkunfts-Adresse als `quelle` mitgespeichert. Deshalb steht sie beim
Bearbeiten wieder im Feld, und *Neu einlesen* holt die Fundsachen zurück – Logo-Vorschläge,
Schriftkandidaten und die anklickbare Farbpalette. Name und Kürzel bleiben dabei unangetastet,
Farben, Schriften und Logo werden überschrieben.

Die gleichen Operationen stehen als API bereit: `GET`/`POST /api/kunden` und
`GET`/`DELETE /api/kunden/<kürzel>`. Schreiben und Löschen unterliegen derselben Einschränkung wie
das Speichern (siehe unten).

### Mengen und die Schätzungs-Kennzeichnung

Die Zahlen in den Ablaufdateien – Minuten von Hand, Vorgänge pro Tag – sind **Erfahrungswerte für
einen typischen Mittelständler, keine Messwerte**. Daraus entsteht die Hochrechnung „X Stunden im
Jahr" auf der Kundenseite.

Solange nichts anderes eingetragen ist, weist die Seite das offen aus: das Zahlenband zeigt `≈`
und ein Feld **Schätzung**, der Zeitvergleich schreibt „Angenommen: 60 Belege am Tag" und
darunter, dass es ein Erfahrungswert ist. Trägt der Vertrieb im Studio die echten Mengen des
Kunden ein (beide Felder je Ablauf), verschwindet die Kennzeichnung und der Text lautet „Ihre 120
Belege am Tag". Zusätzlich lassen sich die Arbeitstage im Jahr setzen (Vorgabe 220).

Gerechnet wird an genau einer Stelle: [lib/kennzahlen.ts](lib/kennzahlen.ts).

### Was die Website-Erfassung leistet

Serverseitiges Auslesen von HTML und Stylesheets – ohne Browser, ohne Schlüssel:

- **Farben** aus CSS-Variablen mit sprechendem Namen (`--brand-primary`), `theme-color` und
  Regeln für Schaltflächen, Kopfbereich und Navigation. Häufigkeit allein entscheidet nicht.
- **Schriften** aus Google-Fonts-Einbindungen, `@font-face` und `font-family`. Icon-, System- und
  Unsinnstreffer werden aussortiert. Übernommen wird nur, was im Register
  ([lib/schriften.ts](lib/schriften.ts), 22 Schriften) steht – erkannte Hausschriften wie
  „DINWebPro" erscheinen im Studio durchgestrichen. Sie werden **nicht** von einem fremden Server
  nachgeladen: Kundenseiten liefern alle Schriften von der eigenen Domain, damit keine
  Besucher-IP an Google geht.
- **Logo** bewertet statt bloß gesammelt: Wortmarken vor App-Icons, SVG vor PNG vor JPG,
  Favicons und Teilen-Vorschaubilder ganz hinten. Ausgeliefert wird über `/api/bild`, damit
  Hotlink-Sperren die Demo nicht zerschießen.

Interne und private Adressen werden abgewiesen.

## Neuen Ablauf anlegen

Ein Ablauf ist eine reine Datendatei. Kein React, keine Oberflächenänderung.

1. `lib/usecases/posteingang.ts` kopieren und umbenennen.
2. Texte, Kennzahlen und Stationen ersetzen. Jede Station bekommt einen **Beleg** – die
   Darstellung ergibt sich aus dessen Art:

   | `art` | Darstellung |
   | --- | --- |
   | `mail` | E-Mail auf hellem Blatt |
   | `felder` | Ausgelesene Feld-Wert-Paare |
   | `pruefung` | Prüfpunkte mit Ampel (`ok`, `warnung`, `info`) |
   | `dokument` | Angebot oder Rechnung mit Summe |
   | `tabelle` | Abgleich mehrerer Stände |
   | `uebergabe` | Weitergabe in ein Zielsystem |
   | `bewertung` | Punktwert mit Begründung |
   | `dialog` | Frage und Antwortentwurf, optional mit Quellen |
   | `dateien` | Dokumentenliste |
   | `notiz` | Offener Punkt |

3. In `lib/usecases/index.ts` importieren und in `ALLE_USE_CASES` eintragen.

Ab dann steht der Ablauf jedem Kunden zur Auswahl – auch den bereits angelegten.

### Prompt für einen neuen Ablauf

> Erstelle eine neue Datei nach dem Vorbild von `lib/usecases/posteingang.ts` für den Ablauf
> „&lt;Beschreibung&gt;“. Halte dich an den Typ `UseCase` aus `lib/usecases/typen.ts`.
> Fünf bis sieben Stationen, `sekunden` ergeben zusammen etwa `autoSekunden`.
> Deutsche Alltagssprache, keine Fachbegriffe, erfundene aber realistische Daten mit deutschen
> Namen und Beträgen. `manuellMinuten` und `menge.proTag` konservativ schätzen.
> Danach in `lib/usecases/index.ts` eintragen.

## Marke

Eine Kundendatei braucht Name und Primärfarbe – alles Weitere wird abgeleitet.

```json
{
  "slug": "musterfirma",
  "name": "Musterfirma GmbH",
  "farben": { "primaer": "#0c6b5e" }
}
```

Vollständig sind zusätzlich möglich: `branche`, `logo` (`text` oder `bild` + `hoehe`),
`farben.akzent` / `.ink` / `.flaeche` / `.papier` / `.buehne`, `schriften`, `radius`, `texte`,
`kontakt`, `useCases`. Ist `flaeche` dunkel, kippt das gesamte System auf dunkel – siehe
`content/kunden/voltana.json`.

Farben werden nie hart in Komponenten geschrieben. Alles läuft über die Tokens in
`app/globals.css`; die Marke setzt sie als CSS-Variablen auf einen Wrapper. Deshalb kostet ein
Kundenwechsel genau eine Datei.

## Struktur

```text
app/                     Routen
  kunde/[slug]/          Kundendemo
  vorschau/              Teilbarer Entwurf aus der Adresse
  studio/                Einrichtung
  api/marke-erfassen/    Website auslesen
  api/bild/              Logos durchreichen
components/              Lauf, Belege, Karten, Studio
content/kunden/*.json    Kunden
lib/usecases/*.ts        Abläufe
lib/marke.ts             Marke auflösen und kodieren
lib/erfassen.ts          Website auswerten
```

## Barrierefreiheit und Kontrast

Markenfarben sind nicht für Text gemacht. Deshalb werden die Textfarben in
[aufloesen()](lib/marke.ts) je Kunde berechnet statt fest gemischt: `muted`, `faint` und der
Akzent als Beschriftung erreichen für **jede** Kundenfarbe mindestens 4,5:1 (WCAG AA), geprüft
gegen Grundfläche und Karte. Flächen (`bg-accent`) behalten die ungefilterte Markenfarbe.

Gemessen über alle sechs Kunden und elf Seiten: 1.068 Textknoten, keine Unterschreitung.

## Entwicklung

```bash
npm run dev     # http://localhost:3000
npm test        # 116 Tests, unter einer Sekunde
npm run build
```

Die Tests decken den SSRF-Schutz (Adressbereiche), die Heuristiken der Website-Erfassung, die
Hochrechnungen, die Kontrastberechnung und die Inhalte der Abläufe ab – darunter die Prüfung, dass
die angegebene Laufzeit zur Summe der Stationsdauern passt.

Eine unbrauchbare Datei in `content/kunden/` legt nichts lahm: sie wird übersprungen und in der
Übersicht sowie im Studio gemeldet.

## Wo die Daten liegen

Kunden werden im Studio angelegt und liegen als JSON. **Sie sind von der Versionsverwaltung
ausgeschlossen** – im Repo stehen nur die vier erfundenen Beispielkunden. Kopierte Logos ebenso.

| | lokal | im Container |
| --- | --- | --- |
| Kunden | `content/kunden/` | `$DEMO_DATEN_PFAD/kunden/` |
| Logos | `content/logos/` | `$DEMO_DATEN_PFAD/logos/` |

Keine Seite wird vorgerendert. Ein Kunde, der im laufenden Betrieb angelegt oder geändert wird,
ist sofort aktuell – ohne Neubau.

## Betrieb auf einem eigenen Server (Coolify)

Im Repo liegt ein `Dockerfile` (Next im Standalone-Modus). In Coolify als Docker-Anwendung
anlegen, dann:

**Volume einhängen** – ohne das sind alle angelegten Kunden beim nächsten Deploy weg:

```text
/daten   →   dauerhaftes Volume
```

**Umgebungsvariablen:**

| Variable | Wert | Wirkung |
| --- | --- | --- |
| `DEMO_DATEN_PFAD` | `/daten` | Kunden und Logos im Volume statt im Abbild. Fehlt sie, warnt das Studio sichtbar. |
| `DEMO_STUDIO_SCHREIBEN` | `1` | Erlaubt dem Studio das Anlegen und Löschen. Ohne sie ist es nur lesend. |
| `DEMO_PASSWORT` | frei wählen | Zugang zum internen Bereich. **Fehlt sie im Produktionsbetrieb, sind die internen Seiten gesperrt** (503), nicht etwa offen. |

Das Abbild setzt `DEMO_DATEN_PFAD` und `DEMO_STUDIO_SCHREIBEN` bereits vor; nötig ist nur das
Volume und das Passwort. Der Container läuft als Benutzer `weiter` (UID 1001) – das Volume muss
für ihn beschreibbar sein.

### Was offen ist und was nicht

[proxy.ts](proxy.ts) verlangt für alles ein Passwort, **außer**:

- `/kunde/…` – die verschickte Demo
- `/vorschau…` – der teilbare Entwurf
- `/logos/…` und `/api/bild` – die Logos auf diesen Seiten

Gesperrt sind damit die Übersicht aller Kunden, das Studio und die Erfassungs-Route. Innerhalb
einer Kundendemo führt ohnehin kein Link zu einem anderen Kunden – dort gibt es nur Abläufe
derselben Marke, `mailto:` und einen Seitenanker.

**Kundenkürzel sind ratbar.** Sie stammen aus der Domain: `festool.de` wird zu
`/kunde/festool`. Wer wissen will, ob eine bestimmte Firma eine Demo bekommen hat, tippt den Namen
ein. Solange das stört, ist der Vorschau-Link die Alternative – dessen kodierter Block ist nicht
zu erraten.

### Noch offen

`/api/bild` weist interne Adressen, Weiterleitungen ins interne Netz und fremde Schemata ab, nimmt
aber beliebige öffentliche Bildadressen an – es muss offen bleiben, damit Vorschau-Links
funktionieren. Auf einem erreichbaren Server ist das ein offener Bild-Proxy: fremde Bilder über
die eigene Domain, auf eigene Bandbreite. Lösung wäre, die Adressen serverseitig mit einem HMAC zu
unterschreiben und nur unterschriebene anzunehmen.

Alle in den Demos gezeigten Daten sind erfunden. Es gibt keine Anbindung an Kundensysteme.
