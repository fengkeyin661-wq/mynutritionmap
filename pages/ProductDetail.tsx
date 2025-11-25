
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Flame, MapPin, Store, 
  ShoppingCart, AlertCircle, ShoppingBag, Star, Info,
  ChefHat, Activity, PlusCircle, Heart
} from 'lucide-react';
import type { ProductDetail as ProductDetailType } from '../types';
import { useDailyLog } from '../context/DailyLogContext';
import { useAuth } from '../context/AuthContext';
import { NutrientBar, MicroNutrientGrid } from '../components/NutrientVisualizations';

// Mock Data Generator for the specific Product ID
const getMockProductDetail = (id: string): ProductDetailType => {
  return {
    id,
    name: "低脂鸡胸肉轻食餐盒",
    price: 28.0,
    imageUrl: "https://picsum.photos/300/300?random=20",
    calories: 350,
    protein: 32.0,
    carbs: 35,
    fat: 8.5,
    tags: ["高蛋白", "低碳水", "今日配送"],
    isPromo: true,
    merchantName: "轻食主义工坊",
    distance: "0.8km",
    merchantAddress: "朝阳区建国路88号SOHO现代城A座",
    merchantRating: 4.8,
    salesCount: 1205,
    description: "选用优质散养鸡胸肉，低温慢煮锁住水分，搭配当季时蔬（西兰花、胡萝卜、玉米粒）和藜麦饭。无论是减脂期还是日常健康饮食，都是绝佳选择。无添加防腐剂，每日现做。",
    ingredients: [
      { name: '鸡胸肉', amount: '150g' },
      { name: '藜麦饭', amount: '100g' },
      { name: '西兰花', amount: '50g' },
      { name: '胡萝卜', amount: '30g' },
      { name: '玉米粒', amount: '20g' },
      { name: '特制油醋汁', amount: '25ml' }
    ],
    // Added missing properties
    merchantId: "m1",
    status: "APPROVED",
    detailedNutrients: {
      calories: { value: 350, nrvPercent: 18 },
      protein: { value: 32.0, nrvPercent: 53 },
      carbs: {
        total: { value: 35, nrvPercent: 12 },
        available: { value: 28 },
        fiber: { value: 7 }
      },
      fat: {
        total: { value: 8.5, nrvPercent: 14 },
        saturated: { value: 1.5 },
        monounsaturated: { value: 4.0 },
        polyunsaturated: { value: 2.0 }
      },
      vitamins: {
        'A': { value: '220μg', nrvPercent: 28 },
        'B1': { value: '0.3mg', nrvPercent: 21 },
        'B2': { value: '0.4mg', nrvPercent: 28 },
        'B3': { value: '8.5mg', nrvPercent: 53 },
        'B5': { value: '1.2mg', nrvPercent: 24 },
        'B6': { value: '0.8mg', nrvPercent: 57 },
        'B7': { value: '15μg', nrvPercent: 50 },
        'B9': { value: '120μg', nrvPercent: 30 },
        'B12': { value: '0.5μg', nrvPercent: 21 },
        'C': { value: '45mg', nrvPercent: 45 },
        'D': { value: '0.5μg', nrvPercent: 10 },
        'E': { value: '2.1mg', nrvPercent: 15 }
      },
      minerals: {
        '钠 (Na)': { value: '450mg', nrvPercent: 23 },
        '钾 (K)': { value: '520mg', nrvPercent: 26 },
        '钙 (Ca)': { value: '45mg', nrvPercent: 6 },
        '镁 (Mg)': { value: '65mg', nrvPercent: 21 },
        '磷 (P)': { value: '150mg', nrvPercent: 21 },
        '铁 (Fe)': { value: '2.8mg', nrvPercent: 19 },
        '锌 (Zn)': { value: '2.2mg', nrvPercent: 15 },
        '铜 (Cu)': { value: '0.3mg', nrvPercent: 20 },
        '碘 (I)': { value: '10μg', nrvPercent: 7 },
        '硒 (Se)': { value: '15μg', nrvPercent: 30 },
        '铬 (Cr)': { value: '8μg', nrvPercent: 24 },
        '钼 (Mo)': { value: '10μg', nrvPercent: 17 }
      }
    }
  };
};

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addLog } = useDailyLog();
  const { isFavoriteProduct, toggleFavoriteProduct } = useAuth();
  const [activeTab, setActiveTab] = useState<'details' | 'nutrition'>('details');
  
  // Mock data fetch
  const product = getMockProductDetail(id || '1');
  const isFavorite = isFavoriteProduct(product.id);

  const handleAddToLog = () => {
    addLog({
      name: product.name,
      imageUrl: product.imageUrl,
      calories: product.detailedNutrients.calories.value,
      protein: product.detailedNutrients.protein.value,
      carbs: product.detailedNutrients.carbs.total.value,
      fat: product.detailedNutrients.fat.total.value,
      sourceType: 'PRODUCT',
      sourceId: product.id,
      detailedNutrients: product.detailedNutrients // Pass detailed data
    });
  };

  return (
    <div className="bg-white min-h-screen pb-32 relative">
      {/* Header Image */}
      <div className="relative h-72 w-full">
        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        
        {/* Nav Bar */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
           <button 
             onClick={() => navigate(-1)}
             className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
           >
             <ArrowLeft size={24} />
           </button>
           <button 
             onClick={() => toggleFavoriteProduct(product.id)}
             className={`p-2 bg-white/20 backdrop-blur-md rounded-full transition-colors ${isFavorite ? 'text-red-500 bg-white' : 'text-white hover:bg-white/30'}`}
           >
             <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
           </button>
        </div>

        <div className="absolute bottom-6 left-6 right-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            {product.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-emerald-500/80 backdrop-blur-sm rounded text-[10px] font-bold">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-2xl font-bold mb-2 leading-tight">{product.name}</h1>
          <div className="flex items-center gap-4 text-sm text-white/90">
             <span className="flex items-center gap-1"><Flame size={14} className="text-orange-400" fill="currentColor" /> {product.calories} kcal</span>
             <span className="flex items-center gap-1"><ShoppingBag size={14} /> 月售 {product.salesCount}</span>
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="rounded-t-3xl bg-white -mt-6 relative z-10 px-6 pt-8">
        
        {/* Merchant Card */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 mb-6 flex items-start gap-3">
          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
             <Store size={24} className="text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
             <div className="flex justify-between items-start">
               <h3 className="font-bold text-slate-800 truncate">{product.merchantName}</h3>
               <span className="text-emerald-600 font-bold text-xs flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <Star size={10} fill="currentColor" /> {product.merchantRating}
               </span>
             </div>
             <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                <MapPin size={12} />
                <span className="truncate">{product.merchantAddress}</span>
             </div>
             <div className="text-xs text-slate-400 mt-1">
                距离您 {product.distance}
             </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
          <button 
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'details' 
              ? 'bg-white text-emerald-600 shadow-sm' 
              : 'text-slate-500'
            }`}
          >
            <Info size={16} className="inline mr-1 mb-0.5" /> 商品详情
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

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-6 animate-fade-in">
             <div>
                <h3 className="font-bold text-slate-800 mb-2">商品简介</h3>
                <p className="text-slate-600 text-sm leading-relaxed text-justify">
                  {product.description}
                </p>
             </div>

             <div>
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                 <ChefHat size={18} className="text-emerald-500" /> 主要配料
              </h3>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <ul className="space-y-2">
                  {product.ingredients.map((ing, idx) => (
                    <li key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-slate-700 font-medium">{ing.name}</span>
                      <span className="text-slate-500">{ing.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Nutrition Tab */}
        {activeTab === 'nutrition' && (
          <div className="space-y-6 animate-fade-in pb-8">
             <div className="bg-amber-50 text-amber-700 p-3 rounded-xl flex gap-2 text-xs items-start">
               <AlertCircle size={16} className="shrink-0 mt-0.5" />
               <p>营养数据仅供参考，基于标准配方估算。实际数据可能因批次不同略有差异。NRV%参考中国成人每日推荐摄入量。</p>
            </div>

            {/* Core Macros */}
            <div>
              <h3 className="font-bold text-slate-800 mb-4">核心营养素</h3>
              <NutrientBar 
                label="热量" 
                value={`${product.detailedNutrients.calories.value} kcal`} 
                percentage={product.detailedNutrients.calories.nrvPercent}
                color="bg-slate-800"
              />
              <NutrientBar 
                label="蛋白质" 
                value={`${product.detailedNutrients.protein.value}g`} 
                percentage={product.detailedNutrients.protein.nrvPercent}
              />
              <NutrientBar 
                label="总碳水化合物" 
                value={`${product.detailedNutrients.carbs.total.value}g`} 
                percentage={product.detailedNutrients.carbs.total.nrvPercent}
                color="bg-yellow-500"
                subValues={[
                  { label: "可利用碳水", value: `${product.detailedNutrients.carbs.available.value}g` },
                  { label: "膳食纤维", value: `${product.detailedNutrients.carbs.fiber.value}g` }
                ]}
              />
              <NutrientBar 
                label="总脂肪" 
                value={`${product.detailedNutrients.fat.total.value}g`} 
                percentage={product.detailedNutrients.fat.total.nrvPercent}
                color="bg-orange-500"
                subValues={[
                  { label: "饱和脂肪", value: `${product.detailedNutrients.fat.saturated.value}g` },
                  { label: "单不饱和", value: `${product.detailedNutrients.fat.monounsaturated.value}g` },
                  { label: "多不饱和", value: `${product.detailedNutrients.fat.polyunsaturated.value}g` }
                ]}
              />
            </div>

            {/* Vitamins */}
            <div>
               <h3 className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-2">
                 <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
                 维生素 (Vitamins)
               </h3>
               <MicroNutrientGrid items={product.detailedNutrients.vitamins} />
            </div>

            {/* Minerals */}
            <div>
               <h3 className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-2">
                 <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                 矿物质 (Minerals)
               </h3>
               <MicroNutrientGrid items={product.detailedNutrients.minerals} />
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-40 max-w-md mx-auto">
         <div className="flex gap-4 items-center">
            <div className="flex-1">
               <div className="text-red-500 font-bold flex items-end leading-none">
                  <span className="text-sm mb-1">¥</span>
                  <span className="text-3xl">{product.price.toFixed(1)}</span>
               </div>
               <div className="text-[10px] text-slate-400 mt-1">
                  运费: ¥0 &nbsp;|&nbsp; 约30分钟送达
               </div>
            </div>
            <button 
               onClick={handleAddToLog}
               className="flex-1 bg-slate-800 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
               <PlusCircle size={18} /> 加入食谱
            </button>
            <button className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-200">
               立即购买
            </button>
         </div>
         {/* Safe Area Spacer for Mobile */}
         <div className="h-safe-bottom w-full"></div> 
      </div>
    </div>
  );
};

export default ProductDetail;
