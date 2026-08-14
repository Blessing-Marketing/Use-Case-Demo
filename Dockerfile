# Betrieb im Container, z. B. über Coolify auf einem eigenen Server.
#
# Wichtig: Kundendaten liegen im Volume unter DEMO_DATEN_PFAD. Ohne Volume
# sind alle angelegten Kunden beim nächsten Deploy weg, weil das Abbild neu
# gebaut wird.

FROM node:24-alpine AS abhaengigkeiten
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS bauen
WORKDIR /app
COPY --from=abhaengigkeiten /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:24-alpine AS betrieb
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    DEMO_DATEN_PFAD=/daten \
    DEMO_STUDIO_SCHREIBEN=1

RUN addgroup -g 1001 -S knoten \
    && adduser -S weiter -u 1001 \
    && mkdir -p /daten/kunden /daten/logos \
    && chown -R weiter:knoten /daten

COPY --from=bauen /app/public ./public
COPY --from=bauen --chown=weiter:knoten /app/.next/standalone ./
COPY --from=bauen --chown=weiter:knoten /app/.next/static ./.next/static

USER weiter
EXPOSE 3000

# Ohne diesen Endpunkt würde ein Healthcheck auf "/" landen und dort 401 oder
# 503 bekommen - der Container gälte als ungesund und bekäme keine Route.
#
# Der Port darf nicht fest stehen: die Betriebsumgebung gibt über PORT einen
# eigenen vor (Coolify etwa 3001). Ein fest verdrahteter Healthcheck fragt dann
# den falschen Port und meldet "Connection refused", obwohl alles läuft.
HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
    CMD wget -q -O /dev/null "http://127.0.0.1:${PORT:-3000}/api/gesundheit" || exit 1

# HOSTNAME wird hier gesetzt und nicht per ENV: Docker belegt die Variable im
# Container selbst mit der Container-Kennung, und der Next-Server bindet genau
# darauf. Er läuft dann zwar, ist über 127.0.0.1 aber nicht erreichbar - der
# Healthcheck scheitert und es kommt gar keine Route zustande.
# exec, damit node PID 1 wird und Stop-Signale sauber bekommt.
CMD ["sh", "-c", "HOSTNAME=0.0.0.0 exec node server.js"]
