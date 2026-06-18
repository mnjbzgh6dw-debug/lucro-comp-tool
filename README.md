# Lucro · Compensation Prep Tool

A client-facing, single-page web app that helps chiropractic practice owners **prepare for and run compensation conversations** with their team. Choose a compensation structure, set parameters, model scenarios, read a sustainability verdict + talking points, and print a clean one-page summary to take into the meeting.

No login. No backend. Static site, deployable to GitHub Pages.

## Tech Stack

- **React + Vite + Tailwind CSS**
- `recharts` — scenario bar chart
- `react-to-print` — one-page print / PDF output
- `@headlessui/react` — accessible tooltips / popovers
- `gh-pages` — deployment

## Getting Started

```bash
npm install
npm run dev        # local dev server
npm run build      # production build to /dist
npm run preview    # preview the production build
npm run deploy     # build + push /dist to the gh-pages branch
```

## Compensation Structures

Eight structures are supported, each with its own parameter form, formulas, sustainability target, and talking points:

| ID | Name |
|---|---|
| `base_collections` | Base + Collections Bonus |
| `base_profit` | Base + Profit Bonus |
| `collections_only` | Collections-Only (No Base) |
| `tiered_collections` | Tiered Collections Bonus |
| `per_visit` | Per-Visit Rate |
| `flat_milestone` | Flat Milestone Bonus |
| `hybrid_two_tier` | Base + Two-Tier Bonus |
| `revenue_share` | Revenue Share |

## Project Structure

```
src/
├── components/
│   ├── wizard/        # Phase 1: 3-step setup
│   ├── dashboard/     # Phase 2: scenarios + output
│   ├── print/         # one-page print layout
│   └── shared/        # CurrencyInput, Tooltip, Logo, VerdictBadge
├── utils/
│   ├── calculations/  # one pure module per structure + dispatcher
│   ├── verdict.js     # sustainability badge + summary
│   ├── talkingPoints.js
│   ├── format.js
│   └── useComputedScenarios.js
├── constants/structures.js   # structure registry (drives the dynamic form)
├── AppContext.jsx            # global state
└── App.jsx                   # shell + print wiring
```

## Deployment (GitHub Pages)

1. The app is configured for a repo named **`lucro-comp-tool`**:
   - `vite.config.js` → `base: '/lucro-comp-tool/'`
   - `package.json` → `"homepage": "https://mnjbzgh6dw-debug.github.io/lucro-comp-tool/"`
   - If you fork to a different repo/user, update both of the above.
2. Push the project to a GitHub repo.
3. Run `npm run deploy` (runs `predeploy` → `build` automatically, then publishes `/dist` to the `gh-pages` branch).
4. In the repo's **Settings → Pages**, set the source to the `gh-pages` branch.

## Logo

The header and print one-pager load `public/lucro-logo.svg`. **Drop your own `lucro-logo.svg` into `public/`.** Until then, a styled "LUCRO" text wordmark renders automatically as a fallback — nothing breaks.

## Notes / Out of Scope (V1)

- No authentication or saved sessions
- One team member per session
- Talking points are template-generated (no AI call)
- Desktop-first (responsive polish is a V2 item)
