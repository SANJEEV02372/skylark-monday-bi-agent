import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const formatValue = (val) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  return `₹${(val / 1000).toFixed(0)}K`;
};

const COLORS = { Receivable: '#F59E0B', Billed: '#3B82F6', Collected: '#10B981' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-[#1a2236] border border-white/10 rounded-lg px-4 py-3 shadow-xl text-xs">
      <p className="font-semibold text-white mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-400">{entry.name}:</span>
          <span className="text-white font-medium">{formatValue(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function ARTable({ data }) {
  if (!data || data.length === 0) return <p className="text-xs text-slate-500">No AR data available.</p>;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={formatValue} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
          <Bar dataKey="Billed" fill={COLORS.Billed} radius={[4, 4, 0, 0]} maxBarSize={30} />
          <Bar dataKey="Collected" fill={COLORS.Collected} radius={[4, 4, 0, 0]} maxBarSize={30} />
          <Bar dataKey="Receivable" fill={COLORS.Receivable} radius={[4, 4, 0, 0]} maxBarSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
