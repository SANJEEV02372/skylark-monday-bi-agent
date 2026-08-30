import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Copy, Check, ArrowRight, AlertTriangle, HelpCircle, Loader2 } from 'lucide-react';
import { processExecutiveQuery, formatINR } from '../services/aiAgent';
import SectorChart from './Charts/SectorChart';
import FunnelChart from './Charts/FunnelChart';
import WaterfallChart from './Charts/WaterfallChart';
import ARTable from './Charts/ARTable';

const FOUNDER_PROMPTS = [
  { label: "Pipeline by Energy Sector", query: "How's our pipeline looking for energy sector this quarter?" },
  { label: "Unbilled Completed Projects", query: "What is our total unbilled work order value for completed projects?" },
  { label: "AR Overdue Accounts", query: "Which accounts have the highest accounts receivable overdue?" },
  { label: "Cross-Board Comparison", query: "Compare projected deal values with actual collected amounts across sectors" },
  { label: "Deal Funnel Velocity", query: "Show me the deal pipeline funnel and win rates" },
  { label: "Executive Leadership Brief", query: "Generate a weekly executive leadership update for the board" },
];

function MarkdownRenderer({ content }) {
  if (!content) return null;

  // 1. Process Markdown Tables first
  const tableRegex = /((?:\|[^\n]+\|\n?)+)/g;
  let textWithTables = content.replace(tableRegex, (match) => {
    const lines = match.trim().split('\n').filter(l => l.trim().startsWith('|'));
    if (lines.length < 2) return match;
    
    const hasSeparator = lines[1] && lines[1].includes('---');
    const headerLine = lines[0];
    const dataLines = lines.slice(hasSeparator ? 2 : 1);

    const headers = headerLine.split('|').map(c => c.trim()).filter(Boolean);
    if (headers.length === 0) return match;

    let html = '<div class="my-3 overflow-x-auto rounded-xl border border-zinc-800 bg-[#0A0A0C] shadow-inner"><table class="w-full text-xs text-left">';
    html += '<thead><tr class="bg-zinc-900 border-b border-zinc-800 text-zinc-300">';
    headers.forEach(h => {
      html += `<th class="px-3.5 py-2.5 font-semibold whitespace-nowrap">${h}</th>`;
    });
    html += '</tr></thead><tbody class="divide-y divide-zinc-800/40">';

    dataLines.forEach((row, ri) => {
      const cells = row.split('|').map(c => c.trim()).filter(Boolean);
      if (cells.length === 0) return;
      html += `<tr class="${ri % 2 === 0 ? 'bg-transparent' : 'bg-zinc-900/30'} hover:bg-zinc-800/40 transition-colors">`;
      cells.forEach(c => {
        html += `<td class="px-3.5 py-2 text-zinc-300 whitespace-nowrap">${c}</td>`;
      });
      html += '</tr>';
    });

    html += '</tbody></table></div>';
    return html;
  });

  // 2. Process inline formatting & headers
  const finalHtml = textWithTables
    .replace(/### (.*)/g, '<h3 class="text-base font-bold text-white mt-4 mb-2 tracking-tight">$1</h3>')
    .replace(/#### (.*)/g, '<h4 class="text-xs font-semibold text-zinc-300 mt-3 mb-1.5 uppercase tracking-wider">$1</h4>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-zinc-400">$1</em>')
    .replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-mono">$1</code>')
    .replace(/^> (💡|📌|⚡|📊|🚨)(.*)/gm, '<div class="my-2.5 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs sm:text-sm text-zinc-200 leading-relaxed">$1$2</div>')
    .replace(/^> (.*)/gm, '<div class="my-2.5 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs sm:text-sm text-zinc-300 leading-relaxed">$1</div>')
    .replace(/^- (.*)/gm, '<li class="ml-4 text-xs sm:text-sm text-zinc-300 leading-relaxed list-disc my-0.5">$1</li>')
    .replace(/^\d+\. (.*)/gm, '<li class="ml-4 text-xs sm:text-sm text-zinc-300 leading-relaxed list-decimal my-0.5">$1</li>')
    .replace(/\n---\n/g, '<hr class="my-4 border-zinc-800"/>')
    .replace(/\n\n/g, '<div class="h-2"></div>')
    .replace(/\n/g, '<br/>');

  return <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: finalHtml }} />;
}

function ChartRenderer({ chart }) {
  if (!chart || !chart.data || chart.data.length === 0) return null;

  return (
    <div className="bg-[#0A0A0C] border border-zinc-800 rounded-xl p-3 sm:p-4 mt-2">
      {chart.type === 'sector_bar' && <SectorChart data={chart.data} />}
      {chart.type === 'funnel' && <FunnelChart data={chart.data} />}
      {chart.type === 'waterfall' && <WaterfallChart data={chart.data} />}
      {chart.type === 'ar_ranking' && <ARTable data={chart.data} />}
    </div>
  );
}

export default function ChatInterface({ deals, workOrders, kpis, sectors, qualityAudit }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (query) => {
    const q = query || inputValue.trim();
    if (!q) return;

    const userMsg = { role: 'user', content: q, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsProcessing(true);

    try {
      const result = await processExecutiveQuery(q, deals, workOrders);
      const agentMsg = {
        role: 'agent',
        title: result.title,
        content: result.markdown,
        chart: result.chart,
        caveats: result.caveats || [],
        clarifyingQuestions: result.clarifyingQuestions || [],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, agentMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'agent',
        title: 'Error Processing Query',
        content: `Issue encountered: ${err.message}. Please rephrase your query.`,
        caveats: [],
        clarifyingQuestions: [],
        timestamp: new Date()
      }]);
    } finally {
      setIsProcessing(false);
      inputRef.current?.focus();
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text.replace(/<[^>]*>/g, '').replace(/\*\*/g, '').replace(/###/g, '').replace(/####/g, ''));
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)]">
      {/* Thread Window */}
      <div className="flex-1 overflow-y-auto px-1 space-y-5 pb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-10">
            <div className="w-12 h-12 rounded-xl bg-white text-black font-black flex items-center justify-center mb-4 text-lg shadow-xl">
              S
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5 tracking-tight text-center">
              Executive Intelligence Copilot
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-md text-center mb-8">
              Ask natural language business questions across your Monday.com Deals & Work Orders boards.
            </p>

            {/* High Impact Prompt Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-w-3xl w-full">
              {FOUNDER_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSubmit(p.query)}
                  className="group bg-[#121215] border border-zinc-800 hover:border-zinc-500 rounded-xl p-3.5 text-left transition-all duration-200 hover:bg-zinc-900 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <p className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">{p.label}</p>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors flex-shrink-0 mt-0.5" />
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1 truncate">{p.query}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'user' ? (
              <div className="max-w-xl">
                <div className="bg-zinc-800 text-white rounded-2xl rounded-tr-xs px-4 py-2.5 border border-zinc-700/80 text-xs sm:text-sm font-medium shadow-sm">
                  {msg.content}
                </div>
                <p className="text-[10px] text-zinc-500 mt-1 text-right font-mono">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ) : (
              <div className="max-w-4xl w-full">
                <div className="bg-[#121215] border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
                  {/* Card Header */}
                  <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 bg-zinc-900/60">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-white text-black font-bold flex items-center justify-center text-[10px]">
                        AI
                      </div>
                      <span className="text-xs font-bold text-white tracking-tight">{msg.title || 'Executive Insight'}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(msg.content, idx)}
                      className="flex items-center gap-1 text-zinc-400 hover:text-white text-xs font-medium transition-colors bg-zinc-800/60 px-2.5 py-1 rounded-md border border-zinc-700/60"
                    >
                      {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="px-5 py-4">
                    <MarkdownRenderer content={msg.content} />
                  </div>

                  {/* Chart */}
                  {msg.chart && (
                    <div className="px-5 pb-4">
                      <ChartRenderer chart={msg.chart} />
                    </div>
                  )}

                  {/* Caveats */}
                  {msg.caveats && msg.caveats.length > 0 && (
                    <div className="px-5 pb-4">
                      <div className="bg-zinc-900 border border-amber-500/20 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-xs font-semibold text-amber-400">Data Hygiene Note</span>
                        </div>
                        {msg.caveats.map((c, ci) => (
                          <p key={ci} className="text-xs text-zinc-400 leading-relaxed">• {c}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Follow-up suggestions */}
                  {msg.clarifyingQuestions && msg.clarifyingQuestions.length > 0 && (
                    <div className="px-5 pb-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-xs font-semibold text-zinc-300">Suggested Drill-Downs</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {msg.clarifyingQuestions.map((cq, ci) => (
                          <button
                            key={ci}
                            onClick={() => handleSubmit(cq)}
                            className="text-xs bg-zinc-900 text-zinc-300 border border-zinc-700/80 hover:bg-zinc-800 hover:text-white rounded-lg px-3 py-1.5 transition-all text-left"
                          >
                            {cq}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-[10px] font-mono text-zinc-500 mt-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-[#121215] border border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
              <p className="text-xs text-zinc-300 font-mono">Decomposing query across Monday.com schema...</p>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <div className="pt-2.5 border-t border-zinc-800">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask any founder business query..."
            disabled={isProcessing}
            className="flex-1 bg-[#121215] border border-zinc-800 focus:border-zinc-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isProcessing}
            className="h-10 px-4 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 disabled:opacity-30 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
