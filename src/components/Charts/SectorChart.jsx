import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const formatValue = (val) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  return `₹${(val / 1000).toFixed(0)}K`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 shadow-2xl text-xs">
      <p className="font-semibold text-white mb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: entry.color }} />
          <span className="text-zinc-400">{entry.name}:</span>
          <span className="text-white font-mono font-medium">{formatValue(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function SectorChart({ data }) {
  if (!data || data.length === 0) return <p className="text-xs text-zinc-500">No sector data available.</p>;

  const keys = Object.keys(data[0]).filter(k => k !== 'name');
  const colors = ['#FFFFFF', '#A1A1AA', '#34D399', '#52525B'];

  return (
    <div className="w-full h-56 sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="name" tick={{ fill: '#A1A1AA', fontSize: 10 }} axisLine={{ stroke: '#27272A' }} />
          <YAxis tick={{ fill: '#A1A1AA', fontSize: 9 }} tickFormatter={formatValue} axisLine={{ stroke: '#27272A' }} width={45} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
          <Legend wrapperStyle={{ fontSize: 11, color: '#A1A1AA' }} />
          {keys.map((key, i) => (
            <Bar key={key} dataKey={key} fill={colors[i % colors.length]} radius={[3, 3, 0, 0]} maxBarSize={32} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
