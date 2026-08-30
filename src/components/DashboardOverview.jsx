import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, Users, FileText, AlertTriangle, ArrowUpRight, ArrowDownRight, BarChart3, PieChart } from 'lucide-react';
import { formatINR } from '../services/aiAgent';
import SectorChart from './Charts/SectorChart';
import FunnelChart from './Charts/FunnelChart';
import WaterfallChart from './Charts/WaterfallChart';
import ARTable from './Charts/ARTable';

function KPICard({ title, value, subtitle, icon: Icon, gradient, trend, trendValue }) {
  return (
    <div className="glass-card rounded-xl p-5 hover:bg-white/[0.04] transition-all duration-300 group">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-0.5 text-xs font-medium px-2 py-1 rounded-lg ${
            trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
          }`}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{title}</p>
      {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function MetricRow({ label, value, subValue, highlight }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <div className="text-right">
        <span className={`text-sm font-semibold ${highlight ? 'text-amber-400' : 'text-white'}`}>{value}</span>
        {subValue && <p className="text-[10px] text-slate-500">{subValue}</p>}
      </div>
    </div>
  );
}

export default function DashboardOverview({ kpis, sectors, funnel, waterfall, arList, owners, deals, workOrders }) {
  if (!kpis) return null;

  const { pipeline, operations } = kpis;

  return (
    <div className="space-y-6">
      {/* KPI Headline Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Active Pipeline"
          value={formatINR(pipeline.totalPipelineValue)}
          subtitle={`${pipeline.openDealsCount} deals open`}
          icon={Target}
          gradient="from-sky-500 to-cyan-400"
          trend="up"
          trendValue={`${pipeline.openDealsCount} active`}
        />
        <KPICard
          title="Weighted Pipeline"
          value={formatINR(pipeline.weightedPipelineValue)}
          subtitle={`Win rate: ${pipeline.winRate}%`}
          icon={TrendingUp}
          gradient="from-violet-500 to-purple-400"
        />
        <KPICard
          title="Total Contracted POs"
          value={formatINR(operations.totalWOContractValue)}
          subtitle={`${operations.totalWOCount} work orders`}
          icon={FileText}
          gradient="from-emerald-500 to-green-400"
        />
        <KPICard
          title="Cash Collected"
          value={formatINR(operations.totalCollectedValue)}
          subtitle={`${operations.collectionEfficiencyPct}% collection rate`}
          icon={DollarSign}
          gradient="from-amber-500 to-yellow-400"
        />
      </div>

      {/* Second Row KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Billed"
          value={formatINR(operations.totalBilledValue)}
          subtitle={`${operations.billingRealizationPct}% of contracted`}
          icon={BarChart3}
          gradient="from-blue-500 to-indigo-400"
        />
        <KPICard
          title="Outstanding AR"
          value={formatINR(operations.totalAR)}
          subtitle={`${operations.priorityARCount} priority accounts`}
          icon={AlertTriangle}
          gradient="from-rose-500 to-pink-400"
          trend={operations.totalAR > 5000000 ? 'down' : undefined}
          trendValue={operations.totalAR > 5000000 ? 'High' : undefined}
        />
        <KPICard
          title="Unbilled (Completed)"
          value={formatINR(operations.unbilledCompletedValue)}
          subtitle={`${operations.unbilledCompletedCount} projects`}
          icon={FileText}
          gradient="from-orange-500 to-red-400"
        />
        <KPICard
          title="Total Won Value"
          value={formatINR(pipeline.totalWonValue)}
          subtitle={`${pipeline.wonDealsCount} deals converted`}
          icon={TrendingUp}
          gradient="from-teal-500 to-cyan-400"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Analysis */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-semibold text-white">Sector-Wise Performance</h3>
          </div>
          <SectorChart data={sectors.slice(0, 6).map(s => ({
            name: s.sector,
            Pipeline: Math.round(s.pipelineValue),
            Contracted: Math.round(s.contractValue),
            Collected: Math.round(s.collectedValue)
          }))} />
        </div>

        {/* Revenue Waterfall */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">Revenue Realization Waterfall</h3>
          </div>
          <WaterfallChart data={waterfall} />
        </div>

        {/* Deal Funnel */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Deal Pipeline Funnel</h3>
          </div>
          <FunnelChart data={funnel.slice(0, 8).map(f => ({
            name: f.stage.replace(/^[A-Z]\.\s*/, ''),
            value: Math.round(f.totalValue),
            count: f.count
          }))} />
        </div>

        {/* AR Priority */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Top Accounts Receivable</h3>
          </div>
          <ARTable data={arList.slice(0, 8).map(a => ({
            name: a.customerCode,
            Receivable: Math.round(a.amountReceivable),
            Billed: Math.round(a.billedValue),
            Collected: Math.round(a.collectedValue)
          }))} />
        </div>
      </div>

      {/* Owner Performance Grid */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-semibold text-white">BD/KAM Performance Overview</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left py-2.5 px-3 text-slate-400 font-semibold">Owner Code</th>
                <th className="text-right py-2.5 px-3 text-slate-400 font-semibold">Total Deals</th>
                <th className="text-right py-2.5 px-3 text-slate-400 font-semibold">Pipeline Value</th>
                <th className="text-right py-2.5 px-3 text-slate-400 font-semibold">Won Deals</th>
                <th className="text-right py-2.5 px-3 text-slate-400 font-semibold">Won Value</th>
                <th className="text-right py-2.5 px-3 text-slate-400 font-semibold">WOs Delivered</th>
                <th className="text-right py-2.5 px-3 text-slate-400 font-semibold">Cash Collected</th>
              </tr>
            </thead>
            <tbody>
              {owners.slice(0, 10).map((o, i) => (
                <tr key={i} className={`border-b border-white/[0.03] ${i % 2 === 0 ? '' : 'bg-white/[0.01]'} hover:bg-white/[0.04] transition-colors`}>
                  <td className="py-2.5 px-3 text-white font-medium">{o.owner}</td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{o.dealsCount}</td>
                  <td className="py-2.5 px-3 text-right text-sky-300">{formatINR(o.pipelineValue)}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-400">{o.wonCount}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-300">{formatINR(o.wonValue)}</td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{o.woDelivered}</td>
                  <td className="py-2.5 px-3 text-right text-amber-300">{formatINR(o.totalCollected)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
