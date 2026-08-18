# Heat Risk Command Center

A hyperlocal urban heat risk dashboard for Tamil Nadu, India — built for **FortyGuard
Hackathon'26** (track: **Dashboards**, with **AI Agents** and **Interactive Maps** embedded).

## The concept

Two places, same climate belt, same heatwave, wildly different exposed population:

| | Tiruchirappalli (Trichy) | Tirupattur |
|---|---|---|
| Type | High-density city | Low-density town |
| Population (2011 census) | 847,387 | 83,612 |
| Coordinates | 10.8155, 78.6965 | 12.4927, 78.5681 |

Both sit in Tamil Nadu's hot interior belt and both crossed 40°C in the April–May 2026
heatwave events. Climate is held roughly constant across the two; **population is the
deliberate variable**. The comparison panel at the top of the dashboard is built to make that
point to a judge within about 30 seconds, without any explanation needed.

## How the data flows

1. **FortyGuard Temperature API** (primary) — `POST /v1/heatmap` with a small ~4–5 km² polygon
   around each city center, real-time filter. This call is async: it returns an `activity_id`,
   which the app then polls for the finished reading.
2. **Open-Meteo** (automatic fallback, and always used for the 24h trend line) — free, no key,
   used whenever FortyGuard returns sparse/empty data or the request fails outright, so the
   dashboard never breaks live on stage.
3. **Gemini API** (AI agent layer) — takes the raw reading for each zone and writes one grounded,
   plain-English risk paragraph + a concrete action, referencing outdoor/informal-settlement
   exposure and Tamil Nadu's official heatwave-disaster protocols. If no Gemini key is set, or
   the call fails, the app falls back to a locally-written paragraph in the same voice so the
   alert feed is never blank.

Both API calls run per zone on load and again every 10 minutes, plus a manual "Refresh now"
button in the header.

### ⚠️ One thing to verify before your demo

FortyGuard's public site confirms the **submission** call exactly:
`POST https://api.fortyguard.com/v1/heatmap` with `polygon_aoi` / `date_time` / `granularity`,
returning `{ data: { activity_id } }`. The **result-polling endpoint and response shape** live
behind FortyGuard's signed-in hackathon developer portal, which wasn't reachable while building
this, so `src/services/fortyguard.js` makes a clearly-labeled best-effort guess
(`GET /v1/heatmap/:activityId`) and parses a few plausible result shapes defensively. If your
actual docs show something different, that's the one file to edit — nothing downstream cares,
because the rest of the app only consumes `{ tempNow }`. Worst case if it's wrong: the app just
falls through to the Open-Meteo path automatically, which is exactly the resilience behavior the
brief asked for.

## Required features, and where they live

- **Top stats bar** — current temp, risk level, zones flagged, side by side (`StatsBar.jsx`)
- **Interactive map** — Leaflet + OpenStreetMap tiles, color-coded markers, red/amber/yellow/teal
  by risk tier (`MapView.jsx`)
- **24-hour trend chart** — one line per city, Recharts (`TrendChart.jsx`)
- **AI agent alert feed** — Gemini-generated summary per zone with timestamp (`AlertFeed.jsx`)
- **Comparison panel** — the visual centerpiece: population bars, ~10× callout, shared heatwave
  context (`ComparisonPanel.jsx`)
- **Bonus: nearby-town drill-down** — Thuraiyur, Manapparai, Lalgudi, Musiri, Srirangam (near
  Trichy) and Ambur, Vaniyambadi (near Tirupattur), on-demand via Open-Meteo only, so it never
  spends FortyGuard credits (`NearbyTowns.jsx`)

Risk bands (`services/riskModel.js`) are simplified absolute-temperature thresholds for demo
legibility — **not** the official IMD heatwave criteria, which are defined by departure from
local normal rather than an absolute cutoff. Worth a caveat if you're presenting to a technical
judge.

## Run it locally

```bash
npm install
cp .env.example .env
# edit .env and paste in your two keys
npm run dev
```

Environment variables (in `.env`, both optional — the app degrades gracefully without either):

```
VITE_FORTYGUARD_API_KEY=your_fortyguard_key
VITE_GEMINI_API_KEY=your_gemini_key
```

Get them from:
- FortyGuard: fortyguard.com/hackathon26 → developer portal
- Gemini: aistudio.google.com → "Get API key" (free tier)

## Deploy

Static Vite build — works on Vercel or Netlify with zero extra config. Set the same two
`VITE_...` environment variables in your project's dashboard before deploying.

```bash
npm run build   # outputs to dist/
```

## Stack

React 18 (functional components + hooks) · Tailwind CSS · Leaflet / react-leaflet · Recharts ·
Vite. No backend — every API call is made directly from the client, which is fine for a hackathon
demo but means your API keys are visible in the browser bundle. For a production deployment,
proxy the FortyGuard and Gemini calls through a small server so the keys aren't exposed
client-side.
