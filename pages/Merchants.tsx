import React, { useState, useMemo } from 'react';
import { ShoppingBag, Flame, Plus, Search, Tag, MapPin, Store, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product, DetailedNutrients } from '../types';
import { useDailyLog } from '../context/DailyLogContext';
import { usePlatform } from '../context/PlatformContext';

type SortType = 'default' | 'price_asc' | 'calories_asc' | 'distance';

const Merchants: React.FC = () => {
  const { addLog } = useDailyLog();
  const { products } = usePlatform(); // Access global simulated database
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('default');

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    const approximateDetails: DetailedNutrients = {
      calories: { value: product.calories, nrvPercent: 0 },
      protein: { value: product.protein, nrvPercent: 0 },
      carbs: {
        total: { value: product.carbs, nrvPercent: 0 },
        available: { value: product.carbs * 0.8 }, 
        fiber: { value: product.carbs * 0.2 }
      },
      fat: {
        total: { value: product.fat, nrvPercent: 0 },
        saturated: { value: product.fat * 0.2 },
        monounsaturated: { value: product.fat * 0.5 },
        polyunsaturated: { value: product.fat * 0.3 }
      },
      vitamins: {}, 
      minerals: {}
    };

    addLog({
      name: product.name,
      imageUrl: product.imageUrl,
      calories: product.calories,
      protein: product.protein,
      carbs: product.carbs,
      fat: product.fat,
      sourceType: 'PRODUCT',
      sourceId: product.id,
      detailedNutrients: approximateDetails
    });
  };

  const filteredProducts = useMemo(() => {
    // IMPORTANT: Only show APPROVED products to consumers
    let result = products.filter(p => p.status === 'APPROVED');

    // Search
    if (searchQuery.trim()) {
      result = result.filter(p => p.name.includes(searchQuery.trim()));
    }

    // Sort
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'calories_asc':
        result.sort((a, b) => a.calories - b.calories);
        break;
      case 'distance':
        result.sort((a, b) => {
          const dA = parseFloat(a.distance.replace('km', ''));
          const dB = parseFloat(b.distance.replace('km', ''));
          return dA - dB;
        });
        break;
      default:
        break;
    }

    return result;
  }, [searchQuery, sortBy, products]);

  return (
    <div className="pb-24 px-4 pt-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">健康优选</h1>
        <p className="text-slate-500 text-sm">严选优质健康食品，吃出好身材</p>
      </div>

      {/* Search & Filter */}
      <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur pb-2">
        <div className="flex gap-3 mb-3">
          <div className="flex-1 bg-white rounded-xl flex items-center px-4 py-3 shadow-sm border border-slate-100 relative">
            <Search size={18} className="text-slate-400 mr-2 shrink-0" />
            <input 
              type="text" 
              placeholder="搜索健康食品..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 text-slate-300 hover:text-slate-500">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Sort Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <button 
            onClick={() => setSortBy('default')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors whitespace-nowrap ${sortBy === 'default' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200'}`}
          >
            综合
          </button>
          <button 
            onClick={() => setSortBy('price_asc')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors whitespace-nowrap ${sortBy === 'price_asc' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-500 border-slate-200'}`}
          >
            价格最低
          </button>
          <button 
            onClick={() => setSortBy('calories_asc')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors whitespace-nowrap ${sortBy === 'calories_asc' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-500 border-slate-200'}`}
          >
            热量最低
          </button>
          <button 
            onClick={() => setSortBy('distance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors whitespace-nowrap ${sortBy === 'distance' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-500 border-slate-200'}`}
          >
            离我最近
          </button>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Search size={40} className="mb-3 opacity-20" />
          <p className="text-sm">未找到相关商品</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 mb-8 animate-fade-in-up">
          {filteredProducts.map((product) => (
            <Link to={`/merchants/product/${product.id}`} key={product.id} className="block group">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 group flex flex-col h-full hover:shadow-md transition-shadow">
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-slate-100 shrink-0">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  {product.isPromo && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      热销
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Flame size={10} fill="currentColor" className="text-orange-400" />
                    {product.calories} kcal
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="font-bold text-slate-800 text-sm mb-2 line-clamp-2 leading-relaxed">
                    {product.name}
                  </h3>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {product.tags.map(tag => (
                      <span key={tag} className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Tag size={8} /> {tag}
                      </span>
                    ))}
                  </div>

                  {/* Merchant Info */}
                  <div className="flex items-center justify-between mt-auto mb-3 pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 truncate max-w-[65%]">
                      <Store size={10} className="shrink-0" />
                      <span className="truncate">{product.merchantName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                      <MapPin size={10} />
                      <span>{product.distance}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-red-500 font-bold">
                      <span className="text-xs">¥</span>
                      <span className="text-lg">{product.price.toFixed(1)}</span>
                    </div>
                    <button 
                      onClick={(e) => handleQuickAdd(e, product)}
                      className="h-8 px-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center gap-1 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-sm active:scale-95"
                    >
                      <span className="text-xs font-bold">记一笔</span>
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {/* Merchant Application Banner */}
      <div className="mt-8 p-6 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl text-center shadow-lg shadow-emerald-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <h3 className="font-bold text-white mb-2 text-lg">您是健康食品商家吗?</h3>
          <p className="text-sm text-emerald-100 mb-5 max-w-[80%] mx-auto leading-relaxed">
            加入 NutriMap 生态，将您的优质健康食品推荐给数万名追求健康生活的用户。
          </p>
          <Link to="/merchant/login" className="inline-block bg-white text-emerald-700 text-sm font-bold px-8 py-3 rounded-full shadow-md active:scale-95 transition-transform">
            前往入驻 / 商家登录
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Merchants;