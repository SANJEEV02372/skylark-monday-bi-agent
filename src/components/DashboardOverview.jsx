import React from 'react';
import { TrendingUp, DollarSign, Target, Users, FileText, AlertTriangle, ArrowUpRight, BarChart3, PieChart } from 'lucide-react';
import { formatINR } from '../services/aiAgent';
import SectorChart from './Charts/SectorChart';
import FunnelChart from './Charts/FunnelChart';
import WaterfallChart from './Charts/WaterfallChart';
import ARTable from './Charts/ARTable';

function KPICard({ title, value, subtitle, icon: Icon, trend }) {
  return (
    <div className="bg-[#121215] border border-zinc-800/80 rounded-xl p-4 sm:p-5 hover:border-zinc-700 transition-all">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
          <Icon className="w-4 h-4" />
        </div>
        {trend && (
          <span className="text-[10px] sm:text-xs font-mono font-medium px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
            {trend}
          </span>
        )}
      </div>
      <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">{value}</p>
      <p className="text-xs text-zinc-400 mt-1 font-medium">{title}</p>
      {subtitle && <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-0.5 truncate">{subtitle}</p>}
    </div>
  );
}

export default function DashboardOverview({ kpis, sectors, funnel, waterfall, arList, owners }) {
  if (!kpis) return null;
  const { pipeline, operations } = kpis;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* KPI Cards Grid - 2 columns on mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KPICard
          title="Active Pipeline"
          value={formatINR(pipeline.totalPipelineValue)}
          subtitle={`${pipeline.openDealsCount} deals open`}
          icon={Target}
          trend={`${pipeline.openDealsCount} Open`}
        />
        <KPICard
          title="Weighted Pipeline"
          value={formatINR(pipeline.weightedPipelineValue)}
          subtitle={`Win Rate: ${pipeline.winRate}%`}
          icon={TrendingUp}
        />
        <KPICard
          title="Contracted POs"
          value={formatINR(operations.totalWOContractValue)}
          subtitle={`${operations.totalWOCount} work orders`}
          icon={FileText}
        />
        <KPICard
          title="Cash Collected"
          value={formatINR(operations.totalCollectedValue)}
          subtitle={`${operations.collectionEfficiencyPct}% collected`}
          icon={DollarSign}
        />
      </div>

      {/* Row 2 KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KPICard
          title="Billed Value"
          value={formatINR(operations.totalBilledValue)}
          subtitle={`${operations.billingRealizationPct}% realized`}
          icon={BarChart3}
        />
        <KPICard
          title="Outstanding AR"
          value={formatINR(operations.totalAR)}
          subtitle={`${operations.priorityARCount} priority accounts`}
          icon={AlertTriangle}
          trend={operations.totalAR > 5000000 ? 'HIGH RISK' : undefined}
        />
        <KPICard
          title="Unbilled (Completed)"
          value={formatINR(operations.unbilledCompletedValue)}
          subtitle={`${operations.unbilledCompletedCount} projects`}
          icon={FileText}
        />
        <KPICard
          title="Won Revenue"
          value={formatINR(pipeline.totalWonValue)}
          subtitle={`${pipeline.wonDealsCount} deals won`}
          icon={TrendingUp}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Sector Performance */}
        <div className="bg-[#121215] border border-zinc-800/80 rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="w-4 h-4 text-zinc-400" />
            <h3 className="text-xs sm:text-sm font-semibold text-white">Sector Performance</h3>
          </div>
          <SectorChart data={sectors.slice(0, 6).map(s => ({
            name: s.sector,
            Pipeline: Math.round(s.pipelineValue),
            Contracted: Math.round(s.contractValue),
            Collected: Math.round(s.collectedValue)
          }))} />
        </div>

        {/* Revenue Waterfall */}
        <div className="bg-[#121215] border border-zinc-800/80 rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-zinc-400" />
            <h3 className="text-xs sm:text-sm font-semibold text-white">Revenue Realization Waterfall</h3>
          </div>
          <WaterfallChart data={waterfall} />
        </div>

        {/* Stage Funnel */}
        <div className="bg-[#121215] border border-zinc-800/80 rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-zinc-400" />
            <h3 className="text-xs sm:text-sm font-semibold text-white">Pipeline Stage Velocity</h3>
          </div>
          <FunnelChart data={funnel.slice(0, 8).map(f => ({
            name: f.stage.replace(/^[A-Z]\.\s*/, ''),
            value: Math.round(f.totalValue),
            count: f.count
          }))} />
        </div>

        {/* AR Priority Table */}
        <div className="bg-[#121215] border border-zinc-800/80 rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-zinc-400" />
            <h3 className="text-xs sm:text-sm font-semibold text-white">Accounts Receivable Exposure</h3>
          </div>
          <ARTable data={arList.slice(0, 8).map(a => ({
            name: a.customerCode,
            Receivable: Math.round(a.amountReceivable),
            Billed: Math.round(a.billedValue),
            Collected: Math.round(a.collectedValue)
          }))} />
        </div>
      </div>

      {/* Owner Performance Table (Touch scrollable) */}
      <div className="bg-[#121215] border border-zinc-800/80 rounded-xl p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-zinc-400" />
          <h3 className="text-xs sm:text-sm font-semibold text-white">BD/KAM Personnel Performance</h3>
        </div>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full text-xs text-left min-w-[600px]">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-semibold bg-zinc-900/50">
                <th className="py-2.5 px-3">Owner Code</th>
                <th className="py-2.5 px-3 text-right">Deals</th>
                <th className="py-2.5 px-3 text-right">Pipeline</th>
                <th className="py-2.5 px-3 text-right">Won Deals</th>
                <th className="py-2.5 px-3 text-right">Won Value</th>
                <th className="py-2.5 px-3 text-right">WOs Delivered</th>
                <th className="py-2.5 px-3 text-right">Collected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {owners.slice(0, 10).map((o, i) => (
                <tr key={i} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-2.5 px-3 text-white font-mono font-medium">{o.owner}</td>
                  <td className="py-2.5 px-3 text-right text-zinc-300">{o.dealsCount}</td>
                  <td className="py-2.5 px-3 text-right text-zinc-200">{formatINR(o.pipelineValue)}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-400 font-medium">{o.wonCount}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-400 font-medium">{formatINR(o.wonValue)}</td>
                  <td className="py-2.5 px-3 text-right text-zinc-300">{o.woDelivered}</td>
                  <td className="py-2.5 px-3 text-right text-zinc-200">{formatINR(o.totalCollected)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
