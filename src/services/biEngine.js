/**
 * Business Intelligence (BI) Analytical & Correlation Engine
 * Skylark Drones - Executive Intelligence Agent
 * 
 * Provides deep multi-board financial, operational, and pipeline metrics.
 */

import { correlateBoards } from './dataResilience';

/**
 * Computes high-level Founder/Executive KPIs
 */
export function computeExecutiveKPIs(deals = [], workOrders = []) {
  // Deals metrics
  const totalDealsCount = deals.length;
  const openDeals = deals.filter(d => d.deal_status.toLowerCase() === 'open');
  const wonDeals = deals.filter(d => d.deal_status.toLowerCase() === 'won' || d.deal_stage.toLowerCase().includes('won'));
  const deadDeals = deals.filter(d => d.deal_status.toLowerCase() === 'dead' || d.deal_stage.toLowerCase().includes('lost'));

  const totalPipelineValue = openDeals.reduce((s, d) => s + (d.deal_value || 0), 0);
  const weightedPipelineValue = openDeals.reduce((s, d) => s + (d.weighted_value || 0), 0);
  const totalWonValue = wonDeals.reduce((s, d) => s + (d.deal_value || 0), 0);

  const decidedDeals = wonDeals.length + deadDeals.length;
  const winRate = decidedDeals > 0 ? Math.round((wonDeals.length / decidedDeals) * 100) : 0;
  const winRateByValue = (totalWonValue + deadDeals.reduce((s, d) => s + d.deal_value, 0)) > 0
    ? Math.round((totalWonValue / (totalWonValue + deadDeals.reduce((s, d) => s + d.deal_value, 0))) * 100)
    : 0;

  // Work orders metrics
  const totalWOCount = workOrders.length;
  const totalWOContractValue = workOrders.reduce((s, w) => s + (w.amount_incl_gst || 0), 0);
  const totalBilledValue = workOrders.reduce((s, w) => s + (w.billed_incl_gst || 0), 0);
  const totalCollectedValue = workOrders.reduce((s, w) => s + (w.collected_incl_gst || 0), 0);
  const totalAR = workOrders.reduce((s, w) => s + (w.amount_receivable || 0), 0);
  const totalToBeBilled = workOrders.reduce((s, w) => s + (w.to_be_billed_incl_gst || 0), 0);

  // Completed but unbilled
  const completedWOs = workOrders.filter(w => {
    const st = w.execution_status.toLowerCase();
    return st.includes('complete') || st.includes('executed until');
  });
  const unbilledCompletedValue = completedWOs.reduce((s, w) => s + (w.to_be_billed_incl_gst || 0), 0);
  const unbilledCompletedCount = completedWOs.filter(w => w.to_be_billed_incl_gst > 1000).length;

  // Priority AR Overdue
  const priorityARList = workOrders.filter(w => w.ar_priority === 'Priority' || w.amount_receivable > 500000);
  const priorityARTotal = priorityARList.reduce((s, w) => s + w.amount_receivable, 0);

  // Billing & Collection Ratios
  const billingRealizationPct = totalWOContractValue > 0 ? Math.round((totalBilledValue / totalWOContractValue) * 100) : 0;
  const collectionEfficiencyPct = totalBilledValue > 0 ? Math.round((totalCollectedValue / totalBilledValue) * 100) : 0;

  return {
    pipeline: {
      totalDealsCount,
      openDealsCount: openDeals.length,
      wonDealsCount: wonDeals.length,
      deadDealsCount: deadDeals.length,
      totalPipelineValue,
      weightedPipelineValue,
      totalWonValue,
      winRate,
      winRateByValue,
      avgDealSize: openDeals.length > 0 ? Math.round(totalPipelineValue / openDeals.length) : 0
    },
    operations: {
      totalWOCount,
      totalWOContractValue,
      totalBilledValue,
      totalCollectedValue,
      totalAR,
      totalToBeBilled,
      unbilledCompletedValue,
      unbilledCompletedCount,
      priorityARTotal,
      priorityARCount: priorityARList.length,
      billingRealizationPct,
      collectionEfficiencyPct
    }
  };
}

/**
 * Unified Sector Breakdown cross-correlating Deals and Work Orders
 */
export function getSectorAnalysis(deals = [], workOrders = []) {
  const sectorMap = {};

  const initSector = (sec) => {
    if (!sectorMap[sec]) {
      sectorMap[sec] = {
        sector: sec,
        openDealsCount: 0,
        pipelineValue: 0,
        weightedPipeline: 0,
        wonValue: 0,
        woCount: 0,
        contractValue: 0,
        billedValue: 0,
        collectedValue: 0,
        arValue: 0,
        unbilledValue: 0
      };
    }
  };

  deals.forEach(d => {
    const sec = d.sector || 'Others';
    initSector(sec);
    if (d.deal_status.toLowerCase() === 'open') {
      sectorMap[sec].openDealsCount++;
      sectorMap[sec].pipelineValue += d.deal_value;
      sectorMap[sec].weightedPipeline += d.weighted_value;
    } else if (d.deal_status.toLowerCase() === 'won' || d.deal_stage.toLowerCase().includes('won')) {
      sectorMap[sec].wonValue += d.deal_value;
    }
  });

  workOrders.forEach(w => {
    const sec = w.sector || 'Others';
    initSector(sec);
    sectorMap[sec].woCount++;
    sectorMap[sec].contractValue += w.amount_incl_gst;
    sectorMap[sec].billedValue += w.billed_incl_gst;
    sectorMap[sec].collectedValue += w.collected_incl_gst;
    sectorMap[sec].arValue += w.amount_receivable;
    sectorMap[sec].unbilledValue += w.to_be_billed_incl_gst;
  });

  return Object.values(sectorMap).sort((a, b) => (b.pipelineValue + b.contractValue) - (a.pipelineValue + a.contractValue));
}

/**
 * Deal Pipeline Funnel by Stages
 */
export function getFunnelMetrics(deals = []) {
  const STAGE_ORDER = [
    'A. Lead Generated',
    'B. Sales Qualified Leads',
    'C. Demo Done',
    'D. Feasibility',
    'E. Proposal/Commercials Sent',
    'I. POC',
    'F. Negotiations',
    'H. Work Order Received',
    'G. Project Won',
    'K. Amount Accrued',
    'L. Project Lost',
    'M. Projects On Hold',
    'N. Not relevant at the moment'
  ];

  const stageMap = {};
  STAGE_ORDER.forEach(st => {
    stageMap[st] = { stage: st, count: 0, totalValue: 0, weightedValue: 0 };
  });

  deals.forEach(d => {
    const st = d.deal_stage || 'A. Lead Generated';
    if (!stageMap[st]) {
      stageMap[st] = { stage: st, count: 0, totalValue: 0, weightedValue: 0 };
    }
    stageMap[st].count++;
    stageMap[st].totalValue += d.deal_value;
    stageMap[st].weightedValue += d.weighted_value;
  });

  return Object.values(stageMap).filter(s => s.count > 0);
}

/**
 * Revenue Waterfall & Execution Breakdown
 */
export function getRevenueWaterfall(workOrders = []) {
  const totalContract = workOrders.reduce((s, w) => s + w.amount_incl_gst, 0);
  const totalBilled = workOrders.reduce((s, w) => s + w.billed_incl_gst, 0);
  const totalCollected = workOrders.reduce((s, w) => s + w.collected_incl_gst, 0);
  const totalAR = workOrders.reduce((s, w) => s + w.amount_receivable, 0);
  const totalUnbilled = workOrders.reduce((s, w) => s + w.to_be_billed_incl_gst, 0);

  const completedUnbilled = workOrders
    .filter(w => w.execution_status.toLowerCase().includes('complete') || w.execution_status.toLowerCase().includes('executed until'))
    .reduce((s, w) => s + w.to_be_billed_incl_gst, 0);

  return [
    { name: 'Total PO Value', value: Math.round(totalContract), fill: '#38BDF8' },
    { name: 'Billed Value', value: Math.round(totalBilled), fill: '#3B82F6' },
    { name: 'Collected Cash', value: Math.round(totalCollected), fill: '#10B981' },
    { name: 'Receivables (AR)', value: Math.round(totalAR), fill: '#F59E0B' },
    { name: 'Total Unbilled', value: Math.round(totalUnbilled), fill: '#A855F7' },
    { name: 'Completed & Unbilled', value: Math.round(completedUnbilled), fill: '#F43F5E' },
  ];
}

/**
 * Top Accounts Receivable & Overdue Risk Ranking
 */
export function getARPriorityList(workOrders = [], limit = 10) {
  return workOrders
    .filter(w => w.amount_receivable > 1000)
    .sort((a, b) => b.amount_receivable - a.amount_receivable)
    .slice(0, limit)
    .map(w => ({
      serialNo: w.serial_no,
      dealName: w.deal_name,
      customerCode: w.customer_code,
      kamCode: w.kam_code,
      sector: w.sector,
      amountReceivable: w.amount_receivable,
      billedValue: w.billed_incl_gst,
      collectedValue: w.collected_incl_gst,
      lastInvoiceDate: w.last_invoice_date || 'No Date',
      priority: w.ar_priority || (w.amount_receivable > 500000 ? 'Priority' : 'Normal')
    }));
}

/**
 * Sales Owner / KAM Performance Breakdown
 */
export function getOwnerPerformance(deals = [], workOrders = []) {
  const owners = {};

  deals.forEach(d => {
    const code = d.owner_code || 'Unassigned';
    if (!owners[code]) {
      owners[code] = { owner: code, dealsCount: 0, pipelineValue: 0, wonCount: 0, wonValue: 0, woDelivered: 0, totalCollected: 0 };
    }
    owners[code].dealsCount++;
    if (d.deal_status.toLowerCase() === 'open') {
      owners[code].pipelineValue += d.deal_value;
    } else if (d.deal_status.toLowerCase() === 'won' || d.deal_stage.toLowerCase().includes('won')) {
      owners[code].wonCount++;
      owners[code].wonValue += d.deal_value;
    }
  });

  workOrders.forEach(w => {
    const code = w.kam_code || 'Unassigned';
    if (!owners[code]) {
      owners[code] = { owner: code, dealsCount: 0, pipelineValue: 0, wonCount: 0, wonValue: 0, woDelivered: 0, totalCollected: 0 };
    }
    owners[code].woDelivered++;
    owners[code].totalCollected += w.collected_incl_gst;
  });

  return Object.values(owners).sort((a, b) => (b.wonValue + b.pipelineValue) - (a.wonValue + a.pipelineValue));
}
