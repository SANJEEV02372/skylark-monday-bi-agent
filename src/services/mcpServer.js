/**
 * Model Context Protocol (MCP) Server Tool Definitions & Handler
 * Skylark Drones - Business Intelligence Agent
 * 
 * Implements MCP specification for AI agent tool calling across Monday.com boards.
 */

import { mondayService } from './mondayApi';
import { correlateBoards, auditDataQuality } from './dataResilience';
import { computeExecutiveKPIs, getSectorAnalysis, getFunnelMetrics, getRevenueWaterfall, getARPriorityList } from './biEngine';

export const MCP_TOOL_DEFINITIONS = [
  {
    name: "query_deals_board",
    description: "Query and filter the Monday.com Deals board for sales pipeline, stage distribution, and owner performance.",
    parameters: {
      type: "object",
      properties: {
        sector: { type: "string", description: "Filter by sector (e.g. Renewables, Powerline, Mining, Railways, DSP, Construction)" },
        stage: { type: "string", description: "Filter by deal stage (e.g. 'B. Sales Qualified Leads', 'E. Proposal/Commercials Sent', 'G. Project Won')" },
        owner_code: { type: "string", description: "Filter by sales owner / BD code (e.g. OWNER_001, OWNER_002)" },
        status: { type: "string", description: "Filter by status: Open, Won, Dead, On Hold" },
        min_value: { type: "number", description: "Minimum deal value in INR" }
      }
    }
  },
  {
    name: "query_work_orders_board",
    description: "Query and filter the Monday.com Work Order Tracker for project execution, billing, and overdue accounts receivable.",
    parameters: {
      type: "object",
      properties: {
        execution_status: { type: "string", description: "Filter by execution status (Completed, Ongoing, Not Started, Executed until current month)" },
        sector: { type: "string", description: "Filter by sector" },
        invoice_status: { type: "string", description: "Filter by invoice status (Fully Billed, Partially Billed, Not billed yet)" },
        unbilled_only: { type: "boolean", description: "Only return projects with unbilled amounts" },
        ar_priority: { type: "string", description: "Filter by AR Priority account flag (Priority, Normal)" }
      }
    }
  },
  {
    name: "cross_board_financial_summary",
    description: "Perform unified multi-board analytics correlating Deals pipeline with Work Order execution, billing, and cash collection.",
    parameters: {
      type: "object",
      properties: {
        sector: { type: "string", description: "Optional sector filter" }
      }
    }
  },
  {
    name: "get_data_quality_audit",
    description: "Get real-time data quality scores, resolved anomaly logs, and critical operational caveats for executive awareness.",
    parameters: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "generate_executive_brief",
    description: "Generate structured 1-click leadership updates including weekly digest, revenue forecast, and risk matrix.",
    parameters: {
      type: "object",
      properties: {
        time_period: { type: "string", description: "Time horizon (e.g. Current Quarter, Q1, FY25-26)" }
      }
    }
  }
];

export async function handleMcpToolCall(toolName, args = {}) {
  const { deals, workOrders } = await mondayService.fetchAllData();

  switch (toolName) {
    case 'query_deals_board': {
      let filtered = [...deals];
      if (args.sector) {
        filtered = filtered.filter(d => d.sector.toLowerCase().includes(args.sector.toLowerCase()));
      }
      if (args.status) {
        filtered = filtered.filter(d => d.deal_status.toLowerCase() === args.status.toLowerCase());
      }
      if (args.stage) {
        filtered = filtered.filter(d => d.deal_stage.toLowerCase().includes(args.stage.toLowerCase()));
      }
      if (args.owner_code) {
        filtered = filtered.filter(d => d.owner_code.toLowerCase() === args.owner_code.toLowerCase());
      }
      if (args.min_value) {
        filtered = filtered.filter(d => d.deal_value >= args.min_value);
      }

      const totalValue = filtered.reduce((s, d) => s + d.deal_value, 0);
      const weightedValue = filtered.reduce((s, d) => s + d.weighted_value, 0);

      return {
        count: filtered.length,
        totalValue,
        weightedValue,
        sampleRecords: filtered.slice(0, 10)
      };
    }

    case 'query_work_orders_board': {
      let filtered = [...workOrders];
      if (args.sector) {
        filtered = filtered.filter(w => w.sector.toLowerCase().includes(args.sector.toLowerCase()));
      }
      if (args.execution_status) {
        filtered = filtered.filter(w => w.execution_status.toLowerCase().includes(args.execution_status.toLowerCase()));
      }
      if (args.invoice_status) {
        filtered = filtered.filter(w => w.invoice_status.toLowerCase().includes(args.invoice_status.toLowerCase()));
      }
      if (args.unbilled_only) {
        filtered = filtered.filter(w => w.to_be_billed_incl_gst > 1000);
      }
      if (args.ar_priority) {
        filtered = filtered.filter(w => w.ar_priority.toLowerCase() === args.ar_priority.toLowerCase());
      }

      const totalPO = filtered.reduce((s, w) => s + w.amount_incl_gst, 0);
      const totalBilled = filtered.reduce((s, w) => s + w.billed_incl_gst, 0);
      const totalCollected = filtered.reduce((s, w) => s + w.collected_incl_gst, 0);
      const totalAR = filtered.reduce((s, w) => s + w.amount_receivable, 0);
      const totalUnbilled = filtered.reduce((s, w) => s + w.to_be_billed_incl_gst, 0);

      return {
        count: filtered.length,
        totalPO,
        totalBilled,
        totalCollected,
        totalAR,
        totalUnbilled,
        sampleRecords: filtered.slice(0, 10)
      };
    }

    case 'cross_board_financial_summary': {
      const kpis = computeExecutiveKPIs(deals, workOrders);
      const sectors = getSectorAnalysis(deals, workOrders);
      const correlation = correlateBoards(deals, workOrders);
      return { kpis, sectors, correlationSummary: { matchedDeals: correlation.totalMatchedDeals, matchRate: correlation.matchRatePct } };
    }

    case 'get_data_quality_audit': {
      return auditDataQuality(deals, workOrders);
    }

    default:
      throw new Error(`Unknown MCP tool: ${toolName}`);
  }
}
