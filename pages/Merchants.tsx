
import React, { useState, useMemo } from 'react';
import { ShoppingBag, Flame, Plus, Search, MapPin, Store, X, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product, DetailedNutrients } from '../types';
import { useDailyLog } from '../context/DailyLogContext';
import { usePlatform } from '../context/PlatformContext';

type SortType = 'default' | 'price_asc' | 'calories_asc' | 'distance_asc';

const Merchants: React.FC = () => {
  const { addLog } = useDailyLog();
  const { products } = usePlatform();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortType, setSortType] = useState<SortType>('default');
  const [selectedTag, setSelectedTag] = useState('全部');

  // Filter approved products only
  const approvedProducts = useMemo(() => products.filter(p => p.status === 'APPROVED'), [products]);

  // Extract unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    approvedProducts.forEach(p => p.tags.forEach(t => tags.add(t)));
    return ['全部', ...Array.from(tags)];
  }, [approvedProducts]);

  const filteredProducts = useMemo(() => {
    let result = [...approvedProducts];
    
    if (selectedTag !== '全部') {
      result = result.filter(p => p.tags.includes(selectedTag));
    }
    
    if (searchQuery.trim()) {
      result = result.filter(p => p.name.includes(searchQuery.trim()));
    }

    switch (sortType) {
      case 'price_asc': result.sort((a, b) => a.price - b.price); break;
      case 'calories_asc': result.sort((a, b) => a.calories - b.calories); break;
      case 'distance_asc': 
        result.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance)); 
        break;
    }
    return result;
  }, [approvedProducts, selectedTag, searchQuery, sortType]);

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault(); e.stopPropagation();
    // Use the product's actual nutritional data if available, otherwise estimate
    // Note: The product object from PlatformContext should generally have detailedNutrients if added via AI
    // Here we construct a fallback just in case or pass the data if we had it in the list view
    const approx: DetailedNutrients = {
       calories: { value: product.calories, nrvPercent: 0 },
       protein: { value: product.protein, nrvPercent: 0 },
       carbs: { total: { value: product.carbs, nrvPercent: 0 }, available: { value: product.carbs }, fiber: { value: 0 } },
       fat: { total: { value: product.fat, nrvPercent: 0 }, saturated: { value: 0 }, monounsaturated: { value: 0 }, polyunsaturated: { value: 0 } },
       vitamins: {}, minerals: {}
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
      detailedNutrients: approx // Ideally we'd pass the full detailedNutrients if available in the list item
    });
  };

  return (
    <div className="pt-4 min-h-screen bg-slate-50 relative pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-xl px-4 pb-2 pt-2 border-b border-slate-100/50">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">健康优选</h1>
          <Link 
            to="/merchant/login" 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm active:scale-95 transition-all group"
          >
            <Store size={14} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
            <span className="text-xs font-bold text-slate-600 group-hover:text-emerald-600 transition-colors">商家入驻</span>
          </Link>
        </div>
        
        {/* Search */}
        <div className="relative mb-3 group">
          <input 
            type="text"
            placeholder="搜健康餐 / 轻食"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white rounded-2xl pl-11 pr-4 py-3 text-sm outline-none shadow-sm border border-transparent focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400"
          />
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
        </div>

        {/* Filters & Sort */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
           <select 
             className="appearance-none bg-white text-slate-600 px-4 py-2 rounded-full text-xs font-bold border border-slate-200 outline-none"
             value={sortType}
             onChange={(e) => setSortType(e.target.value as SortType)}
           >
             <option value="default">综合排序</option>
             <option value="price_asc">价格最低</option>
             <option value="calories_asc">热量最低</option>
             <option value="distance_asc">距离最近</option>
           </select>
           {allTags.map(tag => (
             <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedTag === tag 
                  ? 'bg-slate-800 text-white shadow-md' 
                  : 'bg-white text-slate-500 border border-slate-200'
                }`}
             >
                {tag}
             </button>
           ))}
        </div>
      </div>

      {/* Product List */}
      <div className="px-4 mt-4">
         {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
               <ShoppingBag size={48} className="mb-4 opacity-20" />
               <p>暂无符合条件的商品</p>
            </div>
         ) : (
            <div className="grid grid-cols-2 gap-4">
               {filteredProducts.map(product => (
                 <Link to={`/merchants/product/${product.id}`} key={product.id} className="block group">
                    <div className="bg-white rounded-[1.2rem] overflow-hidden shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 border border-slate-100 h-full flex flex-col group-active:scale-[0.98]">
                       <div className="aspect-square relative overflow-hidden bg-slate-100">
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          {product.isPromo && (
                             <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                                特惠
                             </div>
                          )}
                          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                             <MapPin size={10} /> {product.distance}
                          </div>
                       </div>
                       
                       <div className="p-3 flex flex-col flex-1">
                          <h3 className="font-bold text-sm text-slate-800 line-clamp-1 mb-1">{product.name}</h3>
                          <div className="flex items-center gap-1 mb-2">
                             <span className="text-[10px] text-slate-400 truncate max-w-[80px]">{product.merchantName}</span>
                          </div>
                          
                          <div className="flex gap-1 flex-wrap mb-3">
                             {product.tags.slice(0, 2).map(t => (
                                <span key={t} className="text-[9px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-100">{t}</span>
                             ))}
                          </div>
                          
                          <div className="mt-auto flex items-center justify-between">
                             <div className="text-red-500 font-bold text-sm">
                                <span className="text-xs">¥</span>{product.price}
                             </div>
                             <div className="text-[10px] text-slate-400 font-medium">
                                {product.calories} kcal
                             </div>
                          </div>
                          
                          <button 
                             onClick={(e) => handleQuickAdd(e, product)}
                             className="w-full mt-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-emerald-100 transition-colors"
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

export default Merchants;
