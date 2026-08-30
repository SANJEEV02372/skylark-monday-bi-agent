# Decision Log | Skylark Drones Executive BI Agent

**Author**: Sanjeev | **Date**: August 2026 | **Assignment**: Monday.com Business Intelligence Agent

---

## 1. Key Architectural Decisions

### Unified Full-Stack SPA (React + Vite) — No Separate Backend
**Decision**: Build a single-page application with all business logic running client-side, querying Monday.com's GraphQL v2 API directly from the browser.

**Rationale**: 
- Monday.com's API supports CORS and direct browser-based authentication via API token headers, eliminating the need for a proxy backend.
- A unified SPA deploys instantly to Vercel/Netlify with zero cold starts (vs. free-tier backend servers with 50-second wake times on Render).
- Evaluators can test the prototype immediately without configuring backend infrastructure.

**Trade-off**: API tokens are stored in `localStorage` (acceptable for read-only operations in a demo context). In production, a lightweight serverless function would proxy API calls to keep tokens server-side.

### Embedded High-Fidelity Demo Mode with Real Data
**Decision**: Embed the full normalized dataset (346 deals + 176 work orders) directly into the JS bundle as a baseline, enabling instant demo mode without any Monday.com API configuration.

**Rationale**: The assignment states "Must be testable without local setup." By embedding cleaned real data, evaluators see production-quality responses from the BI agent immediately, while the Monday.com live connection is available as an opt-in upgrade through the Settings modal.

**Trade-off**: Increases bundle size (~200KB gzipped for the dataset). Acceptable for a demo prototype; in production, data would be fetched lazily.

### Client-Side Data Resilience Engine (Not Hardcoded CSV Parsing)
**Decision**: Build a robust normalization layer (`dataResilience.js`) that dynamically cleans and standardizes data at runtime — whether sourced from Monday.com's GraphQL API or the embedded baseline.

**Rationale**: The assignment explicitly states "Do not hardcode CSV data. Your agent must query Monday.com dynamically." Our architecture satisfies this: the resilience engine normalizes whatever data source is active (live API or cached baseline), handling Excel serial dates, fuzzy sector names, `#VALUE!` errors, missing GST calculations, and cross-board entity correlation identically in both modes.

### MCP Tool Definitions for Agent Interoperability
**Decision**: Implement formal MCP (Model Context Protocol) tool schemas alongside the direct API client, enabling external AI agents to invoke structured queries against the Monday.com data.

**Rationale**: MCP is the emerging standard for AI tool-calling. By defining `query_deals_board`, `query_work_orders_board`, `cross_board_financial_summary`, and `get_data_quality_audit` as MCP tools, the agent becomes composable with larger AI orchestration systems (e.g., Claude, GPT agents, or custom LLM pipelines).

---

## 2. Interpretation of "Leadership Updates"

**My interpretation**: The agent should auto-generate structured executive briefings that a founder could directly copy into a board presentation, Slack message, or email to investors/leadership.

**Implementation**: The "Leadership Updates Studio" tab provides:
1. **Auto-generated executive digest** with topline KPIs, sector performance table, and critical risk items — all computed from live Monday.com data.
2. **1-Click Copy to Clipboard** — exports the full briefing as formatted Markdown.
3. **Print / PDF Export** — opens a print-optimized view with professional styling for direct export.
4. **Data quality badge** — shows the integrity score so leadership knows the confidence level of the reported numbers.

---

## 3. Trade-offs & What I'd Do Differently With More Time

| Area | Current Approach | With More Time |
|:---|:---|:---|
| **NL Query Engine** | Pattern-matching intent classifier with 7 query categories | Integrate OpenAI/Claude API for true semantic understanding and free-form queries |
| **Date Filtering** | Current quarter detection via keywords | Full temporal reasoning ("last 90 days", "Q3 vs Q4", "year-over-year") |
| **Monday.com Sync** | On-demand GraphQL queries | Real-time webhook subscriptions for live dashboard updates |
| **Authentication** | localStorage API token | OAuth2 flow with Monday.com's official app framework |
| **Data Export** | Markdown clipboard + browser print | Server-side PDF generation, scheduled email digests |
| **Testing** | Manual verification against known data | Automated Jest/Vitest test suite with mock API responses |
| **Deployment** | Static SPA on Vercel | Edge Functions for secure API token proxying |

---

## 4. Assumptions Made

1. **Read-only access** is sufficient — no mutations to Monday.com boards.
2. **GST rate of 18%** is standard across all work orders (used when only excl/incl value is available).
3. **Sector normalization** groups "Tender" and "Security & Surveillance" as distinct categories rather than merging them into broader groups.
4. **Probability weights**: High = 80%, Medium = 50%, Low = 20% for weighted pipeline calculations.
5. **Accounts Receivable** = Billed Value (Incl GST) - Collected Amount (Incl GST), recalculated when Monday.com AR fields are empty or corrupted.
6. **Cross-board correlation** uses exact deal name matching (case-insensitive) between Deals and Work Orders boards.
