import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const formatValue = (val) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  return `₹${(val / 1000).toFixed(0)}K`;
};

const COLORS = ['#38BDF8', '#3B82F6', '#10B981', '#F59E0B', '#A855F7', '#F43F5E', '#6366F1', '#14B8A6'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#1a2236] border border-white/10 rounded-lg px-4 py-3 shadow-xl text-xs">
      <p className="font-semibold text-white mb-1">{d.name}</p>
      <p className="text-slate-300">Value: <span className="text-white font-medium">{formatValue(d.value)}</span></p>
      {d.count !== undefined && <p className="text-slate-400">{d.count} deals in stage</p>}
    </div>
  );
};

export default function FunnelChart({ data }) {
  if (!data || data.length === 0) return <p className="text-xs text-slate-500">No funnel data available.</p>;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
          <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={formatValue} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
          <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={140} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={28}>
            {data.map((entry, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
