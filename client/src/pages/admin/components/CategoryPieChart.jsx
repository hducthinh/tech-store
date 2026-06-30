import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { PIE_COLORS, PIE_DATA } from '../../../components/SharedUI';

export default function CategoryPieChart({ data }) {
  const chartData = data && data.length ? data : PIE_DATA;
  const dataKey = data && data.length ? "percentage" : "value";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}
          dataKey={dataKey} stroke="none"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
          formatter={(value) => [`${value}%`, 'Tỷ trọng']}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
