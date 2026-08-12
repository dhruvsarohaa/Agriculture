Baghpat Groundwater Intelligence
A district-level decision-support prototype for monitoring groundwater levels, screening water-quality risks, prioritising intervention areas, and collecting community water-problem reports in Baghpat, Uttar Pradesh.
Important: This is a research and engineering prototype using simulated/demo data. It has no live CGWB, India-WRIS, or WIMS connection, and it does not replace official assessments or laboratory testing.

Features
District dashboard with groundwater, water-quality, reporting, and station KPIs
Groundwater trend analysis with block, station, season, and date filters
Transparent prototype groundwater forecasts
Rule-based groundwater and water-quality risk classification
Interactive schematic district risk and sampling maps
Water-quality screening for nitrate, fluoride, arsenic, iron, and electrical conductivity
Community water-problem reporting with browser location support
Local browser persistence for newly submitted community reports
Priority-area ranking based on groundwater risk, quality risk, and active reports
Data limitations, methodology, confidence, and demo-data notices throughout the UI
Technology
React 19 + TypeScript
TanStack Start / TanStack Router
Vite
Tailwind CSS
Recharts
Radix UI and Lucide icons
Run locally
bun install
bun run dev
Open:
http://127.0.0.1:4173/
If Bun is unavailable, a compatible alternative is:
pnpm install
pnpm run dev
Available commands
bun run dev       # Start local development server
bun run lint      # Run ESLint
bun run build     # Create production build
bun run preview   # Preview production build
bun run format    # Format files with Prettier
Main pages
/ — District overview dashboard
/groundwater — Groundwater observations, trends, filters, and forecast prototype
/water-quality — Water-quality parameters, screening results, and sample map
/reports — Community reports and report-status workflow
/risk-map — Combined district risk map
/about — Methodology, limitations, data sources, and implementation notes
Data model and risk logic
The project deliberately keeps its analytical rules transparent:
Groundwater risk is based on observed water-table deepening rate.
Water-quality risk is based on how far a reading exceeds its reference threshold.
Block priority combines groundwater risk, water-quality risk, and active community reports.
Missing values remain missing; the application does not invent or back-fill measurements.
Forecasts are trend-persistence placeholders, not trained machine-learning predictions.
Demo data is primarily located in:
src/data/demo-dataset.ts
Risk logic is located in:
src/lib/risk.ts
The data-service boundary, intended to be replaced with API calls when live data becomes available, is located in:
src/services/data-service.ts
Moving toward production
To turn this prototype into a production system:
Replace demo datasets with validated data pipelines and APIs.
Add authentication and role-based access for report management.
Store reports in a backend database instead of browser local storage.
Validate quality data against applicable official standards and laboratory workflows.
Train, evaluate, document, and monitor forecasting models before presenting predictions as operational outputs.
Replace schematic map boundaries with verified GIS layers.
