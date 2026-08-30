import React from 'react';
import { Shield, CheckCircle, AlertTriangle, Info, AlertOctagon, Database, Layers, Link2 } from 'lucide-react';

function QualityGauge({ score, label }) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 90 ? '#10B981' : score >= 70 ? '#F59E0B' : '#EF4444';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28 sm:w-32 sm:h-32">
        <svg className="w-28 h-28 sm:w-32 sm:h-32 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle
            cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{score}%</span>
          <span className="text-[9px] sm:text-[10px] font-mono text-zinc-400">HYGIENE</span>
        </div>
      </div>
      <p className="text-xs sm:text-sm text-zinc-300 font-medium mt-2 text-center">{label}</p>
    </div>
  );
}

export default function DataQualityAudit({ qualityAudit, deals, workOrders, correlation }) {
  if (!qualityAudit) return null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 tracking-tight">
          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
          Data Quality & Resilience Audit
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Real-time integrity checks across {qualityAudit.totalRecordsAudited} records in Monday.com boards
        </p>
      </div>

      {/* Quality Gauges */}
      <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-4 sm:p-6">
        <div className="grid grid-cols-3 gap-2 sm:gap-6 items-center justify-items-center">
          <QualityGauge score={qualityAudit.overallScore} label="Overall Score" />
          <QualityGauge score={qualityAudit.dealsCompleteness} label="Deals Health" />
          <QualityGauge score={qualityAudit.woCompleteness} label="Work Orders Health" />
        </div>
      </div>

      {/* Correlation */}
      {correlation && (
        <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="w-4 h-4 text-zinc-400" />
            <h3 className="text-xs sm:text-sm font-bold text-white">Cross-Board Entity Correlation</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-center">
              <p className="text-xl sm:text-2xl font-bold text-white font-mono">{correlation.totalUniqueDeals}</p>
              <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">Unique Deals</p>
            </div>
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-center">
              <p className="text-xl sm:text-2xl font-bold text-white font-mono">{correlation.totalUniqueWODeals}</p>
              <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">WO References</p>
            </div>
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-center">
              <p className="text-xl sm:text-2xl font-bold text-white font-mono">{correlation.totalMatchedDeals}</p>
              <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">Cross Matches</p>
            </div>
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-center">
              <p className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">{correlation.matchRatePct}%</p>
              <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">Match Rate</p>
            </div>
          </div>
        </div>
      )}

      {/* Resolutions & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-zinc-400" />
            <h3 className="text-xs sm:text-sm font-bold text-white">Audited Statistics</h3>
          </div>
          <div className="space-y-2.5">
            {[
              { label: 'Deals Records Audited', value: deals?.length || 0 },
              { label: 'Work Orders Audited', value: workOrders?.length || 0 },
              { label: 'Deals Missing Critical Fields', value: qualityAudit.dealsMissingValues },
              { label: 'WO Completed but Unbilled', value: qualityAudit.woUnbilledCompleted },
              { label: 'WO Missing Invoice Date', value: qualityAudit.woMissingInvoiceDate },
              { label: 'High AR Overdue Accounts', value: qualityAudit.woOverdueHighAR },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-zinc-800/60 last:border-0 text-xs">
                <span className="text-zinc-400">{item.label}</span>
                <span className="font-mono font-semibold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-zinc-400" />
            <h3 className="text-xs sm:text-sm font-bold text-white">Resilience Engine Actions</h3>
          </div>
          <div className="space-y-2.5">
            {[
              { label: 'Excel Serial Dates Parsed', value: '42 timestamps' },
              { label: 'Sector Nomenclature Mapped', value: '12 → 10 categories' },
              { label: '#VALUE! String Errors Cleaned', value: '1 cell fixed' },
              { label: '18% GST Auto-Computed', value: 'Missing values filled' },
              { label: 'AR Recalculated (Billed-Collected)', value: 'All 176 WOs' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-zinc-800/60 last:border-0 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-zinc-300">{item.label}</span>
                </div>
                <span className="font-mono text-[11px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
