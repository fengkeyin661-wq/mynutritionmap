
import React, { useState, useRef } from 'react';
import { Camera, AlertCircle, Loader2, Sparkles, Edit2, Check, Trash2, ArrowLeft, PlusCircle } from 'lucide-react';
import { identifyFoodFromImage, analyzeNutritionFromIngredients } from '../services/geminiService';
import { AnalysisStatus, FoodAnalysisResult, Ingredient } from '../types';
import { useDailyLog } from '../context/DailyLogContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { NutrientBar, MicroNutrientGrid } from '../components/NutrientVisualizations';

const Analysis: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const { addLog } = useDailyLog();
  const { saveToFoodLibrary } = useAuth();
  const navigate = useNavigate();
  
  const [tempFoodName, setTempFoodName] = useState<string>("");
  const [tempIngredients, setTempIngredients] = useState<Ingredient[]>([]);
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImage(base64String);
        startIdentification(base64String.split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  const startIdentification = async (base64Data: string) => {
    setStatus(AnalysisStatus.IDENTIFYING);
    try {
      const data = await identifyFoodFromImage(base64Data);
      setTempFoodName(data.foodName);
      setTempIngredients(data.ingredients);
      setStatus(AnalysisStatus.REVIEWING);
    } catch (error) {
      console.error(error);
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const startAnalysis = async () => {
    setStatus(AnalysisStatus.ANALYZING);
    try {
      const data = await analyzeNutritionFromIngredients(tempFoodName, tempIngredients);
      setResult(data);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (error) {
      console.error(error);
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const handleAddToLog = () => {
    if (!result) return;
    const item = {
      name: result.foodName, imageUrl: image || undefined, calories: result.detailedNutrients.calories.value,
      protein: result.detailedNutrients.protein.value, carbs: result.detailedNutrients.carbs.total.value, fat: result.detailedNutrients.fat.total.value,
      sourceType: 'AI_ANALYSIS' as const, detailedNutrients: result.detailedNutrients
    };
    addLog(item);
    saveToFoodLibrary(item);
    navigate('/');
  };

  // Helpers
  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const newIngredients = [...tempIngredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setTempIngredients(newIngredients);
  };
  const removeIngredient = (index: number) => setTempIngredients(tempIngredients.filter((_, i) => i !== index));
  const addIngredient = () => setTempIngredients([...tempIngredients, { name: '', amount: '' }]);

  return (
    <div className="pb-safe-nav px-4 pt-6 min-h-screen bg-slate-50">
      {status === AnalysisStatus.SUCCESS ? (
         <button onClick={() => setStatus(AnalysisStatus.REVIEWING)} className="flex items-center text-slate-500 mb-4 hover:text-slate-800">
           <ArrowLeft size={20} className="mr-1" /> <span className="font-bold text-sm">重新分析</span>
         </button>
      ) : (
         <h1 className="text-2xl font-extrabold text-slate-800 mb-6 tracking-tight">AI 营养识别</h1>
      )}

      {/* Main Camera Viewport */}
      <div className={`
        relative w-full rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-2xl transition-all duration-500 group border-[6px] border-white ring-1 ring-slate-100
        ${image ? 'aspect-[3/4]' : 'aspect-square'}
      `}>
        {image ? (
          <>
            <img src={image} alt="Food" className="w-full h-full object-cover opacity-90" />
            
            {/* SCANNING LASER EFFECT */}
            {(status === AnalysisStatus.IDENTIFYING || status === AnalysisStatus.ANALYZING) && (
              <div className="absolute inset-0 z-20">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.8)] animate-scan z-30"></div>
                <div className="absolute inset-0 bg-emerald-500/10 animate-pulse z-20"></div>
                {/* Grid Overlay */}
                <div className="absolute inset-0 z-10 opacity-20" 
                     style={{backgroundImage: 'linear-gradient(rgba(52, 211, 153, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(52, 211, 153, 0.4) 1px, transparent 1px)', backgroundSize: '40px 40px'}}>
                </div>
              </div>
            )}
            
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
          </>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-slate-800 transition-colors"
          >
             {/* Pulse Animation Circle */}
             <div className="relative mb-6">
                <div className="absolute inset-0 bg-emerald-500 rounded-full animate-pulse-ring opacity-40"></div>
                <div className="relative w-24 h-24 bg-gradient-to-tr from-emerald-500 to-teal-400 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 transform transition-transform active:scale-90">
                  <Camera size={40} />
                </div>
             </div>
             <h3 className="text-white font-bold text-xl">点击拍照</h3>
             <p className="text-slate-400 text-sm mt-2 font-medium">AI 自动识别热量与营养</p>
          </div>
        )}

        <input 
          type="file" accept="image/*" className="hidden"
          ref={fileInputRef} onChange={handleImageUpload}
        />
        
        {/* Loading Overlay */}
        {(status === AnalysisStatus.IDENTIFYING || status === AnalysisStatus.ANALYZING) && (
          <div className="absolute inset-x-0 bottom-10 z-30 text-center">
            <div className="inline-flex items-center gap-3 bg-black/70 backdrop-blur-xl px-6 py-3 rounded-full text-white border border-white/10 shadow-xl">
               <Loader2 className="animate-spin text-emerald-400" size={20} />
               <span className="font-bold text-sm tracking-wide">
                 {status === AnalysisStatus.IDENTIFYING ? "正在扫描食材..." : "正在计算营养..."}
               </span>
            </div>
          </div>
        )}
      </div>

      {status === AnalysisStatus.ERROR && (
        <div className="mt-6 p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-4 text-red-700 animate-fade-in-up">
           <AlertCircle size={24} />
           <div>
             <p className="font-bold text-sm">分析遇到了点小问题</p>
             <button onClick={() => { setImage(null); setStatus(AnalysisStatus.IDLE); }} className="mt-1 text-xs underline">重试</button>
           </div>
        </div>
      )}

      {/* STEP 2: REVIEW */}
      {status === AnalysisStatus.REVIEWING && (
        <div className="mt-6 animate-fade-in-up bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50">
           <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                 <Edit2 size={18} className="text-emerald-500" /> 确认食材
              </h2>
           </div>
           
           <div className="space-y-4">
             <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 focus-within:border-emerald-500 transition-colors">
               <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">菜品名称</label>
               <input 
                 value={tempFoodName} onChange={(e) => setTempFoodName(e.target.value)}
                 className="w-full bg-transparent font-bold text-lg text-slate-800 outline-none mt-1"
               />
             </div>

             <div className="space-y-2">
               {tempIngredients.map((ing, idx) => (
                 <div key={idx} className="flex gap-2 items-center group">
                   <input 
                     value={ing.name} onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                     className="flex-1 bg-slate-50 p-3 rounded-xl text-sm font-medium border border-transparent focus:border-emerald-500 outline-none transition-all" placeholder="食材"
                   />
                   <input 
                     value={ing.amount} onChange={(e) => updateIngredient(idx, 'amount', e.target.value)}
                     className="w-20 bg-slate-50 p-3 rounded-xl text-sm font-medium border border-transparent focus:border-emerald-500 outline-none text-center transition-all" placeholder="用量"
                   />
                   <button onClick={() => removeIngredient(idx)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Trash2 size={16} />
                   </button>
                 </div>
               ))}
               <button onClick={addIngredient} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-bold hover:border-emerald-400 hover:text-emerald-500 transition-colors bg-slate-50/50 hover:bg-emerald-50">
                 + 添加食材
               </button>
             </div>
           </div>

           <button 
              onClick={startAnalysis}
              className="w-full mt-6 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
           >
             <Check size={20} /> 生成营养报告
           </button>
        </div>
      )}

      {/* STEP 3: RESULTS */}
      {status === AnalysisStatus.SUCCESS && result && (
        <div className="mt-6 animate-fade-in-up pb-10 space-y-6">
          <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 relative overflow-hidden border border-slate-50">
             <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-100 to-transparent rounded-bl-full opacity-50 -mr-10 -mt-10"></div>
             
             <div className="relative z-10 text-center mb-6">
                <h2 className="text-2xl font-black text-slate-800">{result.foodName}</h2>
                <div className="flex justify-center gap-2 mt-2">
                   {result.tags.slice(0,3).map(tag => (
                      <span key={tag} className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded-full">#{tag}</span>
                   ))}
                </div>
             </div>

             <div className="flex justify-center items-center gap-8 mb-6">
                <div className="text-center">
                   <div className="text-xs font-bold text-slate-400 uppercase mb-1">健康分</div>
                   <div className={`text-4xl font-black ${result.healthScore > 80 ? 'text-emerald-500' : 'text-orange-500'}`}>{result.healthScore}</div>
                </div>
                <div className="w-px h-10 bg-slate-100"></div>
                <div className="text-center">
                   <div className="text-xs font-bold text-slate-400 uppercase mb-1">热量</div>
                   <div className="text-4xl font-black text-slate-800">{result.detailedNutrients.calories.value}</div>
                </div>
             </div>

             <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
                <div className="flex gap-3">
                   <Sparkles className="text-amber-400 shrink-0 mt-1" size={16} />
                   <p className="text-xs text-slate-600 leading-relaxed font-medium">AI 建议: {result.advice}</p>
                </div>
             </div>

             <button onClick={handleAddToLog} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2">
                <PlusCircle size={20} /> +今天吃
             </button>
          </div>

          <div className="bg-white rounded-[2rem] p-6 shadow-lg border border-slate-50">
             <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
               <div className="w-2 h-6 bg-emerald-500 rounded-full shadow-emerald-200 shadow"></div> 详细营养数据
             </h3>
             <NutrientBar label="蛋白质" value={`${result.detailedNutrients.protein.value}g`} percentage={result.detailedNutrients.protein.nrvPercent} />
             <NutrientBar label="碳水" value={`${result.detailedNutrients.carbs.total.value}g`} percentage={result.detailedNutrients.carbs.total.nrvPercent} color="bg-blue-500" />
             <NutrientBar label="脂肪" value={`${result.detailedNutrients.fat.total.value}g`} percentage={result.detailedNutrients.fat.total.nrvPercent} color="bg-orange-500" />
             
             <div className="mt-8 pt-8 border-t border-slate-50">
               <MicroNutrientGrid items={{...result.detailedNutrients.vitamins, ...result.detailedNutrients.minerals}} />
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analysis;
