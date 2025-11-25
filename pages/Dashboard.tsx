
import React, { useState } from 'react';
import { AreaChart, Area, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Flame, Plus, Trash2, Activity, X, ChevronRight, Zap, Target } from 'lucide-react';
import { useDailyLog } from '../context/DailyLogContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { DetailedNutrients } from '../types';
import { NutrientBar, MicroNutrientGrid } from '../components/NutrientVisualizations';

const Dashboard: React.FC = () => {
  const { summary, logs, removeLog } = useDailyLog();
  const { userProfile } = useAuth();
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [dailyAnalysis, setDailyAnalysis] = useState<DetailedNutrients | null>(null);

  const targetCalories = userProfile?.tdee || 2000;
  const remainingCalories = Math.max(0, targetCalories - summary.totalCalories);
  
  // Targets (Simplified)
  const targetProtein = Math.round((targetCalories * 0.2) / 4);
  const targetCarbs = Math.round((targetCalories * 0.55) / 4);
  const targetFat = Math.round((targetCalories * 0.25) / 9);

  const proteinPercent = Math.min(100, (summary.totalProtein / targetProtein) * 100);
  const carbsPercent = Math.min(100, (summary.totalCarbs / targetCarbs) * 100);
  const fatPercent = Math.min(100, (summary.totalFat / targetFat) * 100);

  const calorieData = [
    { name: 'Eaten', value: summary.totalCalories },
    { name: 'Remaining', value: remainingCalories }
  ];

  const generateDailyAnalysis = () => {
    if (logs.length === 0) return;
    const agg: DetailedNutrients = {
      calories: { value: 0, nrvPercent: 0 },
      protein: { value: 0, nrvPercent: 0 },
      carbs: { total: { value: 0, nrvPercent: 0 }, available: { value: 0 }, fiber: { value: 0 } },
      fat: { total: { value: 0, nrvPercent: 0 }, saturated: { value: 0 }, monounsaturated: { value: 0 }, polyunsaturated: { value: 0 } },
      vitamins: {}, minerals: {}
    };

    const parseValue = (str: string): { val: number, unit: string } => {
      if (!str) return { val: 0, unit: '' };
      const match = str.match(/([\d.]+)([a-zA-Zμ%]+)?/);
      return match ? { val: parseFloat(match[1]), unit: match[2] || '' } : { val: 0, unit: '' };
    };

    logs.forEach(log => {
      agg.calories.value += log.calories;
      agg.protein.value += log.protein;
      agg.carbs.total.value += log.carbs;
      agg.fat.total.value += log.fat;

      if (log.detailedNutrients) {
        const d = log.detailedNutrients;
        agg.carbs.available.value += d.carbs.available.value || 0;
        agg.carbs.fiber.value += d.carbs.fiber.value || 0;
        agg.fat.saturated.value += d.fat.saturated.value || 0;
        agg.fat.monounsaturated.value += d.fat.monounsaturated.value || 0;
        agg.fat.polyunsaturated.value += d.fat.polyunsaturated.value || 0;
        agg.calories.nrvPercent += d.calories.nrvPercent || 0;
        agg.protein.nrvPercent += d.protein.nrvPercent || 0;
        agg.carbs.total.nrvPercent += d.carbs.total.nrvPercent || 0;
        agg.fat.total.nrvPercent += d.fat.total.nrvPercent || 0;

        Object.entries(d.vitamins).forEach(([key, data]) => {
           if (!agg.vitamins[key]) agg.vitamins[key] = { value: '0', nrvPercent: 0 };
           const current = parseValue(agg.vitamins[key].value);
           const vData = data as { value: string; nrvPercent: number };
           const income = parseValue(vData.value);
           agg.vitamins[key].value = `${(current.val + income.val).toFixed(1).replace(/\.0$/, '')}${income.unit || current.unit}`;
           agg.vitamins[key].nrvPercent += vData.nrvPercent || 0;
        });

        Object.entries(d.minerals).forEach(([key, data]) => {
           if (!agg.minerals[key]) agg.minerals[key] = { value: '0', nrvPercent: 0 };
           const current = parseValue(agg.minerals[key].value);
           const mData = data as { value: string; nrvPercent: number };
           const income = parseValue(mData.value);
           agg.minerals[key].value = `${(current.val + income.val).toFixed(1).replace(/\.0$/, '')}${income.unit || current.unit}`;
           agg.minerals[key].nrvPercent += mData.nrvPercent || 0;
        });
      }
    });

    agg.calories.value = Math.round(agg.calories.value);
    agg.protein.value = parseFloat(agg.protein.value.toFixed(1));
    agg.carbs.total.value = parseFloat(agg.carbs.total.value.toFixed(1));
    agg.fat.total.value = parseFloat(agg.fat.total.value.toFixed(1));

    setDailyAnalysis(agg);
    setShowAnalysis(true);
  };

  return (
    <div className="px-5 pt-8 space-y-8 bg-slate-50/50">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            早安, {userProfile?.nickname || '朋友'} <span className="inline-block animate-pulse">☀️</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">今天也要保持元气满满哦！</p>
        </div>
        <Link to="/profile" className="relative group">
          <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-100 group-active:scale-95 transition-transform">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                {userProfile?.avatarUrl ? <img src={userProfile.avatarUrl} className="w-full h-full object-cover"/> : <span className="text-lg font-bold text-emerald-600">{userProfile?.nickname?.[0] || '我'}</span>}
            </div>
          </div>
        </Link>
      </div>

      {/* Main Nutrition Card (Glassmorphism + Gradient) */}
      <div className="relative rounded-[2.5rem] bg-white p-6 shadow-[0_20px_40px_-10px_rgba(16,185,129,0.1)] border border-slate-50 overflow-hidden">
        {/* Decorative Gradients */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-50 to-teal-100/50 rounded-bl-[10rem] opacity-70 -z-10"></div>
        
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">今日热量目标</span>
             <div className="flex items-baseline gap-1">
               <span className="text-3xl font-black text-slate-800">{targetCalories}</span>
               <span className="text-xs font-bold text-slate-400">kcal</span>
             </div>
          </div>
          
          <div className="bg-orange-50/80 backdrop-blur-sm text-orange-500 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm border border-orange-100">
             <Flame size={12} fill="currentColor" className="animate-pulse" /> 连续打卡 3 天
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Donut Chart */}
          <div className="relative w-32 h-32 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={calorieData}
                  cx="50%" cy="50%"
                  innerRadius={45}
                  outerRadius={60}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={10}
                  paddingAngle={5}
                >
                  <Cell fill="url(#gradientMain)" />
                  <Cell fill="#f1f5f9" />
                </Pie>
                <defs>
                   <linearGradient id="gradientMain" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#0d9488" />
                   </linearGradient>
                </defs>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">剩余</span>
               <span className="text-2xl font-black text-slate-800 -mt-1">{remainingCalories.toFixed(0)}</span>
            </div>
          </div>

          {/* Macros */}
          <div className="flex-1 space-y-3">
             <div className="space-y-1">
               <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>碳水</span> <span className="text-slate-400">{summary.totalCarbs.toFixed(0)}/{targetCarbs}g</span>
               </div>
               <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full shadow-sm" style={{ width: `${carbsPercent}%` }}></div>
               </div>
             </div>
             <div className="space-y-1">
               <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>蛋白质</span> <span className="text-slate-400">{summary.totalProtein.toFixed(0)}/{targetProtein}g</span>
               </div>
               <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full shadow-sm" style={{ width: `${proteinPercent}%` }}></div>
               </div>
             </div>
             <div className="space-y-1">
               <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>脂肪</span> <span className="text-slate-400">{summary.totalFat.toFixed(0)}/{targetFat}g</span>
               </div>
               <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-400 rounded-full shadow-sm" style={{ width: `${fatPercent}%` }}></div>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Food Log Section */}
      <div>
        <div className="flex justify-between items-center mb-4 px-1">
           <h3 className="text-lg font-bold text-slate-800">今日饮食</h3>
           <Link to="/scan" className="text-xs bg-slate-800 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-lg shadow-slate-300 active:scale-95 transition-all">
              <Plus size={14} /> 加入食谱
           </Link>
        </div>
        
        {logs.length === 0 ? (
           <div className="bg-white p-8 rounded-[2rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center hover:border-emerald-200 transition-colors group">
              <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-emerald-50 transition-colors">
                 <Target size={22} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
              </div>
              <p className="text-slate-500 text-sm font-medium mb-4">记录第一餐，开启健康一天</p>
              <div className="flex gap-2">
                 <Link to="/community" className="text-xs bg-white border border-slate-200 px-4 py-2 rounded-lg font-bold text-slate-600 hover:text-emerald-600 hover:border-emerald-200 transition-all">逛逛社区</Link>
                 <Link to="/merchants" className="text-xs bg-white border border-slate-200 px-4 py-2 rounded-lg font-bold text-slate-600 hover:text-emerald-600 hover:border-emerald-200 transition-all">看看外卖</Link>
              </div>
           </div>
        ) : (
           <div className="space-y-3">
              {logs.map((log) => (
                 <div key={log.id} className="bg-white p-3 pr-4 rounded-2xl shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)] border border-slate-50/50 flex items-center gap-4 animate-fade-in-up hover:shadow-lg hover:shadow-emerald-500/5 transition-all">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 shadow-inner">
                       {log.imageUrl ? (
                          <img src={log.imageUrl} alt={log.name} className="w-full h-full object-cover" />
                       ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                             <Flame size={20} />
                          </div>
                       )}
                    </div>
                    <div className="flex-1 min-w-0 py-0.5">
                       <h4 className="font-bold text-slate-700 text-sm truncate mb-1">{log.name}</h4>
                       <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                          <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{log.calories} kcal</span>
                          <span>P:{log.protein} C:{log.carbs} F:{log.fat}</span>
                       </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <span className="text-[9px] text-slate-400 font-bold px-2 py-0.5 bg-slate-50 rounded-full uppercase tracking-wider">
                          {log.sourceType === 'RECIPE' ? '食谱' : log.sourceType === 'PRODUCT' ? '商品' : '识别'}
                       </span>
                       <button onClick={() => removeLog(log.id)} className="w-6 h-6 flex items-center justify-center rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 size={14} />
                       </button>
                    </div>
                 </div>
              ))}
              
              <button 
                 onClick={generateDailyAnalysis}
                 className="w-full mt-4 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
              >
                 <Activity size={18} /> 生成今日营养报告
              </button>
           </div>
        )}
      </div>

      {/* Analysis Modal (Refined) */}
      {showAnalysis && dailyAnalysis && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-md p-0 sm:p-4 animate-fade-in">
           <div className="bg-white w-full max-w-md h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-y-auto relative animate-slide-up shadow-2xl">
              <div className="sticky top-0 bg-white/95 backdrop-blur-xl z-10 px-6 py-5 border-b border-slate-50 flex justify-between items-center">
                 <div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">营养全景</h2>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">今日饮食深度解析</p>
                 </div>
                 <button onClick={() => setShowAnalysis(false)} className="w-9 h-9 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                    <X size={20} />
                 </button>
              </div>
              <div className="p-6 pb-20 space-y-8">
                 <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-3xl border border-slate-100 text-center">
                    <p className="text-xs text-slate-400 font-bold uppercase mb-1 tracking-wide">今日总热量摄入</p>
                    <p className="text-4xl font-black text-slate-800">{dailyAnalysis.calories.value} <span className="text-sm font-bold text-slate-400">kcal</span></p>
                 </div>
                 
                 <div>
                   <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide opacity-80">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-emerald-200 shadow"></div> 核心营养素
                   </h3>
                   <NutrientBar label="蛋白质" value={`${dailyAnalysis.protein.value}g`} percentage={dailyAnalysis.protein.nrvPercent} color="bg-emerald-500" />
                   <NutrientBar label="碳水" value={`${dailyAnalysis.carbs.total.value}g`} percentage={dailyAnalysis.carbs.total.nrvPercent} color="bg-blue-500" />
                   <NutrientBar label="脂肪" value={`${dailyAnalysis.fat.total.value}g`} percentage={dailyAnalysis.fat.total.nrvPercent} color="bg-orange-400" />
                 </div>
                 
                 <div>
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide opacity-80">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full shadow-purple-200 shadow"></div> 微量元素概览
                    </h3>
                    <MicroNutrientGrid items={{...dailyAnalysis.vitamins, ...dailyAnalysis.minerals}} />
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
