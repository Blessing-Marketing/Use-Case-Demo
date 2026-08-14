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
    HOSTNAME=0.0.0.0 \
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

CMD ["node", "server.js"]
