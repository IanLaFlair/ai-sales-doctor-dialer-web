# AI Sales Dialer — Frontend (React + Vite)

A two-screen single-page app for the **Advanced** dialer exercise. It talks to the
Node/Express backend over HTTP and **polls** for live updates (no WebSockets).

- **Screen 1 — Leads + session creation:** list seeded leads, select with checkboxes,
  create a dialer session.
- **Screen 2 — Dialer session:** two live line cards, winner indicator, session metrics,
  per-call CRM sync status. Polls `GET /sessions/:id` every **1.5s**.

Plain JavaScript, plain `fetch`, no state library, no router (screens switch via state).
One hand-written stylesheet (`src/styles.css`).

---

## Configuration

The backend base URL comes from `VITE_API_URL`.

> ⚠️ **`VITE_API_URL` is baked in at _build time_**, not read at runtime. You must set it
> when running `vite build` — changing it later means rebuilding.

```bash
cp .env.example .env   # then edit if needed
# .env
VITE_API_URL=http://localhost:4000
```

---

## Run locally

```bash
npm install
VITE_API_URL=http://localhost:4000 npm run dev    # http://localhost:5173
```

If the backend is unreachable, the UI shows a banner naming the `VITE_API_URL` it tried.

---

## Build

```bash
# point at the backend subdomain at build time:
VITE_API_URL=https://dialer-api.<DOMAIN> npm run build   # -> dist/
```

Output is a static bundle in `dist/`.

---

## Deploy on the VPS (static build, HTTPS subdomain via Caddy)

Served at `https://dialer.<DOMAIN>` through the existing Caddy (Docker); it calls
`https://dialer-api.<DOMAIN>`. Both ends are HTTPS → no mixed-content issues and polling
works fine. Only Caddy's 80/443 are public.

```bash
VITE_API_URL=https://dialer-api.<DOMAIN> npm run build
mkdir -p ~/app/sales-dialer-fe && cp -r dist ~/app/sales-dialer-fe/dist
```

### Option A (recommended) — Caddy serves the static files

Mount the build into the Caddy container (e.g. compose volume
`~/app/sales-dialer-fe/dist:/srv/dialer:ro`):

```caddy
dialer.<DOMAIN> {
    root * /srv/dialer
    file_server
    try_files {path} /index.html       # SPA fallback
}
```

### Option B — `serve` under pm2, Caddy reverse-proxies it

```bash
npm i -g serve
pm2 start "serve -s ~/app/sales-dialer-fe/dist -l 5174" --name dialer-fe
pm2 save
```

```caddy
dialer.<DOMAIN> {
    reverse_proxy host.docker.internal:5174
}
```

Needs `extra_hosts: ["host.docker.internal:host-gateway"]` on the Caddy compose service.
Port **5174** avoids clashing with the Basic FE on 5173 if you use Option B for both.

After editing Caddy, reload it, then open `https://dialer.<DOMAIN>`.

### Backend checklist

- Backend `ALLOWED_ORIGINS` must include `https://dialer.<DOMAIN>`.
- Remember: `VITE_API_URL` is **build-time** — rebuild if the backend address changes.

---

## Backend contract

Base URL = `VITE_API_URL` (default `http://localhost:4000`).

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `GET`  | `/leads` | `Lead[]` — `{ id, name, company, phone, email, crmExternalId }` |
| `POST` | `/sessions` | body `{ agentId, leadIds }` → session view |
| `POST` | `/sessions/:id/start` | → session view |
| `POST` | `/sessions/:id/stop` | → session view |
| `GET`  | `/sessions/:id` | session view (polled every 1.5s) |

Call statuses: `RINGING | CONNECTED | NO_ANSWER | BUSY | VOICEMAIL | CANCELED_BY_DIALER`.
Status colors — CONNECTED green, RINGING neutral, NO_ANSWER/BUSY/VOICEMAIL amber,
CANCELED_BY_DIALER red.

---

## Project layout

```
.
├── index.html
├── package.json
├── vite.config.js
├── .env.example
└── src/
    ├── main.jsx
    ├── App.jsx              # screen switch via state
    ├── api.js              # fetch wrapper around VITE_API_URL
    ├── styles.css
    └── components/
        ├── LeadsScreen.jsx
        ├── SessionScreen.jsx   # polling lives here (useEffect + useRef)
        ├── LineCard.jsx
        ├── StatusBadge.jsx
        └── ErrorBanner.jsx
```
