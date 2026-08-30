import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, BarChart3, FileText, Shield, Settings, Zap, ArrowUpRight } from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import DashboardOverview from './components/DashboardOverview';
import LeadershipBrief from './components/LeadershipBrief';
import DataQualityAudit from './components/DataQualityAudit';
import MondaySettingsModal from './components/MondaySettingsModal';
import { mondayService } from './services/mondayApi';
import { computeExecutiveKPIs, getSectorAnalysis, getFunnelMetrics, getRevenueWaterfall, getARPriorityList, getOwnerPerformance } from './services/biEngine';
import { correlateBoards, auditDataQuality } from './services/dataResilience';

const TABS = [
  { id: 'chat', label: 'Executive Copilot', icon: MessageSquare },
  { id: 'dashboard', label: 'BI Dashboard', icon: BarChart3 },
  { id: 'leadership', label: 'Leadership Updates', icon: FileText },
  { id: 'quality', label: 'Data Quality', icon: Shield },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [showSettings, setShowSettings] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  // Shared state
  const [deals, setDeals] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [dataSource, setDataSource] = useState('');
  const [kpis, setKpis] = useState(null);
  const [sectors, setSectors] = useState([]);
  const [funnel, setFunnel] = useState([]);
  const [waterfall, setWaterfall] = useState([]);
  const [arList, setArList] = useState([]);
  const [owners, setOwners] = useState([]);
  const [correlation, setCorrelation] = useState(null);
  const [qualityAudit, setQualityAudit] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await mondayService.fetchAllData();
      setDeals(result.deals);
      setWorkOrders(result.workOrders);
      setDataSource(result.source);
      setIsLive(mondayService.isLiveMode);

      setKpis(computeExecutiveKPIs(result.deals, result.workOrders));
      setSectors(getSectorAnalysis(result.deals, result.workOrders));
      setFunnel(getFunnelMetrics(result.deals));
      setWaterfall(getRevenueWaterfall(result.workOrders));
      setArList(getARPriorityList(result.workOrders, 15));
      setOwners(getOwnerPerformance(result.deals, result.workOrders));
      setCorrelation(correlateBoards(result.deals, result.workOrders));
      setQualityAudit(auditDataQuality(result.deals, result.workOrders));
    } catch (err) {
      console.error('Data load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#09090B]">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        <p className="text-xs font-mono text-zinc-400">LOADING SKYLARK INTELLIGENCE ENGINE...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col font-sans">
      {/* High-Quality SaaS Header Bar */}
      <header className="border-b border-zinc-800/80 bg-[#09090B]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1550px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-white text-black flex items-center justify-center font-bold text-xs shadow-sm">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white tracking-tight">Skylark Drones</span>
                <span className="text-[10px] font-mono uppercase bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-700">BI Agent</span>
              </div>
            </div>
          </div>

          {/* Minimalist SaaS Tab Selector */}
          <nav className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-lg border border-zinc-800">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono border ${
              isLive
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
              {isLive ? 'LIVE MONDAY API' : 'DEMO MODE'}
            </div>

            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-zinc-400" />
              <span>Monday.com</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-[1550px] w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'chat' && (
          <ChatInterface
            deals={deals}
            workOrders={workOrders}
            kpis={kpis}
            sectors={sectors}
            qualityAudit={qualityAudit}
          />
        )}
        {activeTab === 'dashboard' && (
          <DashboardOverview
            kpis={kpis}
            sectors={sectors}
            funnel={funnel}
            waterfall={waterfall}
            arList={arList}
            owners={owners}
            deals={deals}
            workOrders={workOrders}
          />
        )}
        {activeTab === 'leadership' && (
          <LeadershipBrief
            kpis={kpis}
            sectors={sectors}
            waterfall={waterfall}
            qualityAudit={qualityAudit}
            deals={deals}
            workOrders={workOrders}
            arList={arList}
          />
        )}
        {activeTab === 'quality' && (
          <DataQualityAudit
            qualityAudit={qualityAudit}
            deals={deals}
            workOrders={workOrders}
            correlation={correlation}
          />
        )}
      </main>

      {/* Monday Settings Modal */}
      {showSettings && (
        <MondaySettingsModal
          onClose={() => setShowSettings(false)}
          onSaved={() => { setShowSettings(false); loadData(); }}
          isLive={isLive}
          dataSource={dataSource}
        />
      )}
    </div>
  );
}
