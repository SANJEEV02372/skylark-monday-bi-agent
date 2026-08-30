import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, BarChart3, FileText, Shield, Settings, Sparkles, RefreshCw } from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import DashboardOverview from './components/DashboardOverview';
import LeadershipBrief from './components/LeadershipBrief';
import DataQualityAudit from './components/DataQualityAudit';
import MondaySettingsModal from './components/MondaySettingsModal';
import { mondayService } from './services/mondayApi';
import { computeExecutiveKPIs, getSectorAnalysis, getFunnelMetrics, getRevenueWaterfall, getARPriorityList, getOwnerPerformance } from './services/biEngine';
import { correlateBoards, auditDataQuality } from './services/dataResilience';

const TABS = [
  { id: 'chat', label: 'Executive Copilot', icon: MessageSquare, badge: 'AI' },
  { id: 'dashboard', label: 'BI Analytics', icon: BarChart3 },
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#09090B] text-white">
        <div className="w-9 h-9 rounded-xl bg-white text-black font-bold flex items-center justify-center text-sm shadow-xl animate-pulse">
          S
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-xs font-mono text-zinc-400 tracking-wider">INITIALIZING SKYLARK BI ENGINE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col font-sans antialiased selection:bg-zinc-800 selection:text-white">
      {/* High-Impact Top Header */}
      <header className="border-b border-zinc-800/80 bg-[#09090B]/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1550px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-white text-black font-extrabold flex items-center justify-center text-xs shadow-md">
              S
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white tracking-tight">Skylark Drones</span>
              <span className="hidden sm:inline-block text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                EXECUTIVE BI AGENT
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800/80">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-zinc-800 text-white font-semibold shadow-sm border border-zinc-700/60'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.badge && (
                    <span className="text-[9px] font-mono bg-white text-black font-bold px-1 rounded sm:ml-0.5">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Connection Status & Settings */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-mono font-medium border ${
              isLive
                ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/60'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
              <span className="hidden sm:inline">{isLive ? 'LIVE MONDAY API' : 'DEMO MODE'}</span>
              <span className="sm:hidden">{isLive ? 'LIVE' : 'DEMO'}</span>
            </div>

            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-200 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-all shadow-sm"
            >
              <Settings className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Monday.com</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[1550px] w-full mx-auto px-4 sm:px-6 py-5 sm:py-6">
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
