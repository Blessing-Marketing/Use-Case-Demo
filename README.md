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
  logos/[datei]/         Kopierte Kundenlogos ausliefern
  api/marke-erfassen/    Website auslesen
  api/bild/              Logos durchreichen
  api/kunden/            Kunden lesen, anlegen, löschen
  api/gesundheit/        Lebenszeichen für den Healthcheck
  not-found.tsx          Fehlerseite für unbekannte Adressen
  icon.png               Favicon, siehe unten
components/              Lauf, Belege, Karten, Studio
content/kunden/*.json    Kunden
lib/usecases/*.ts        Abläufe
lib/marke.ts             Marke auflösen und kodieren
lib/erfassen.ts          Website auswerten
lib/kennzahlen.ts        Hochrechnungen
lib/zugang.ts            Anmeldung prüfen
proxy.ts                 Zugangsschutz
```

### Symbol im Browser-Tab

Das Signet von Blessing Solutions, auf allen Seiten gleich – auch auf den Kundendemos. Dort trägt
zwar der Inhalt die Farben des Kunden, das Tab-Symbol bleibt aber unseres: die Demo kommt sichtbar
von uns, und ein fremdes Logo im Tab wäre eine Anmaßung.

| Datei | Zweck |
| --- | --- |
| `app/icon.png` | 256 px, transparent – der Normalfall |
| `app/favicon.ico` | dieselbe Grafik im ICO-Container, für Browser, die stur `/favicon.ico` abfragen |
| `app/apple-icon.jpg` | 180 px mit weißem Grund fürs iOS-Startbild; transparente Symbole werden dort sonst schwarz hinterlegt |

Zum Austauschen genügt es, die Dateien zu ersetzen – Next bindet sie von allein ein.

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
| `DEMO_BENUTZER` | optional | Benutzername für die Anmeldung. Ohne die Variable zählt allein das Passwort, im Anmeldedialog darf dann ein beliebiger Name stehen. |

Das Abbild setzt `DEMO_DATEN_PFAD` und `DEMO_STUDIO_SCHREIBEN` bereits vor; nötig ist nur das
Volume und das Passwort. Der Container läuft als Benutzer `weiter` (UID 1001) – das Volume muss
für ihn beschreibbar sein.

**Healthcheck:** `/api/gesundheit` – ohne Passwort erreichbar, antwortet immer mit 200. Prüft die
Betriebsumgebung stattdessen `/`, bekommt sie 401 oder 503, hält den Container für ungesund und
hängt keine Route ein. Das Ergebnis wäre ein 404 im Browser.

### Bei 404 nach dem Deploy

Erst feststellen, wessen 404 das ist – beim Aufruf der nackten Domain:

| Was im Browser steht | Bedeutung |
| --- | --- |
| Passwortabfrage erscheint | Alles in Ordnung, die Anwendung läuft. |
| „Kein Zugang eingerichtet …" | Läuft, aber `DEMO_PASSWORT` fehlt. |
| Schlichtes `404 page not found` | **Traefik kennt die Route nicht.** Die Anwendung wird gar nicht erreicht. |
| Gestaltete 404-Seite im Kundendesign | Die Anwendung läuft, nur dieser Pfad existiert nicht. |

Beim Traefik-404 der Reihe nach: Domain im Coolify-Projekt eingetragen und DNS zeigt auf die VPS?
Container läuft und gilt als gesund? Als Build Pack **Dockerfile** gewählt – bei Nixpacks wird das
`Dockerfile` samt seiner Vorgaben ignoriert, dann müssen `DEMO_DATEN_PFAD` und
`DEMO_STUDIO_SCHREIBEN` von Hand gesetzt werden.

**Gesunder Container und trotzdem 404?** Dann fehlt das Zertifikat. Nachsehen, was der Server
ausliefert:

```bash
echo | openssl s_client -connect <domain>:443 -servername <domain> 2>/dev/null \
  | openssl x509 -noout -subject -issuer
```

Steht dort `CN=TRAEFIK DEFAULT CERT`, konnte Let's Encrypt kein Zertifikat ausstellen. Es gibt
dann keinen HTTPS-Router für den Host, während die HTTP-Adresse per 301 genau dorthin weiterleitet
– die Weiterleitung läuft ins Leere.

Typischer Auslöser sind die von Coolify vergebenen `*.sslip.io`-Adressen. Abhilfe ist eine echte
Domain: einen A-Eintrag wie `demo.example.de` auf die VPS zeigen lassen und in Coolify eintragen.
Das ist ohnehin nötig, denn eine Adresse wie `azr7dp…187.77.79.4.sslip.io` klickt kein Kunde an.

`Force HTTPS` abzuschalten hilft für einen schnellen Test, taugt aber nicht dauerhaft: der
Zugangsschutz arbeitet mit Basic Auth, und die überträgt das Passwort über HTTP im Klartext.

Zwei Fallen führen zu genau diesem 404, obwohl Build und Anwendung in Ordnung sind. Beide sind
im `Dockerfile` behandelt, hier zum Nachlesen:

**`HOSTNAME`** wird von Docker im Container mit der Container-Kennung belegt, und der Next-Server
bindet genau darauf. Er läuft dann zwar und meldet „Ready", ist über `127.0.0.1` aber nicht
erreichbar. Deshalb setzt der Startbefehl `HOSTNAME=0.0.0.0` selbst – eine Vorgabe per `ENV` würde
von der Betriebsumgebung überstimmt.

**`PORT`** gibt die Betriebsumgebung vor, Coolify etwa `3001`. Der Healthcheck darf ihn daher
nicht fest verdrahten, sonst fragt er den falschen Port. Er liest `${PORT:-3000}`.

Beide Male ist das Symptom dasselbe: `wget: can't connect to remote host (127.0.0.1):
Connection refused` in den Healthcheck-Logs, während die Container-Logs „Ready" zeigen. Steht in
den Container-Logs eine andere Portnummer als im Healthcheck, ist es die zweite Falle.

Direkt am Container vorbei prüfen, ob die Anwendung selbst läuft:

```bash
docker exec -it <container> wget -qO- http://127.0.0.1:3000/api/gesundheit
```

### Was offen ist und was nicht

[proxy.ts](proxy.ts) verlangt für alles ein Passwort, **außer**:

- `/kunde/…` – die verschickte Demo
- `/vorschau…` – der teilbare Entwurf
- `/logos/…` und `/api/bild` – die Logos auf diesen Seiten

Gesperrt sind damit die Übersicht aller Kunden, das Studio und die Erfassungs-Route. Innerhalb
einer Kundendemo führt ohnehin kein Link zu einem anderen Kunden – dort gibt es nur Abläufe
derselben Marke, `mailto:` und einen Seitenanker.

**Kundenadressen sind nicht zu erraten.** An das Kürzel kommt beim Erfassen ein Zufallszusatz:
aus `festool.de` wird `/kunde/festool-jbr9de`. Lesbar und verschickbar, aber der Firmenname allein
öffnet nichts – wichtig, weil Kundendemos ohne Passwort erreichbar sein müssen. Die sechs Zeichen
meiden `0`, `O`, `1`, `l` und `I`, damit die Adresse auch am Telefon vorlesbar bleibt.

Im Studio lässt sich der Zusatz per Knopf entfernen oder neu würfeln; beim Bearbeiten eines
bestehenden Kunden bleibt das Kürzel unverändert.

### Noch offen

`/api/bild` weist interne Adressen, Weiterleitungen ins interne Netz und fremde Schemata ab, nimmt
aber beliebige öffentliche Bildadressen an – es muss offen bleiben, damit Vorschau-Links
funktionieren. Auf einem erreichbaren Server ist das ein offener Bild-Proxy: fremde Bilder über
die eigene Domain, auf eigene Bandbreite. Lösung wäre, die Adressen serverseitig mit einem HMAC zu
unterschreiben und nur unterschriebene anzunehmen.

Alle in den Demos gezeigten Daten sind erfunden. Es gibt keine Anbindung an Kundensysteme.
