
import React, { useState, useRef } from 'react';
import { Camera, AlertCircle, Loader2, Sparkles, Edit2, Check, Trash2, Plus, ArrowLeft, PlusCircle } from 'lucide-react';
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
  const { saveToFoodLibrary } = useAuth(); // Import auth context actions
  const navigate = useNavigate();
  
  // State for Review Step
  const [tempFoodName, setTempFoodName] = useState<string>("");
  const [tempIngredients, setTempIngredients] = useState<Ingredient[]>([]);

  // State for Final Result
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        
        setImage(base64String);
        startIdentification(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  // Step 1: Identify
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

  // Step 2: Analyze based on reviewed data
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

  // Step 3: Add to Daily Log AND Save to User Library
  const handleAddToLog = () => {
    if (!result) return;
    
    // 1. Add to today's log (Dashboard)
    addLog({
      name: result.foodName,
      imageUrl: image || undefined,
      calories: result.detailedNutrients.calories.value,
      protein: result.detailedNutrients.protein.value,
      carbs: result.detailedNutrients.carbs.total.value,
      fat: result.detailedNutrients.fat.total.value,
      sourceType: 'AI_ANALYSIS',
      detailedNutrients: result.detailedNutrients
    });

    // 2. Save to User's Personal Library (Profile -> Food Log)
    saveToFoodLibrary({
      name: result.foodName,
      imageUrl: image || undefined,
      calories: result.detailedNutrients.calories.value,
      protein: result.detailedNutrients.protein.value,
      carbs: result.detailedNutrients.carbs.total.value,
      fat: result.detailedNutrients.fat.total.value,
      detailedNutrients: result.detailedNutrients
    });

    // Navigate back to dashboard to see results
    navigate('/');
  };

  // Helpers for Ingredient Editing
  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const newIngredients = [...tempIngredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setTempIngredients(newIngredients);
  };

  const removeIngredient = (index: number) => {
    setTempIngredients(tempIngredients.filter((_, i) => i !== index));
  };

  const addIngredient = () => {
    setTempIngredients([...tempIngredients, { name: '', amount: '' }]);
  };

  return (
    <div className="pb-24 px-4 pt-6 min-h-screen bg-white">
      {/* Header */}
      {status === AnalysisStatus.SUCCESS ? (
         <button onClick={() => setStatus(AnalysisStatus.REVIEWING)} className="flex items-center text-slate-500 mb-4">
           <ArrowLeft size={18} className="mr-1" /> 返回修改
         </button>
      ) : (
         <h1 className="text-2xl font-bold text-slate-800 mb-6">AI 食物营养分析</h1>
      )}

      {/* Main Image Area */}
      <div className={`relative w-full rounded-3xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center group mb-6 transition-all ${image ? 'aspect-video' : 'aspect-square'}`}>
        {image ? (
          <img src={image} alt="Food" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center p-6 text-center">
             <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
               <Camera size={32} />
             </div>
             <h3 className="text-slate-700 font-semibold">拍照或上传图片</h3>
             <p className="text-slate-400 text-sm mt-2">AI将识别食材并生成详细营养报告。</p>
          </div>
        )}

        <input 
          type="file" 
          accept="image/*" 
          className={`absolute inset-0 opacity-0 cursor-pointer z-10 ${status !== AnalysisStatus.IDLE && status !== AnalysisStatus.ERROR ? 'hidden' : ''}`}
          ref={fileInputRef}
          onChange={handleImageUpload}
        />
        
        {(status === AnalysisStatus.IDENTIFYING || status === AnalysisStatus.ANALYZING) && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20">
            <Loader2 className="animate-spin mb-3" size={40} />
            <p className="font-medium animate-pulse">
              {status === AnalysisStatus.IDENTIFYING ? "正在识别食材..." : "正在计算营养数据..."}
            </p>
          </div>
        )}
      </div>

      {/* ERROR State */}
      {status === AnalysisStatus.ERROR && (
        <div className="p-6 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-4 text-red-700 mb-6">
           <AlertCircle size={24} />
           <div>
             <p className="font-bold">分析失败</p>
             <p className="text-sm">请重试或检查网络连接。</p>
             <button 
                onClick={() => { setImage(null); setStatus(AnalysisStatus.IDLE); }}
                className="mt-2 text-xs bg-red-100 px-3 py-1 rounded-full font-bold"
             >
               重置
             </button>
           </div>
        </div>
      )}

      {/* STEP 2: REVIEW & EDIT */}
      {status === AnalysisStatus.REVIEWING && (
        <div className="animate-fade-in-up space-y-6">
          <div className="bg-white rounded-2xl p-5 shadow-lg shadow-slate-200 border border-slate-100">
            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Edit2 size={18} className="text-emerald-500" /> 确认食材信息
            </h2>
            
            {/* Food Name Input */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">菜品名称</label>
              <input 
                type="text" 
                value={tempFoodName}
                onChange={(e) => setTempFoodName(e.target.value)}
                className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none font-bold text-slate-800"
              />
            </div>

            {/* Ingredients List */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-500 uppercase">配料 & 用量</label>
              {tempIngredients.map((ing, idx) => (
                <div key={idx} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="食材"
                    value={ing.name}
                    onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                    className="flex-1 p-2 bg-slate-50 rounded-lg border border-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                  <input 
                    type="text" 
                    placeholder="用量"
                    value={ing.amount}
                    onChange={(e) => updateIngredient(idx, 'amount', e.target.value)}
                    className="w-24 p-2 bg-slate-50 rounded-lg border border-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                  <button 
                    onClick={() => removeIngredient(idx)}
                    className="p-2 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button 
                onClick={addIngredient}
                className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-bold hover:border-emerald-400 hover:text-emerald-500 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} /> 添加食材
              </button>
            </div>
          </div>

          <button 
             onClick={startAnalysis}
             className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <Check size={20} /> 保存并分析营养
          </button>
        </div>
      )}

      {/* STEP 3: RESULTS (Detailed Panorama) */}
      {status === AnalysisStatus.SUCCESS && result && (
        <div className="animate-fade-in-up space-y-6 pb-8">
           {/* Top Summary Card */}
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-emerald-100 border border-emerald-50">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{result.foodName}</h2>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {result.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-end">
                 <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">健康评分</div>
                 <div className={`text-3xl font-bold ${result.healthScore > 70 ? 'text-emerald-500' : 'text-orange-500'}`}>
                   {result.healthScore}
                 </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl mb-4 border border-slate-100">
               <div className="flex items-start gap-3">
                 <Sparkles className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                 <p className="text-sm text-slate-600 italic">"{result.advice}"</p>
               </div>
            </div>

            {/* Action Buttons */}
            <button 
               onClick={handleAddToLog}
               className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
               <PlusCircle size={20} /> 记入今日饮食
            </button>
          </div>

          {/* Detailed Nutrition Panorama (Reused UI) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
             <div className="bg-amber-50 text-amber-700 p-3 rounded-xl flex gap-2 text-xs items-start mb-6">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p>营养全景（AI估算值、仅供参考）</p>
             </div>

             {/* Core Macros */}
            <div className="mb-8">
              <h3 className="font-bold text-slate-800 mb-4">核心营养素</h3>
              <NutrientBar 
                label="热量" 
                value={`${result.detailedNutrients.calories.value} kcal`} 
                percentage={result.detailedNutrients.calories.nrvPercent}
                color="bg-slate-800"
              />
              <NutrientBar 
                label="蛋白质" 
                value={`${result.detailedNutrients.protein.value}g`} 
                percentage={result.detailedNutrients.protein.nrvPercent}
              />
              <NutrientBar 
                label="总碳水化合物" 
                value={`${result.detailedNutrients.carbs.total.value}g`} 
                percentage={result.detailedNutrients.carbs.total.nrvPercent}
                color="bg-yellow-500"
                subValues={[
                  { label: "可利用碳水", value: `${result.detailedNutrients.carbs.available.value}g` },
                  { label: "膳食纤维", value: `${result.detailedNutrients.carbs.fiber.value}g` }
                ]}
              />
              <NutrientBar 
                label="总脂肪" 
                value={`${result.detailedNutrients.fat.total.value}g`} 
                percentage={result.detailedNutrients.fat.total.nrvPercent}
                color="bg-orange-500"
                subValues={[
                  { label: "饱和脂肪", value: `${result.detailedNutrients.fat.saturated.value}g` },
                  { label: "单不饱和", value: `${result.detailedNutrients.fat.monounsaturated.value}g` },
                  { label: "多不饱和", value: `${result.detailedNutrients.fat.polyunsaturated.value}g` }
                ]}
              />
            </div>

            {/* Vitamins */}
            <div className="mb-8">
               <h3 className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-2">
                 <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
                 维生素 (Vitamins)
               </h3>
               <MicroNutrientGrid items={result.detailedNutrients.vitamins} />
            </div>

            {/* Minerals */}
            <div>
               <h3 className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-2">
                 <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                 矿物质 (Minerals)
               </h3>
               <MicroNutrientGrid items={result.detailedNutrients.minerals} />
            </div>
          </div>

          <button 
             onClick={() => {
               setImage(null);
               setStatus(AnalysisStatus.IDLE);
               setResult(null);
               setTempFoodName("");
               setTempIngredients([]);
             }}
             className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-lg active:scale-95 transition-transform"
          >
            扫描下一餐
          </button>
        </div>
      )}
    </div>
  );
};

export default Analysis;
