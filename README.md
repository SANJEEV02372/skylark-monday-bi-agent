# Skylark Drones — Monday.com Executive BI Agent

> An AI-powered Business Intelligence Agent that answers founder-level queries across Monday.com Deals & Work Orders boards with automated data resilience, multi-board cross-analysis, and 1-click Leadership Updates.

## 🌐 Live Hosted Prototype
**[https://skylark-monday-bi-agent-iota.vercel.app](https://skylark-monday-bi-agent-iota.vercel.app)**

![Tech Stack](https://img.shields.io/badge/React_18-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=flat&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwindcss&logoColor=white)
![Monday.com](https://img.shields.io/badge/Monday.com-FF3E5B?style=flat&logo=monday.com&logoColor=white)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Executive User / Founder                  │
│              Natural Language Business Queries                │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│              Conversational BI Hub (React UI)                │
│  • Executive Copilot Chat    • BI Dashboard                  │
│  • Leadership Updates Studio • Data Quality Audit            │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│           AI Query Reasoner & BI Analytics Engine             │
│  • NL Intent Parser          • Multi-Board Aggregation       │
│  • Ambiguity Detection       • INR Formatting & Caveats      │
└─────────┬───────────────────────────────┬───────────────────┘
          │                               │
┌─────────▼─────────┐     ┌──────────────▼────────────────────┐
│  Monday.com API   │     │   Data Resilience Engine           │
│  GraphQL v2 +     │     │   • Excel Serial Date Converter    │
│  MCP Tool Defs    │     │   • Sector Fuzzy Normalizer        │
│  + Demo Fallback  │     │   • Financial Sanitizer (#VALUE!)  │
└─────────┬─────────┘     │   • Cross-Board Entity Correlator  │
          │               │   • Quality Auditor & Caveats      │
┌─────────▼─────────┐     └───────────────────────────────────┘
│  Monday.com       │
│  Deals Board      │
│  Work Orders Board│
└───────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Local Development
```bash
# Clone the repository
git clone https://github.com/SANJEEV02372/skylark-monday-bi-agent.git
cd skylark-monday-bi-agent

# Install dependencies
npm install

# Start development server
npm run dev
```

The app opens at `http://localhost:3000` in **Demo Mode** with the full embedded dataset (346 Deals + 176 Work Orders) — no Monday.com API key required to test.

### Production Build
```bash
npm run build
npm run preview
```

---

## 🔗 Monday.com Configuration (Optional)

To connect to your live Monday.com boards:

1. **Get API Token**: Monday.com → Profile Avatar → Admin → API → Personal API Token
2. **Get Board IDs**: Open each board → look at the URL: `monday.com/boards/{BOARD_ID}`
3. **In the App**: Click the **Monday.com** button (top-right) → Enter Token + Board IDs → Test Connection → Save

### Importing Sample Data to Monday.com

1. Create a new board named **"Deal Funnel"** → Import `data/deal_funnel_clean.csv`
2. Create a new board named **"Work Order Tracker"** → Import `data/work_order_tracker_clean.csv`
3. Map columns appropriately (the CSVs have clean headers matching Monday.com column types)

---

## 📁 Project Structure

```
├── public/favicon.svg                          # Branded favicon
├── src/
│   ├── main.jsx                                # Vite entrypoint
│   ├── App.jsx                                 # Main shell with tab navigation
│   ├── index.css                               # Glassmorphism design system
│   ├── components/
│   │   ├── ChatInterface.jsx                   # Conversational AI copilot
│   │   ├── DashboardOverview.jsx               # KPI cards + analytics grid
│   │   ├── LeadershipBrief.jsx                 # 1-Click executive updates
│   │   ├── DataQualityAudit.jsx                # Data health dashboard
│   │   ├── MondaySettingsModal.jsx             # API connection hub
│   │   └── Charts/
│   │       ├── SectorChart.jsx                 # Sector bar chart
│   │       ├── FunnelChart.jsx                 # Pipeline funnel
│   │       ├── WaterfallChart.jsx              # Revenue waterfall
│   │       └── ARTable.jsx                     # AR priority chart
│   └── services/
│       ├── datasets.js                         # Embedded normalized data
│       ├── dataResilience.js                   # Date/sector/currency normalizer
│       ├── mondayApi.js                        # Monday.com GraphQL v2 client
│       ├── biEngine.js                         # BI analytics engine
│       ├── aiAgent.js                          # NL query processor
│       └── mcpServer.js                        # MCP tool definitions
├── data/
│   ├── deal_funnel_clean.csv                   # Clean CSV for Monday.com import
│   └── work_order_tracker_clean.csv            # Clean CSV for Monday.com import
├── DECISION_LOG.md                             # Architectural decisions & trade-offs
└── README.md                                   # This file
```

---

## ✨ Core Features

### 1. Executive Copilot (Conversational AI)
- Natural language queries: *"How's our pipeline for energy sector?"*
- Pre-built founder prompt chips for instant insights
- Embedded interactive charts within responses
- Data quality caveats surfaced with every answer
- Suggested follow-up questions for deeper drill-down

### 2. BI Dashboard
- 8 real-time KPI cards (Pipeline, Weighted, Won, Billed, Collected, AR, Unbilled)
- Sector-wise performance comparison chart
- Deal pipeline funnel by stage
- Revenue realization waterfall (PO → Billed → Collected → AR)
- BD/KAM owner performance table

### 3. Leadership Updates Studio
- Auto-generated executive briefing from live data
- Topline summary, sector breakdown, critical risk items
- 1-Click Copy to Clipboard (Markdown format)
- Print / PDF export with professional styling

### 4. Data Quality & Resilience
- Circular gauge scores for overall / deals / work orders health
- Cross-board entity correlation statistics
- Resilience engine resolution log (dates fixed, sectors normalized, errors cleaned)
- Active data quality caveats with severity levels

### 5. Monday.com Integration
- Dynamic GraphQL v2 API queries with pagination
- Column heuristic auto-mapper for custom board structures
- Live connection test with board discovery
- Seamless fallback to embedded demo dataset

---

## 🧪 Sample Queries to Test

| Query | What It Tests |
|:---|:---|
| *"How's our pipeline looking for energy sector this quarter?"* | Sector normalization + date filtering + stage weighting |
| *"What is our total unbilled work order value for completed projects?"* | Cross-field execution vs billing calculation |
| *"Which accounts have the highest accounts receivable overdue?"* | AR priority calculation + financial sanitizer |
| *"Compare projected deal values with actual collected amounts across sectors"* | Multi-board cross-correlation |
| *"Show me the deal pipeline funnel and win rates"* | Stage distribution + conversion metrics |
| *"Generate a weekly executive leadership update"* | Leadership brief auto-generation |

---

## 📜 License

Built for the Skylark Drones Technical Assignment.
