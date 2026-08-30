import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, BarChart3, FileText, Shield, Settings, Zap, Database, Globe, ChevronRight, Sparkles } from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import DashboardOverview from './components/DashboardOverview';
import LeadershipBrief from './components/LeadershipBrief';
import DataQualityAudit from './components/DataQualityAudit';
import MondaySettingsModal from './components/MondaySettingsModal';
import { mondayService } from './services/mondayApi';
import { computeExecutiveKPIs, getSectorAnalysis, getFunnelMetrics, getRevenueWaterfall, getARPriorityList, getOwnerPerformance } from './services/biEngine';
import { correlateBoards, auditDataQuality } from './services/dataResilience';

const TABS = [
  { id: 'chat', label: 'Executive Copilot', icon: MessageSquare, gradient: 'from-sky-500 to-cyan-400' },
  { id: 'dashboard', label: 'BI Dashboard', icon: BarChart3, gradient: 'from-violet-500 to-purple-400' },
  { id: 'leadership', label: 'Leadership Updates', icon: FileText, gradient: 'from-amber-500 to-yellow-400' },
  { id: 'quality', label: 'Data Quality', icon: Shield, gradient: 'from-emerald-500 to-green-400' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [showSettings, setShowSettings] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Shared data state
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

      // Pre-compute all analytics
      const k = computeExecutiveKPIs(result.deals, result.workOrders);
      setKpis(k);
      setSectors(getSectorAnalysis(result.deals, result.workOrders));
      setFunnel(getFunnelMetrics(result.deals));
      setWaterfall(getRevenueWaterfall(result.workOrders));
      setArList(getARPriorityList(result.workOrders, 15));
      setOwners(getOwnerPerformance(result.deals, result.workOrders));
      setCorrelation(correlateBoards(result.deals, result.workOrders));
      setQualityAudit(auditDataQuality(result.deals, result.workOrders));
      setDataLoaded(true);
    } catch (err) {
      console.error('Data load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSettingsSaved = () => {
    setShowSettings(false);
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#0B0F17]">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center animate-pulse-slow">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -inset-4 rounded-3xl bg-sky-500/20 blur-xl animate-pulse" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Loading Business Intelligence...</h2>
          <p className="text-sm text-slate-400">Normalizing 520+ records across Monday.com boards</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col">
      {/* Top Executive Bar */}
      <header className="border-b border-white/[0.06] glass-panel sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-white leading-tight">Skylark Drones</h1>
              <p className="text-[11px] text-slate-400 leading-tight -mt-0.5">Executive BI Agent</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex items-center gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`}
                >
                  {isActive && (
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${tab.gradient} opacity-[0.12]`} />
                  )}
                  <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-white' : ''}`} />
                  <span className="hidden md:inline relative z-10">{tab.label}</span>
                  {isActive && (
                    <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r ${tab.gradient}`} />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Data Source Badge */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
              isLive
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {isLive ? 'Live API' : 'Demo Mode'}
            </div>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-medium">Monday.com</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6">
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

      {/* Settings Modal */}
      {showSettings && (
        <MondaySettingsModal
          onClose={() => setShowSettings(false)}
          onSaved={handleSettingsSaved}
          isLive={isLive}
          dataSource={dataSource}
        />
      )}
    </div>
  );
}
