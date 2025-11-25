
import React, { useState, useMemo } from 'react';
import { Heart, Clock, Plus, Search, ArrowUpDown, X, ChefHat } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Recipe, DetailedNutrients } from '../types';
import { useDailyLog } from '../context/DailyLogContext';
import { useAuth } from '../context/AuthContext';
import { usePlatform } from '../context/PlatformContext';

type SortOption = 'default' | 'likes' | 'calories_asc' | 'time_asc';

const Community: React.FC = () => {
  const { addLog } = useDailyLog();
  const { isFavoriteRecipe, toggleFavoriteRecipe } = useAuth();
  const { recipes } = usePlatform();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const categories = ['全部', '早餐', '低碳水', '高蛋白', '纯素食'];

  const filteredRecipes = useMemo(() => {
    let result = [...recipes];
    if (selectedCategory !== '全部') result = result.filter(r => r.category === selectedCategory);
    if (searchQuery.trim()) result = result.filter(r => r.title.includes(searchQuery.trim()));
    switch (sortBy) {
      case 'likes': result.sort((a, b) => b.likes - a.likes); break;
      case 'calories_asc': result.sort((a, b) => a.calories - b.calories); break;
      case 'time_asc': result.sort((a, b) => a.prepTime - b.prepTime); break;
      default: result.reverse(); break;
    }
    return result;
  }, [searchQuery, selectedCategory, sortBy, recipes]);

  const handleQuickAdd = (e: React.MouseEvent, recipe: Recipe) => {
    e.preventDefault(); e.stopPropagation();
    const approx: DetailedNutrients = {
      calories: { value: recipe.calories, nrvPercent: 0 },
      protein: { value: recipe.protein, nrvPercent: 0 },
      carbs: { total: { value: recipe.carbs, nrvPercent: 0 }, available: { value: recipe.carbs * 0.8 }, fiber: { value: recipe.carbs * 0.2 } },
      fat: { total: { value: recipe.fat, nrvPercent: 0 }, saturated: { value: recipe.fat * 0.2 }, monounsaturated: { value: recipe.fat * 0.5 }, polyunsaturated: { value: recipe.fat * 0.3 } },
      vitamins: {}, minerals: {}
    };
    addLog({
      name: recipe.title, imageUrl: recipe.imageUrl, calories: recipe.calories, protein: recipe.protein, carbs: recipe.carbs, fat: recipe.fat, sourceType: 'RECIPE', sourceId: recipe.id, detailedNutrients: approx
    });
  };

  const handleFavorite = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    toggleFavoriteRecipe(id);
  };

  return (
    <div className="pb-safe-nav pt-4 min-h-screen bg-slate-50">
      {/* Header & Sticky Search */}
      <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-xl px-4 pb-2 pt-2 border-b border-slate-100/50">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">社区厨房</h1>
          <Link 
            to="/community/create"
            className="bg-slate-800 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-slate-300 active:scale-90 transition-transform"
          >
            <Plus size={20} />
          </Link>
        </div>

        <div className="flex gap-3 mb-3">
          <div className="flex-1 relative group">
            <input 
              type="text"
              placeholder="搜索食谱 (如: 鳄梨)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white rounded-2xl pl-11 pr-4 py-3 text-sm outline-none shadow-sm border border-transparent focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400"
            />
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                <X size={16} />
              </button>
            )}
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowSortMenu(!showSortMenu)}
              className={`h-full aspect-square rounded-2xl flex items-center justify-center transition-all shadow-sm ${
                sortBy !== 'default' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-white text-slate-400 border border-transparent'
              }`}
            >
              <ArrowUpDown size={20} />
            </button>
            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)}></div>
                <div className="absolute right-0 top-full mt-2 w-36 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-50 z-20 py-2 animate-fade-in-up overflow-hidden">
                  {[['default','综合推荐'],['likes','最受欢迎'],['calories_asc','热量低→高'],['time_asc','用时最少']].map(([key, label]) => (
                    <button 
                      key={key}
                      onClick={() => { setSortBy(key as SortOption); setShowSortMenu(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-bold ${sortBy === key ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar mask-gradient-right">
          {categories.map((cat) => (
            <button 
              key={cat} 
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full whitespace-nowrap text-xs font-bold transition-all ${
                selectedCategory === cat 
                ? 'bg-slate-800 text-white shadow-md transform scale-105' 
                : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Masonry Layout */}
      <div className="px-4 mt-2">
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <ChefHat size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-medium">空空如也</p>
          </div>
        ) : (
          <div className="columns-2 gap-4 space-y-4">
            {filteredRecipes.map((recipe) => (
              <Link to={`/community/recipe/${recipe.id}`} key={recipe.id} className="block group break-inside-avoid relative">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 relative group-active:scale-[0.98] border border-slate-100/50">
                  <div className="relative">
                    <img src={recipe.imageUrl} alt={recipe.title} className="w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                    
                    <button 
                      onClick={(e) => handleFavorite(e, recipe.id)}
                      className="absolute top-2 right-2 p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-red-500 transition-all active:scale-90"
                    >
                      <Heart size={14} fill={isFavoriteRecipe(recipe.id) ? "currentColor" : "none"} className={isFavoriteRecipe(recipe.id) ? "text-red-500" : ""} />
                    </button>

                    <div className="absolute bottom-2 left-3 right-3 flex justify-between items-end text-white">
                       <span className="text-[10px] font-medium bg-black/30 backdrop-blur px-2 py-0.5 rounded-md flex items-center gap-1">
                         <Clock size={10} /> {recipe.prepTime}m
                       </span>
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <h3 className="font-bold text-sm text-slate-800 mb-1 leading-snug line-clamp-2">{recipe.title}</h3>
                    <div className="flex items-center justify-between mt-2">
                       <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-slate-200 overflow-hidden">
                             {/* Placeholder Avatar */}
                             <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-blue-400"></div>
                          </div>
                          <span className="text-[10px] text-slate-500 truncate max-w-[60px]">{recipe.author}</span>
                       </div>
                       <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Heart size={10} /> {recipe.likes}
                       </div>
                    </div>
                    
                    <button 
                      onClick={(e) => handleQuickAdd(e, recipe)}
                      className="w-full mt-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1 active:scale-95"
                    >
                      <Plus size={12} strokeWidth={3} /> 加入食谱
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
