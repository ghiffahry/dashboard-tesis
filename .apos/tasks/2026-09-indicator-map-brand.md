# Indicator, map semantics, and identity refinement

- Status: Completed
- Date: 2026-09-28
- Scope: dashboard pages, map legend and tooltip, analysis controls, landing page, responsive behavior.

## Objective
Make indicator and year controls affect the displayed results, distinguish value quartiles from LISA clusters, improve semantic map color/tooltip legibility, and give the interface a cohesive original identity across desktop and mobile.

## Acceptance criteria
- Analysis indicator selection updates the temporal chart and only displays Moran series where results exist.
- The fixed poverty Moran response is labeled distinctly from the comparison indicator.
- Map legend explains value quartiles separately from LISA and uses a semantic increasing-lightness palette.
- Map tooltips have opaque, readable styling and expose indicator plus value.
- Header has a cohesive original mark and wordmark on every page.
- Landing page selector affects its charts and summaries, with responsive layout.
- Existing node checks pass; production site artifact rebuilt and browser audited on desktop/mobile.

## Result
Acceptance criteria met. See `.apos/reports/2026-09-indicator-aware-dashboard.md` and ADR 0006.
