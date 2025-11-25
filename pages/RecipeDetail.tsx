
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Clock, Flame, Heart, MessageCircle, ThumbsDown, 
  Bookmark, PlusCircle, AlertCircle, ChefHat, Activity 
} from 'lucide-react';
import { RecipeDetail } from '../types';
import { useDailyLog } from '../context/DailyLogContext';
import { useAuth } from '../context/AuthContext';
import { usePlatform } from '../context/PlatformContext';
import { NutrientBar, MicroNutrientGrid } from '../components/NutrientVisualizations';

const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addLog } = useDailyLog();
  const { isFavoriteRecipe, toggleFavoriteRecipe } = useAuth();
  const { recipes } = usePlatform();
  const [activeTab, setActiveTab] = useState<'method' | 'nutrition'>('method');
  
  // Find recipe in global state
  const recipe = recipes.find(r => r.id === id);
  const isFavorite = id && isFavoriteRecipe(id);

  if (!recipe) {
    return <div className="p-10 text-center text-slate-500">食谱不存在或已被删除</div>;
  }

  const handleAddToLog = () => {
    addLog({
      name: recipe.title,
      imageUrl: recipe.imageUrl,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      sourceType: 'RECIPE',
      sourceId: recipe.id,
      detailedNutrients: recipe.detailedNutrients // Pass detailed nutrients
    });
  };

  return (
    <div className="bg-white min-h-screen pb-24 relative">
      {/* Header Image */}
      <div className="relative h-64 w-full">
        <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h1 className="text-2xl font-bold mb-1">{recipe.title}</h1>
          <div className="flex items-center gap-4 text-sm text-white/90">
             <span className="flex items-center gap-1"><Clock size={14} /> {recipe.prepTime}分钟</span>
             <span className="flex items-center gap-1"><Flame size={14} /> {recipe.calories} 千卡</span>
             <span>@{recipe.author}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-t-3xl bg-white -mt-6 relative z-10 px-6 pt-6">
        {/* Interaction Bar */}
        <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-100">
           <div className="flex gap-4">
              <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-red-500 transition-colors">
                 <Heart size={24} />
                 <span className="text-[10px]">{recipe.likes}</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors">
                 <ThumbsDown size={24} />
                 <span className="text-[10px]">踩</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-500 transition-colors">
                 <MessageCircle size={24} />
                 <span className="text-[10px]">12</span>
              </button>
           </div>
           <div className="flex gap-3">
              <button 
                onClick={() => toggleFavoriteRecipe(recipe.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-colors ${
                  isFavorite 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'
                }`}
              >
                 <Bookmark size={16} fill={isFavorite ? "currentColor" : "none"} /> 
                 {isFavorite ? '已收藏' : '收藏'}
              </button>
              <button 
                onClick={handleAddToLog}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-full font-bold text-xs shadow-lg shadow-emerald-200 active:scale-95 transition-transform"
              >
                 <PlusCircle size={16} /> 加入食谱
              </button>
           </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
          <button 
            onClick={() => setActiveTab('method')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'method' 
              ? 'bg-white text-emerald-600 shadow-sm' 
              : 'text-slate-500'
            }`}
          >
            <ChefHat size={16} className="inline mr-1 mb-0.5" /> 制作方法
          </button>
          <button 
            onClick={() => setActiveTab('nutrition')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'nutrition' 
              ? 'bg-white text-emerald-600 shadow-sm' 
              : 'text-slate-500'
            }`}
          >
            <Activity size={16} className="inline mr-1 mb-0.5" /> 营养全景
          </button>
        </div>

        {/* Method Tab */}
        {activeTab === 'method' && (
          <div className="space-y-6 animate-fade-in">
            <p className="text-slate-600 text-sm leading-relaxed italic border-l-4 border-emerald-200 pl-3">
              {recipe.description}
            </p>

            <div>
              <h3 className="font-bold text-slate-800 mb-3">所需食材</h3>
              <ul className="space-y-2">
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                    <span className="text-slate-700">{ing.name}</span>
                    <span className="font-mono text-emerald-600 font-medium text-sm">{ing.amount}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 mb-4">制作步骤</h3>
              <div className="space-y-6">
                {recipe.steps.map((step) => (
                  <div key={step.step} className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                      {step.step}
                    </div>
                    <div className="pb-4">
                      <p className="text-slate-600 text-sm leading-6">{step.description}</p>
                      {step.imageUrl && (
                        <img src={step.imageUrl} alt={`步骤 ${step.step}`} className="mt-3 rounded-lg w-full h-32 object-cover" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Nutrition Tab */}
        {activeTab === 'nutrition' && (
          <div className="space-y-6 animate-fade-in pb-8">
            <div className="bg-amber-50 text-amber-700 p-3 rounded-xl flex gap-2 text-xs items-start">
               <AlertCircle size={16} className="shrink-0 mt-0.5" />
               <p>所有数据均为AI根据食材估算，仅供参考，不作为医疗建议。NRV%参考成人每日推荐摄入量。</p>
            </div>

            {/* Core Macros */}
            <div>
              <h3 className="font-bold text-slate-800 mb-4">核心营养素</h3>
              <NutrientBar 
                label="热量" 
                value={`${recipe.detailedNutrients.calories.value} kcal`} 
                percentage={recipe.detailedNutrients.calories.nrvPercent}
                color="bg-slate-800"
              />
              <NutrientBar 
                label="蛋白质" 
                value={`${recipe.detailedNutrients.protein.value}g`} 
                percentage={recipe.detailedNutrients.protein.nrvPercent}
              />
              <NutrientBar 
                label="总碳水化合物" 
                value={`${recipe.detailedNutrients.carbs.total.value}g`} 
                percentage={recipe.detailedNutrients.carbs.total.nrvPercent}
                color="bg-yellow-500"
                subValues={[
                  { label: "可利用碳水", value: `${recipe.detailedNutrients.carbs.available.value}g` },
                  { label: "膳食纤维", value: `${recipe.detailedNutrients.carbs.fiber.value}g` }
                ]}
              />
              <NutrientBar 
                label="总脂肪" 
                value={`${recipe.detailedNutrients.fat.total.value}g`} 
                percentage={recipe.detailedNutrients.fat.total.nrvPercent}
                color="bg-orange-500"
                subValues={[
                  { label: "饱和脂肪", value: `${recipe.detailedNutrients.fat.saturated.value}g` },
                  { label: "单不饱和", value: `${recipe.detailedNutrients.fat.monounsaturated.value}g` },
                  { label: "多不饱和", value: `${recipe.detailedNutrients.fat.polyunsaturated.value}g` }
                ]}
              />
            </div>

            {/* Vitamins */}
            <div>
               <h3 className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-2">
                 <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
                 维生素 (Vitamins)
               </h3>
               <MicroNutrientGrid items={recipe.detailedNutrients.vitamins} />
            </div>

            {/* Minerals */}
            <div>
               <h3 className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-2">
                 <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                 矿物质 (Minerals)
               </h3>
               <MicroNutrientGrid items={recipe.detailedNutrients.minerals} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeDetail;
