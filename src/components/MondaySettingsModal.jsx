import React, { useState } from 'react';
import { X, Globe, Key, Hash, CheckCircle, AlertCircle, Loader2, Wifi, WifiOff, ExternalLink } from 'lucide-react';
import { mondayService } from '../services/mondayApi';

export default function MondaySettingsModal({ onClose, onSaved, isLive, dataSource }) {
  const [apiToken, setApiToken] = useState(localStorage.getItem('monday_api_token') || '');
  const [dealsBoardId, setDealsBoardId] = useState(localStorage.getItem('monday_deals_board_id') || '');
  const [woBoardId, setWoBoardId] = useState(localStorage.getItem('monday_wo_board_id') || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await mondayService.testConnection(apiToken, dealsBoardId || woBoardId);
      setTestResult(result);
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    mondayService.setCredentials(apiToken, dealsBoardId, woBoardId);
    onSaved();
  };

  const handleDemoMode = () => {
    mondayService.clearCredentials();
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg glass-panel rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Monday.com Connection Hub</h3>
              <p className="text-xs text-slate-400">Configure live API or use demo mode</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Status */}
        <div className="px-6 py-3 border-b border-white/[0.04]">
          <div className={`flex items-center gap-2 text-xs font-medium ${isLive ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isLive ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {isLive ? 'Connected to Live Monday.com API' : 'Running in Demo Mode (Embedded Dataset)'}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">{dataSource}</p>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">
          {/* API Token */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
              <Key className="w-3.5 h-3.5" />
              Monday.com API Token
            </label>
            <input
              type="password"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiJ9..."
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/40 transition-colors"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Get your token from <a href="https://monday.com" target="_blank" rel="noopener" className="text-sky-400 hover:underline">Monday.com</a> → Admin → API
            </p>
          </div>

          {/* Board IDs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <Hash className="w-3.5 h-3.5" />
                Deals Board ID
              </label>
              <input
                type="text"
                value={dealsBoardId}
                onChange={(e) => setDealsBoardId(e.target.value)}
                placeholder="1234567890"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/40 transition-colors"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
                <Hash className="w-3.5 h-3.5" />
                Work Orders Board ID
              </label>
              <input
                type="text"
                value={woBoardId}
                onChange={(e) => setWoBoardId(e.target.value)}
                placeholder="9876543210"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/40 transition-colors"
              />
            </div>
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`flex items-start gap-2 px-4 py-3 rounded-xl text-xs ${
              testResult.success
                ? 'bg-emerald-500/[0.08] border border-emerald-500/15 text-emerald-300'
                : 'bg-rose-500/[0.08] border border-rose-500/15 text-rose-300'
            }`}>
              {testResult.success ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
              <div>
                <p className="font-medium">{testResult.message}</p>
                {testResult.boards && testResult.boards.length > 0 && (
                  <div className="mt-1.5 space-y-0.5">
                    {testResult.boards.map((b, i) => (
                      <p key={i} className="text-slate-400">Board: <span className="text-white">{b.name}</span> (ID: {b.id}, {b.items_count} items)</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
          <button
            onClick={handleDemoMode}
            className="text-xs text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/[0.04]"
          >
            Use Demo Mode
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTest}
              disabled={!apiToken || testing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/[0.06] text-slate-300 border border-white/[0.08] hover:bg-white/[0.10] disabled:opacity-40 transition-all"
            >
              {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wifi className="w-4 h-4" />}
              Test Connection
            </button>
            <button
              onClick={handleSave}
              disabled={!apiToken}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 disabled:opacity-40 transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              Save & Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
