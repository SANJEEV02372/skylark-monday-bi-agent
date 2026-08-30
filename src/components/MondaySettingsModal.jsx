import React, { useState } from 'react';
import { X, Globe, Key, Hash, CheckCircle, AlertCircle, Loader2, Wifi, WifiOff } from 'lucide-react';
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#121215] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">Monday.com Connection</h3>
              <p className="text-[10px] sm:text-xs text-zinc-400">Configure GraphQL API or Demo Mode</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status */}
        <div className="px-4 sm:px-6 py-2.5 bg-zinc-900/60 border-b border-zinc-800">
          <div className={`flex items-center gap-2 text-xs font-mono font-medium ${isLive ? 'text-emerald-400' : 'text-zinc-400'}`}>
            {isLive ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {isLive ? 'CONNECTED TO LIVE MONDAY API' : 'DEMO MODE (EMBEDDED DATASET)'}
          </div>
        </div>

        {/* Inputs */}
        <div className="px-4 sm:px-6 py-4 space-y-3.5">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 mb-1">
              <Key className="w-3.5 h-3.5 text-zinc-500" />
              API Personal Token
            </label>
            <input
              type="password"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1..."
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-600 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none transition-all font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 mb-1">
                <Hash className="w-3.5 h-3.5 text-zinc-500" />
                Deals Board ID
              </label>
              <input
                type="text"
                value={dealsBoardId}
                onChange={(e) => setDealsBoardId(e.target.value)}
                placeholder="1234567890"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-600 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none transition-all font-mono"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 mb-1">
                <Hash className="w-3.5 h-3.5 text-zinc-500" />
                Work Orders Board ID
              </label>
              <input
                type="text"
                value={woBoardId}
                onChange={(e) => setWoBoardId(e.target.value)}
                placeholder="9876543210"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-600 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none transition-all font-mono"
              />
            </div>
          </div>

          {testResult && (
            <div className={`flex items-start gap-2 p-3 rounded-xl text-xs font-mono ${
              testResult.success
                ? 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-300'
                : 'bg-rose-950/40 border border-rose-800/60 text-rose-300'
            }`}>
              {testResult.success ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
              <div>
                <p className="font-medium">{testResult.message}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-4 sm:px-6 py-3.5 border-t border-zinc-800 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5">
          <button
            onClick={handleDemoMode}
            className="w-full sm:w-auto text-xs text-zinc-400 hover:text-white py-1.5 text-center transition-colors"
          >
            Switch to Demo Mode
          </button>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleTest}
              disabled={!apiToken || testing}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-40 transition-all"
            >
              {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wifi className="w-3.5 h-3.5" />}
              Test
            </button>
            <button
              onClick={handleSave}
              disabled={!apiToken}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:bg-zinc-200 disabled:opacity-40 transition-all"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
