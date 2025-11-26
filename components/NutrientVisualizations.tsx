
import React from 'react';

interface NutrientBarProps {
  label: string;
  value: string;
  subValues?: { label: string; value: string }[];
  percentage: number;
  color?: string;
}

export const NutrientBar: React.FC<NutrientBarProps> = ({ label, value, subValues, percentage, color = "bg-emerald-500" }) => (
  <div className="mb-4">
    <div className="flex justify-between items-end mb-1">
      <span className="font-medium text-slate-700 text-sm">{label}</span>
      <div className="text-right">
        <span className="font-bold text-slate-800">{value}</span>
        <span className="text-xs text-slate-400 ml-1">({percentage?.toFixed(0)}% NRV)</span>
      </div>
    </div>
    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: `${Math.min(percentage || 0, 100)}%` }}></div>
    </div>
    {subValues && (
      <div className="flex gap-4 mt-1.5 ml-2">
        {subValues.map((sub: any, idx: number) => (
          <div key={idx} className="text-[10px] text-slate-500 flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
            <span>{sub.label}: {sub.value}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

interface MicroNutrientGridProps {
  items: Record<string, { value: string; nrvPercent: number }>;
}

export const MicroNutrientGrid: React.FC<MicroNutrientGridProps> = ({ items }) => (
  <div className="grid grid-cols-3 gap-2">
    {items && Object.entries(items).map(([key, data]) => (
      <div key={key} className="bg-slate-50 p-2 rounded-lg text-center border border-slate-100">
        <div className="text-[10px] text-slate-400 font-medium uppercase truncate">{key}</div>
        <div className="text-xs font-bold text-slate-700">{data?.value || '-'}</div>
        <div className="text-[10px] text-emerald-600">{data?.nrvPercent?.toFixed(0) || 0}%</div>
      </div>
    ))}
  </div>
);
