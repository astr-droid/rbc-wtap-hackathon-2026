# Compass proof of concept

A clickable proof of concept for the RBC early talent hackathon. One map, three zoom levels: **Me** (student), **My team** (manager), **The cohort** (program team). All data is simulated. See [BRIEF.md](BRIEF.md) for the idea and pitch.

## Run it

```powershell
npm install
npm run dev
```

Open http://localhost:5173. `npm run build` makes a static copy in `dist/` for a backup demo.

## Demo path

1. **Me:** open the 3-minute chat (or "Skip: load demo card"). The Ambition Card and first route appear.
2. Open the week 3 check-in and answer **Not yet**. The route stalls (only Maya sees that), then **Book it** opens the mock Outlook invite.
3. **Ask for help** sends a named or anonymous follow-up.
4. **My team:** the week 1 brief shows only shared goals. Turn a goal's "Priya can see this" switch off on the Me layer, and it disappears here.
5. **The cohort:** the AI region glows. Select it to open the Chronicle story and evidence drawer. **Outreach** shows the quiet-stretch queue and follow-ups.

## Who owns what

| Person | Files |
|---|---|
| A: story and shell | `src/App.jsx`, `src/components/ChartMap.jsx`, `src/styles.css` |
| B: student and manager | `src/layers/MeLayer.jsx`, `src/layers/TeamLayer.jsx`, `src/layers/student-manager.css` (kept plain on purpose), `src/data/scripts.js` (chat copy), `src/components/SlackChat.jsx` |
| C: program side and data | `src/data/cohort.js`, `src/layers/CohortLayer.jsx` |

Shared rules live in `src/lib/`:

- `privacy.js`: what each layer may see. Voice stays private, participation is visible, and groups under 5 are hidden. Non-student views should go through these functions, not read `cohort.js` directly.
- `routes.js`: route geometry, stops and the stalled-route rule.
- `compassApi.js`: the Ambition Card call to n8n, with a cached fallback.

## Optional: connect n8n

Copy `.env.example` to `.env.local` and set `VITE_N8N_INTAKE_URL` to the n8n Intake webhook. The app POSTs `{ answers }` and expects:

```json
{ "goals": [{ "title": "...", "detail": "...", "destinationId": "product" }], "concerns": ["..."], "feedbackStyle": "..." }
```

`destinationId` must be `product`, `ai` or `leadership`. If the URL is empty, slow (over 8 seconds) or fails, the cached card is used, so the demo always works.
