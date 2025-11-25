
import React, { useState, useMemo } from 'react';
import { Heart, Clock, Plus, Check, Search, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Recipe, DetailedNutrients } from '../types';
import { useDailyLog } from '../context/DailyLogContext';
import { useAuth } from '../context/AuthContext';
import { usePlatform } from '../context/PlatformContext';

type SortOption = 'default' | 'likes' | 'calories_asc' | 'time_asc';

const Community: React.FC = () => {
  const { addLog } = useDailyLog();
  const { isFavoriteRecipe, toggleFavoriteRecipe } = useAuth();
  const { recipes } = usePlatform(); // Access global recipes
  
  // States for Filtering and Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const categories = ['全部', '早餐', '低碳水', '高蛋白', '纯素食'];

  // Logic
  const filteredRecipes = useMemo(() => {
    let result = [...recipes];

    // 1. Filter by Category
    if (selectedCategory !== '全部') {
      result = result.filter(r => r.category === selectedCategory);
    }

    // 2. Filter by Search
    if (searchQuery.trim()) {
      result = result.filter(r => r.title.includes(searchQuery.trim()));
    }

    // 3. Sorting
    switch (sortBy) {
      case 'likes':
        result.sort((a, b) => b.likes - a.likes);
        break;
      case 'calories_asc':
        result.sort((a, b) => a.calories - b.calories);
        break;
      case 'time_asc':
        result.sort((a, b) => a.prepTime - b.prepTime);
        break;
      default:
        // By default, show newest first (assuming id increases with time or add a timestamp)
        // For now, reverse the array to show newly added first
        result.reverse();
        break;
    }

    return result;
  }, [searchQuery, selectedCategory, sortBy, recipes]);

  const handleQuickAdd = (e: React.MouseEvent, recipe: Recipe) => {
    e.preventDefault();
    e.stopPropagation();
    
    const approximateDetails: DetailedNutrients = {
      calories: { value: recipe.calories, nrvPercent: 0 },
      protein: { value: recipe.protein, nrvPercent: 0 },
      carbs: {
        total: { value: recipe.carbs, nrvPercent: 0 },
        available: { value: recipe.carbs * 0.8 },
        fiber: { value: recipe.carbs * 0.2 }
      },
      fat: {
        total: { value: recipe.fat, nrvPercent: 0 },
        saturated: { value: recipe.fat * 0.2 },
        monounsaturated: { value: recipe.fat * 0.5 },
        polyunsaturated: { value: recipe.fat * 0.3 }
      },
      vitamins: {},
      minerals: {}
    };

    addLog({
      name: recipe.title,
      imageUrl: recipe.imageUrl,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      sourceType: 'RECIPE',
      sourceId: recipe.id,
      detailedNutrients: approximateDetails
    });
  };

  const handleFavorite = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavoriteRecipe(id);
  };

  return (
    <div className="pb-24 px-4 pt-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-slate-800">社区厨房</h1>
        <Link 
          to="/community/create"
          className="bg-emerald-600 text-white w-9 h-9 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 active:scale-95 transition-transform"
        >
          <Plus size={20} />
        </Link>
      </div>

      {/* Search & Sort Bar */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <input 
            type="text"
            placeholder="搜食谱 (如: 牛油果)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none shadow-sm border border-slate-100 focus:border-emerald-500 transition-colors"
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
              <X size={14} />
            </button>
          )}
        </div>
        
        {/* Sort Dropdown Trigger */}
        <div className="relative">
          <button 
            onClick={() => setShowSortMenu(!showSortMenu)}
            className={`h-full px-3 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors shadow-sm border ${
              sortBy !== 'default' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-white text-slate-600 border-slate-100'
            }`}
          >
            <ArrowUpDown size={16} />
            <span className="hidden xs:inline">排序</span>
          </button>

          {/* Sort Menu */}
          {showSortMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)}></div>
              <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 z-20 py-2 animate-fade-in-up">
                <button 
                  onClick={() => { setSortBy('default'); setShowSortMenu(false); }}
                  className={`w-full text-left px-4 py-2 text-xs font-medium ${sortBy === 'default' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  综合推荐
                </button>
                <button 
                  onClick={() => { setSortBy('likes'); setShowSortMenu(false); }}
                  className={`w-full text-left px-4 py-2 text-xs font-medium ${sortBy === 'likes' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  最受欢迎
                </button>
                <button 
                  onClick={() => { setSortBy('calories_asc'); setShowSortMenu(false); }}
                  className={`w-full text-left px-4 py-2 text-xs font-medium ${sortBy === 'calories_asc' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  热量低→高
                </button>
                <button 
                  onClick={() => { setSortBy('time_asc'); setShowSortMenu(false); }}
                  className={`w-full text-left px-4 py-2 text-xs font-medium ${sortBy === 'time_asc' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  用时最少
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="flex overflow-x-auto gap-2 pb-4 no-scrollbar">
        {categories.map((cat) => (
          <button 
            key={cat} 
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full whitespace-nowrap text-xs font-bold transition-all ${
              selectedCategory === cat 
              ? 'bg-slate-800 text-white shadow-md' 
              : 'bg-white text-slate-500 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recipe Grid */}
      {filteredRecipes.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Search size={48} className="mx-auto mb-4 opacity-20" />
          <p>没有找到相关食谱</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRecipes.map((recipe) => (
            <Link to={`/community/recipe/${recipe.id}`} key={recipe.id} className="block group">
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 relative">
                <div className="relative h-48 overflow-hidden">
                  <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  
                  {/* Category Tag */}
                  <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] text-white font-medium">
                    {recipe.category}
                  </div>

                  {/* Favorite Button Overlay */}
                  <button 
                    onClick={(e) => handleFavorite(e, recipe.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-colors"
                  >
                    <Heart size={16} fill={isFavoriteRecipe(recipe.id) ? "currentColor" : "none"} className={isFavoriteRecipe(recipe.id) ? "text-red-500" : "text-white"} />
                  </button>

                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 flex items-center gap-1 shadow-sm">
                    <Clock size={12} /> {recipe.prepTime}分钟
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-slate-800 mb-1 truncate">{recipe.title}</h3>
                  <div className="flex items-center justify-between text-sm text-slate-500 mb-3">
                    <span>@{recipe.author}</span>
                    <span className="text-emerald-600 font-medium">{recipe.calories} 千卡</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Heart size={18} className={recipe.likes > 200 ? 'fill-red-500 text-red-500' : ''} />
                      <span className="text-xs">{recipe.likes}</span>
                    </div>
                    
                    {/* Quick Add Button */}
                    <button 
                      onClick={(e) => handleQuickAdd(e, recipe)}
                      className="h-8 px-3 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center gap-1 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-sm active:scale-95"
                    >
                      <Plus size={14} strokeWidth={3} />
                      <span className="text-xs font-bold">记一笔</span>
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Community;
