import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const formatValue = (val) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  return `₹${(val / 1000).toFixed(0)}K`;
};

const SAAS_COLORS = ['#FFFFFF', '#E4E4E7', '#34D399', '#FBBF24', '#A1A1AA', '#F87171'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 shadow-2xl text-xs">
      <p className="font-semibold text-white mb-1">{d.name}</p>
      <p className="text-zinc-300">Amount: <span className="text-white font-mono font-medium">{formatValue(d.value)}</span></p>
    </div>
  );
};

export default function WaterfallChart({ data }) {
  if (!data || data.length === 0) return <p className="text-xs text-zinc-500">No waterfall data available.</p>;

  return (
    <div className="w-full h-56 sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="name" tick={{ fill: '#A1A1AA', fontSize: 9 }} axisLine={{ stroke: '#27272A' }} angle={-15} textAnchor="end" height={45} />
          <YAxis tick={{ fill: '#A1A1AA', fontSize: 9 }} tickFormatter={formatValue} axisLine={{ stroke: '#27272A' }} width={45} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={36}>
            {data.map((entry, i) => (
              <Cell key={i} fill={SAAS_COLORS[i % SAAS_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
