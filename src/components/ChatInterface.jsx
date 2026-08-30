import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageCircle, ChevronRight, Copy, Check, BarChart3, AlertTriangle, HelpCircle, Loader2 } from 'lucide-react';
import { processExecutiveQuery, formatINR } from '../services/aiAgent';
import SectorChart from './Charts/SectorChart';
import FunnelChart from './Charts/FunnelChart';
import WaterfallChart from './Charts/WaterfallChart';
import ARTable from './Charts/ARTable';

const FOUNDER_PROMPTS = [
  { label: "Pipeline by Energy Sector", query: "How's our pipeline looking for energy sector this quarter?", icon: "⚡" },
  { label: "Unbilled Completed Projects", query: "What is our total unbilled work order value for completed projects?", icon: "📋" },
  { label: "AR Overdue Accounts", query: "Which accounts have the highest accounts receivable overdue?", icon: "💰" },
  { label: "Cross-Board Comparison", query: "Compare projected deal values with actual collected amounts across sectors", icon: "🔄" },
  { label: "Deal Funnel Health", query: "Show me the deal pipeline funnel and win rates", icon: "🎯" },
  { label: "Executive Leadership Brief", query: "Generate a weekly executive leadership update for the board", icon: "📑" },
];

function MarkdownRenderer({ content }) {
  if (!content) return null;

  // 1. Process Markdown Tables first
  const tableRegex = /((?:\|[^\n]+\|\n?)+)/g;
  let textWithTables = content.replace(tableRegex, (match) => {
    const lines = match.trim().split('\n').filter(l => l.trim().startsWith('|'));
    if (lines.length < 2) return match;
    
    // Check if second line is separator |:---|---|
    const hasSeparator = lines[1] && lines[1].includes('---');
    const headerLine = lines[0];
    const dataLines = lines.slice(hasSeparator ? 2 : 1);

    const headers = headerLine.split('|').map(c => c.trim()).filter(Boolean);
    if (headers.length === 0) return match;

    let html = '<div class="my-3 overflow-x-auto rounded-xl border border-white/[0.08] shadow-lg"><table class="w-full text-xs text-left">';
    html += '<thead><tr class="bg-white/[0.06] border-b border-white/[0.08]">';
    headers.forEach(h => {
      html += `<th class="px-3.5 py-2.5 font-semibold text-slate-200 whitespace-nowrap">${h}</th>`;
    });
    html += '</tr></thead><tbody>';

    dataLines.forEach((row, ri) => {
      const cells = row.split('|').map(c => c.trim()).filter(Boolean);
      if (cells.length === 0) return;
      html += `<tr class="border-b border-white/[0.03] ${ri % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.015]'} hover:bg-white/[0.04] transition-colors">`;
      cells.forEach(c => {
        html += `<td class="px-3.5 py-2 text-slate-300 whitespace-nowrap">${c}</td>`;
      });
      html += '</tr>';
    });

    html += '</tbody></table></div>';
    return html;
  });

  // 2. Process inline formatting & headers
  const finalHtml = textWithTables
    .replace(/### (.*)/g, '<h3 class="text-base font-bold text-white mt-4 mb-2">$1</h3>')
    .replace(/#### (.*)/g, '<h4 class="text-sm font-semibold text-slate-200 mt-3 mb-1.5">$1</h4>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-slate-300">$1</em>')
    .replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-mono">$1</code>')
    .replace(/^> (💡|📌|⚡|📊|🚨)(.*)/gm, '<div class="my-2.5 px-4 py-3 rounded-xl bg-sky-500/[0.08] border-l-2 border-sky-400 text-xs sm:text-sm text-slate-200 leading-relaxed">$1$2</div>')
    .replace(/^> (.*)/gm, '<div class="my-2.5 px-4 py-3 rounded-xl bg-white/[0.03] border-l-2 border-slate-600 text-xs sm:text-sm text-slate-300 leading-relaxed">$1</div>')
    .replace(/^- (.*)/gm, '<li class="ml-4 text-xs sm:text-sm text-slate-300 leading-relaxed list-disc my-0.5">$1</li>')
    .replace(/^\d+\. (.*)/gm, '<li class="ml-4 text-xs sm:text-sm text-slate-300 leading-relaxed list-decimal my-0.5">$1</li>')
    .replace(/\n---\n/g, '<hr class="my-4 border-white/[0.06]"/>')
    .replace(/\n\n/g, '<div class="h-2"></div>')
    .replace(/\n/g, '<br/>');

  return <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: finalHtml }} />;
}

function ChartRenderer({ chart }) {
  if (!chart || !chart.data || chart.data.length === 0) return null;

  switch (chart.type) {
    case 'sector_bar':
      return <SectorChart data={chart.data} />;
    case 'funnel':
      return <FunnelChart data={chart.data} />;
    case 'waterfall':
      return <WaterfallChart data={chart.data} />;
    case 'ar_ranking':
      return <ARTable data={chart.data} />;
    default:
      return <SectorChart data={chart.data} />;
  }
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
        content: `I encountered an issue: ${err.message}. Please try rephrasing your question.`,
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
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto px-1 space-y-4 pb-4">
        {/* Welcome State */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <div className="relative mb-8">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-sky-500 via-cyan-400 to-blue-500 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -inset-3 rounded-[28px] bg-sky-500/15 blur-xl -z-10" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Executive Intelligence Copilot</h2>
            <p className="text-slate-400 text-sm max-w-lg text-center mb-8">
              Ask any founder-level business question across your Monday.com Deals & Work Orders boards. I'll provide real-time insights with data quality awareness.
            </p>

            {/* Founder Prompt Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl w-full">
              {FOUNDER_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSubmit(p.query)}
                  className="group glass-card rounded-xl px-4 py-3 text-left hover:bg-white/[0.06] hover:border-sky-500/20 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{p.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{p.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{p.query}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-sky-400 transition-colors mt-0.5 flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'user' ? (
              <div className="max-w-xl">
                <div className="bg-gradient-to-r from-sky-600 to-sky-500 rounded-2xl rounded-br-md px-5 py-3 shadow-lg shadow-sky-500/10">
                  <p className="text-sm text-white leading-relaxed">{msg.content}</p>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 text-right">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ) : (
              <div className="max-w-4xl w-full">
                <div className="glass-card rounded-2xl rounded-bl-md overflow-hidden">
                  {/* Agent Response Header */}
                  <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-slate-300">{msg.title || 'BI Agent Response'}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(msg.content, idx)}
                      className="flex items-center gap-1 text-slate-500 hover:text-slate-300 text-xs transition-colors"
                    >
                      {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedIdx === idx ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  {/* Markdown Content */}
                  <div className="px-5 py-4">
                    <MarkdownRenderer content={msg.content} />
                  </div>

                  {/* Chart Widget */}
                  {msg.chart && (
                    <div className="px-5 pb-4">
                      <ChartRenderer chart={msg.chart} />
                    </div>
                  )}

                  {/* Data Caveats */}
                  {msg.caveats && msg.caveats.length > 0 && (
                    <div className="px-5 pb-4">
                      <div className="bg-amber-500/[0.06] border border-amber-500/10 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-xs font-semibold text-amber-400">Data Quality Caveats</span>
                        </div>
                        {msg.caveats.map((c, ci) => (
                          <p key={ci} className="text-xs text-slate-400 leading-relaxed">• {c}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Clarifying Questions / Follow-ups */}
                  {msg.clarifyingQuestions && msg.clarifyingQuestions.length > 0 && (
                    <div className="px-5 pb-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                        <span className="text-xs font-semibold text-sky-400">Suggested Follow-Ups</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {msg.clarifyingQuestions.map((cq, ci) => (
                          <button
                            key={ci}
                            onClick={() => handleSubmit(cq)}
                            className="text-xs bg-sky-500/[0.08] text-sky-300 border border-sky-500/15 hover:bg-sky-500/15 hover:border-sky-500/30 rounded-lg px-3 py-1.5 transition-all duration-200 text-left"
                          >
                            {cq}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}
          </div>
        ))}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="glass-card rounded-2xl rounded-bl-md px-5 py-4 flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
              <div>
                <p className="text-sm text-slate-300">Analyzing across Monday.com boards...</p>
                <p className="text-xs text-slate-500">Cross-referencing Deals & Work Orders data</p>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <div className="pt-3 pb-2 border-t border-white/[0.04]">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
          className="flex items-center gap-3"
        >
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask any founder-level business question..."
              disabled={isProcessing}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-5 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/40 focus:bg-white/[0.06] transition-all duration-200 disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isProcessing}
            className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 disabled:opacity-40 disabled:shadow-none transition-all duration-200"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-[10px] text-slate-600 text-center mt-2">
          Powered by Skylark BI Engine • Querying {deals?.length || 0} Deals & {workOrders?.length || 0} Work Orders
        </p>
      </div>
    </div>
  );
}
