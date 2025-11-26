import React, { useState } from 'react';
import { AreaChart, Area, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Flame, Plus, Trash2, Activity, X, ChevronRight, Zap } from 'lucide-react';
import { useDailyLog } from '../context/DailyLogContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { DetailedNutrients } from '../types';
import { NutrientBar, MicroNutrientGrid } from '../components/NutrientVisualizations';

const historyData = [
  { name: '周一', cal: 1800 },
  { name: '周二', cal: 2100 },
  { name: '周三', cal: 1950 },
  { name: '周四', cal: 2300 },
  { name: '周五', cal: 1700 },
  { name: '周六', cal: 2400 },
  { name: '周日', cal: 2000 },
];

const Dashboard: React.FC = () => {
  const { summary, logs, removeLog } = useDailyLog();
  const { userProfile } = useAuth();
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [dailyAnalysis, setDailyAnalysis] = useState<DetailedNutrients | null>(null);

  // Use TDEE from profile if available, else default to 2000
  const targetCalories = userProfile?.tdee || 2000;
  
  const remainingCalories = Math.max(0, targetCalories - summary.totalCalories);
  
  // Targets (Simplified estimation based on calories)
  // Protein ~ 20%, Fat ~ 25%, Carbs ~ 55%
  const targetProtein = Math.round((targetCalories * 0.2) / 4);
  const targetCarbs = Math.round((targetCalories * 0.55) / 4);
  const targetFat = Math.round((targetCalories * 0.25) / 9);

  // Percentages for Macros
  const proteinPercent = Math.min(100, (summary.totalProtein / targetProtein) * 100);
  const carbsPercent = Math.min(100, (summary.totalCarbs / targetCarbs) * 100);
  const fatPercent = Math.min(100, (summary.totalFat / targetFat) * 100);

  // Donut Chart Data
  const calorieData = [
    { name: 'Eaten', value: summary.totalCalories },
    { name: 'Remaining', value: remainingCalories }
  ];
  // Emerald-500 for eaten, Slate-100 for remaining
  const CALORIE_COLORS = ['#10B981', '#F1F5F9']; 

  // Aggregation Logic
  const generateDailyAnalysis = () => {
    if (logs.length === 0) return;

    // Initialize with zeros
    const agg: DetailedNutrients = {
      calories: { value: 0, nrvPercent: 0 },
      protein: { value: 0, nrvPercent: 0 },
      carbs: { total: { value: 0, nrvPercent: 0 }, available: { value: 0 }, fiber: { value: 0 } },
      fat: { total: { value: 0, nrvPercent: 0 }, saturated: { value: 0 }, monounsaturated: { value: 0 }, polyunsaturated: { value: 0 } },
      vitamins: {},
      minerals: {}
    };

    // Helper to parse "10mg" -> 10, "mg"
    const parseValue = (str: string): { val: number, unit: string } => {
      if (!str) return { val: 0, unit: '' };
      const match = str.match(/([\d.]+)([a-zA-Zμ%]+)?/);
      if (match) {
        return { val: parseFloat(match[1]), unit: match[2] || '' };
      }
      return { val: 0, unit: '' };
    };

    logs.forEach(log => {
      // Basic Macros (Always exist)
      agg.calories.value += log.calories;
      agg.protein.value += log.protein;
      agg.carbs.total.value += log.carbs;
      agg.fat.total.value += log.fat;

      // Detailed nutrients (If exist)
      if (log.detailedNutrients) {
        const d = log.detailedNutrients;
        
        // Sum sub-components
        agg.carbs.available.value += d.carbs.available.value || 0;
        agg.carbs.fiber.value += d.carbs.fiber.value || 0;
        
        agg.fat.saturated.value += d.fat.saturated.value || 0;
        agg.fat.monounsaturated.value += d.fat.monounsaturated.value || 0;
        agg.fat.polyunsaturated.value += d.fat.polyunsaturated.value || 0;

        // Sum NRV Percents
        agg.calories.nrvPercent += d.calories.nrvPercent || 0;
        agg.protein.nrvPercent += d.protein.nrvPercent || 0;
        agg.carbs.total.nrvPercent += d.carbs.total.nrvPercent || 0;
        agg.fat.total.nrvPercent += d.fat.total.nrvPercent || 0;

        // Sum Vitamins
        Object.entries(d.vitamins).forEach(([key, data]) => {
           const vData = data as { value: string; nrvPercent: number };
           if (!agg.vitamins[key]) agg.vitamins[key] = { value: '0', nrvPercent: 0 };
           const current = parseValue(agg.vitamins[key].value);
           const income = parseValue(vData.value);
           const sumVal = (current.val + income.val).toFixed(1).replace(/\.0$/, ''); 
           const unit = income.unit || current.unit;
           agg.vitamins[key].value = `${sumVal}${unit}`;
           agg.vitamins[key].nrvPercent += vData.nrvPercent || 0;
        });

        // Sum Minerals
        Object.entries(d.minerals).forEach(([key, data]) => {
           const mData = data as { value: string; nrvPercent: number };
           if (!agg.minerals[key]) agg.minerals[key] = { value: '0', nrvPercent: 0 };
           const current = parseValue(agg.minerals[key].value);
           const income = parseValue(mData.value);
           const sumVal = (current.val + income.val).toFixed(1).replace(/\.0$/, '');
           const unit = income.unit || current.unit;
           agg.minerals[key].value = `${sumVal}${unit}`;
           agg.minerals[key].nrvPercent += mData.nrvPercent || 0;
        });
      }
    });

    // Formatting Macros
    agg.calories.value = Math.round(agg.calories.value);
    agg.protein.value = parseFloat(agg.protein.value.toFixed(1));
    agg.carbs.total.value = parseFloat(agg.carbs.total.value.toFixed(1));
    agg.fat.total.value = parseFloat(agg.fat.total.value.toFixed(1));

    setDailyAnalysis(agg);
    setShowAnalysis(true);
  };

  return (
    <div className="pb-24 px-4 pt-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">你好, {userProfile?.nickname || '朋友'}! 👋</h1>
          <p className="text-slate-500 text-xs mt-1">今天也要保持好胃口。</p>
        </div>
        <Link to="/profile">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold border-2 border-white shadow-sm overflow-hidden">
             {userProfile?.avatarUrl ? <img src={userProfile.avatarUrl} className="w-full h-full object-cover"/> : (userProfile?.nickname?.[0] || '我')}
          </div>
        </Link>
      </div>

      {/* NEW: Modern Nutrition Card */}
      <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/60 border border-slate-50 relative overflow-hidden">
        {/* Background blobs for subtle decoration */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-50 rounded-full blur-2xl opacity-60 pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-blue-50 rounded-full blur-2xl opacity-60 pointer-events-none"></div>

        <div className="flex justify-between items-center mb-2 relative z-10">
          <h2 className="font-bold text-slate-800 text-lg">今日摄入</h2>
          <div className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
            目标: {targetCalories} kcal
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          {/* Left: Donut Chart */}
          <div className="relative w-40 h-40 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={calorieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={68}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={10}
                >
                  {calorieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CALORIE_COLORS[index % CALORIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700">
               <span className="text-xs text-slate-400 font-medium mb-0.5">还可摄入</span>
               <span className="text-3xl font-extrabold text-slate-800 tracking-tighter">{remainingCalories.toFixed(0)}</span>
               <span className="text-xs font-bold text-emerald-500 mt-1 flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                  <Flame size={10} fill="currentColor" /> kcal
               </span>
            </div>
          </div>

          {/* Right: Macro Bars */}
          <div className="flex-1 w-full space-y-4">
            {/* Carbs */}
            <div className="space-y-1.5">
               <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">碳水化合物</span>
                  <span className="text-slate-400">{summary.totalCarbs.toFixed(0)} / {targetCarbs}g</span>
               </div>
               <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${carbsPercent}%` }}></div>
               </div>
            </div>

            {/* Protein */}
            <div className="space-y-1.5">
               <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">蛋白质</span>
                  <span className="text-slate-400">{summary.totalProtein.toFixed(0)} / {targetProtein}g</span>
               </div>
               <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${proteinPercent}%` }}></div>
               </div>
            </div>

            {/* Fat */}
            <div className="space-y-1.5">
               <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">脂肪</span>
                  <span className="text-slate-400">{summary.totalFat.toFixed(0)} / {targetFat}g</span>
               </div>
               <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-400 rounded-full transition-all duration-700" style={{ width: `${fatPercent}%` }}></div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Food Log */}
      <div>
        <div className="flex justify-between items-center mb-3 px-1">
           <h3 className="font-bold text-slate-800">饮食记录</h3>
           <Link to="/scan" className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-full font-medium flex items-center gap-1 shadow-sm active:scale-95 transition-transform">
              <Plus size={14} /> 记一笔
           </Link>
        </div>
        
        {logs.length === 0 ? (
           <div className="bg-white p-8 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                 <Zap size={24} className="text-slate-300" />
              </div>
              <p className="text-slate-500 text-sm mb-4">今天还没有记录哦</p>
              <div className="flex gap-3">
                 <Link to="/community" className="text-xs bg-white border border-slate-200 px-4 py-2 rounded-xl font-bold text-emerald-600 hover:bg-emerald-50 transition-colors">去社区逛逛</Link>
                 <Link to="/merchants" className="text-xs bg-white border border-slate-200 px-4 py-2 rounded-xl font-bold text-emerald-600 hover:bg-emerald-50 transition-colors">去商店看看</Link>
              </div>
           </div>
        ) : (
           <div className="space-y-3">
              {logs.map((log) => (
                 <div key={log.id} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-50 flex items-center gap-3 animate-fade-in-up">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 relative">
                       {log.imageUrl ? (
                          <img src={log.imageUrl} alt={log.name} className="w-full h-full object-cover" />
                       ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                             <Flame size={16} />
                          </div>
                       )}
                    </div>
                    <div className="flex-1 min-w-0">
                       <h4 className="font-bold text-slate-700 text-sm truncate">{log.name}</h4>
                       <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1.5">
                          <span className="font-bold text-slate-600">{log.calories} kcal</span>
                          <span className="w-px h-2 bg-slate-200"></span>
                          <span>P:{log.protein}g</span>
                          <span>C:{log.carbs}g</span>
                          <span>F:{log.fat}g</span>
                       </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 pl-2">
                       <span className={`text-[9px] px-1.5 py-0.5 rounded border ${
                          log.sourceType === 'RECIPE' ? 'text-purple-500 bg-purple-50 border-purple-100' : 
                          log.sourceType === 'PRODUCT' ? 'text-blue-500 bg-blue-50 border-blue-100' : 
                          'text-orange-500 bg-orange-50 border-orange-100'
                       }`}>
                          {log.sourceType === 'RECIPE' ? '食谱' : log.sourceType === 'PRODUCT' ? '商品' : '识别'}
                       </span>
                       <button onClick={() => removeLog(log.id)} className="p-1.5 text-slate-300 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={12} />
                       </button>
                    </div>
                 </div>
              ))}
              
              {/* Analyze Button */}
              <button 
                 onClick={generateDailyAnalysis}
                 className="w-full mt-4 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 active:scale-95 transition-transform flex items-center justify-center gap-2 text-sm"
              >
                 <Activity size={18} /> 生成今日营养报告
              </button>
           </div>
        )}
      </div>

      {/* Analysis Modal */}
      {showAnalysis && dailyAnalysis && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
           <div className="bg-white w-full max-w-md h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl overflow-y-auto relative animate-slide-up shadow-2xl">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white/95 backdrop-blur-md z-10 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                 <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                       今日营养全景
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">汇总自 {logs.length} 条饮食记录</p>
                 </div>
                 <button onClick={() => setShowAnalysis(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
                    <X size={20} />
                 </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 pb-12">
                 {/* Core Macros */}
                 <div className="mb-8">
                   <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                      核心营养素
                   </h3>
                   <NutrientBar 
                     label="总热量" 
                     value={`${dailyAnalysis.calories.value} kcal`} 
                     percentage={dailyAnalysis.calories.nrvPercent}
                     color="bg-slate-800"
                   />
                   <NutrientBar 
                     label="总蛋白质" 
                     value={`${dailyAnalysis.protein.value}g`} 
                     percentage={dailyAnalysis.protein.nrvPercent}
                   />
                   <NutrientBar 
                     label="总碳水化合物" 
                     value={`${dailyAnalysis.carbs.total.value}g`} 
                     percentage={dailyAnalysis.carbs.total.nrvPercent}
                     color="bg-blue-500"
                     subValues={[
                       { label: "可利用", value: `${dailyAnalysis.carbs.available.value.toFixed(1)}g` },
                       { label: "纤维", value: `${dailyAnalysis.carbs.fiber.value.toFixed(1)}g` }
                     ]}
                   />
                   <NutrientBar 
                     label="总脂肪" 
                     value={`${dailyAnalysis.fat.total.value}g`} 
                     percentage={dailyAnalysis.fat.total.nrvPercent}
                     color="bg-orange-500"
                     subValues={[
                       { label: "饱和", value: `${dailyAnalysis.fat.saturated.value.toFixed(1)}g` },
                       { label: "单不饱和", value: `${dailyAnalysis.fat.monounsaturated.value.toFixed(1)}g` },
                       { label: "多不饱和", value: `${dailyAnalysis.fat.polyunsaturated.value.toFixed(1)}g` }
                     ]}
                   />
                 </div>

                 {/* Vitamins */}
                 <div className="mb-8">
                    <h3 className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-2">
                      <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
                      维生素累计 (Vitamins)
                    </h3>
                    <MicroNutrientGrid items={dailyAnalysis.vitamins} />
                 </div>

                 {/* Minerals */}
                 <div>
                    <h3 className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-2">
                      <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                      矿物质累计 (Minerals)
                    </h3>
                    <MicroNutrientGrid items={dailyAnalysis.minerals} />
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Weekly Trend (Simplified for Aesthetics) */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-800">热量趋势</h3>
          <div className="flex items-center gap-1 text-xs text-slate-400 cursor-pointer">
             查看更多 <ChevronRight size={12} />
          </div>
        </div>
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historyData}>
              <defs>
                <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '12px' }}
                cursor={{ stroke: '#10B981', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area 
                type="monotone" 
                dataKey="cal" 
                stroke="#10B981" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorCal)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;