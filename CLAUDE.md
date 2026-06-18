# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

npm run dev       # local dev server (Vite, port 5173)
npm run build     # production build to /dist
npm run preview   # preview the production build

Deploying to GitHub Pages - npm run deploy errors due to the Unicode apostrophe in the project path. Use this instead:
npm run build
cd dist && git init && git add . && git commit -m "Deploy" && git push -f https://github.com/mnjbzgh6dw-debug/lucro-comp-tool.git HEAD:gh-pages

There are no tests or lint scripts.

## Architecture

All global state lives in src/AppContext.jsx via a single React Context. The shape is:
{ phase, wizardStep, profile, structureType, parameters, scenarios, sliderValue, expectedValue }

phase switches between wizard and dashboard. Changing structureType resets parameters and scenarios to that structure defaults.

The parameter form in Step3Parameters.jsx is entirely data-driven from src/constants/structures.js field metadata.

The calculation engine is in src/utils/calculations/ - one pure module per structure, each exporting calc(params, metricValue) and monthlyGoal(params). All outputs are guarded: invalid inputs return null, never NaN or Infinity.

The 8 structure IDs: base_collections, base_profit, collections_only, tiered_collections, per_visit, flat_milestone, hybrid_two_tier, revenue_share.

src/utils/useComputedScenarios.js is called by all dashboard components that display scenario data - always use this hook rather than computing inline.

src/constants/structures.js is the single source of truth for structure names, parameter field metadata, and defaults. Editing it updates the wizard form, parameter panel, and print layout automatically.

For print, src/components/print/PrintLayout.jsx uses a fixed-width BarChart (not ResponsiveContainer) because the container is hidden with zero measured width.

Palette tokens: navy #1B2A4A, gold #C9A84C, amber #E07B2A, red #C0392B, light-gold #FFF8E7, light-navy #EEF1F6

Logo: src/components/shared/Logo.jsx renders public/lucro-logo.svg with a text wordmark fallback. The logo file is not committed.

Live URL: https://mnjbzgh6dw-debug.github.io/lucro-comp-tool/
