import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlatform } from '../../context/PlatformContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ProductDetail, Ingredient } from '../../types';
import { analyzeNutritionFromIngredients } from '../../services/aiService';
import { uploadImage } from '../../lib/supabase';
import { ArrowLeft, Save, Plus, Trash2, Loader2, ChefHat, Sparkles, Image as ImageIcon } from 'lucide-react';

const ProductEdit: React.FC = () => {
  const navigate = useNavigate();
  const { addProduct } = usePlatform();
  const { currentMerchantId, merchantName } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [productImage, setProductImage] = useState<string>('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', amount: '' }]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const url = await uploadImage(file);
      setIsUploading(false);
      
      if (url) {
        setProductImage(url);
        showToast('上传成功', 'success');
      } else {
        showToast('上传失败', 'error');
      }
    }
  };

  const handleSubmit = async () => {
    if (!currentMerchantId) return;
    if (!name.trim()) { showToast('请输入商品名称', 'error'); return; }
    if (!price.trim()) { showToast('请输入价格', 'error'); return; }
    if (!productImage) { showToast('请上传图片', 'error'); return; }

    setIsAnalyzing(true);
    showToast('AI正在计算热量...', 'info');

    try {
      const analysisResult = await analyzeNutritionFromIngredients(name, ingredients);
      
      const newProduct: ProductDetail = {
        id: Date.now().toString(),
        merchantId: currentMerchantId,
        merchantName: merchantName || "我的店铺",
        merchantAddress: "店铺地址",
        merchantRating: 5.0,
        distance: "0.1km",
        status: 'PENDING',
        salesCount: 0,
        name,
        price: Number(price),
        description: description || analysisResult.advice,
        imageUrl: productImage,
        ingredients: ingredients.filter(i => i.name),
        calories: analysisResult.detailedNutrients.calories.value,
        protein: analysisResult.detailedNutrients.protein.value,
        carbs: analysisResult.detailedNutrients.carbs.total.value,
        fat: analysisResult.detailedNutrients.fat.total.value,
        tags: analysisResult.tags,
        detailedNutrients: analysisResult.detailedNutrients,
      };

      await addProduct(newProduct);
      showToast('提交审核成功', 'success');
      navigate('/merchant/dashboard');

    } catch (error: any) {
      console.error(error);
      showToast('提交失败', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="bg-white px-4 py-3 pt-safe border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600"><ArrowLeft size={20}/></button>
        <h1 className="font-bold text-slate-800">发布商品</h1>
        <div className="w-10"></div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Image Upload */}
        <div 
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`aspect-video w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden bg-white ${!productImage ? 'border-slate-200' : 'border-emerald-500'}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center text-emerald-500"><Loader2 size={32} className="animate-spin mb-2" /><span className="text-xs font-bold">上传中...</span></div>
          ) : productImage ? (
            <img src={productImage} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center text-slate-400"><ImageIcon size={32} className="mb-2"/><span className="text-sm font-bold">上传商品图</span></div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>

        {/* Basic Info */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
           <div className="border-b border-slate-50 pb-2 mb-2 font-bold text-slate-800">基本信息</div>
           <input className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none" value={name} onChange={e => setName(e.target.value)} placeholder="商品名称" />
           <div className="flex gap-2 items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-sm font-bold">¥</span>
              <input className="flex-1 bg-transparent font-bold outline-none" type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="价格" />
           </div>
           <textarea className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none h-24 resize-none text-sm" value={description} onChange={e => setDescription(e.target.value)} placeholder="商品简介..." />
        </div>

        {/* Ingredients */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
           <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-2">
              <h2 className="font-bold text-slate-800 flex items-center gap-2"><ChefHat size={18} className="text-emerald-500" /> 配料表</h2>
              <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full font-bold">AI 计算热量</span>
           </div>
           <div className="space-y-3">
            {ingredients.map((ing, idx) => (
              <div key={idx} className="flex gap-2">
                <input value={ing.name} onChange={e => { const n = [...ingredients]; n[idx].name = e.target.value; setIngredients(n); }} placeholder="食材" className="flex-1 p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm outline-none" />
                <input value={ing.amount} onChange={e => { const n = [...ingredients]; n[idx].amount = e.target.value; setIngredients(n); }} placeholder="量" className="w-20 p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm outline-none text-center" />
                {ingredients.length > 1 && <button onClick={() => setIngredients(ingredients.filter((_,i) => i!==idx))} className="text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>}
              </div>
            ))}
            <button onClick={() => setIngredients([...ingredients, { name: '', amount: '' }])} className="w-full py-3 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 mt-2">
              <Plus size={16} /> 添加配料
            </button>
          </div>
        </div>

        {/* AI Notice */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl flex gap-3 border border-emerald-100">
           <Sparkles className="text-emerald-500 shrink-0 mt-0.5" size={18} />
           <p className="text-xs text-emerald-800 leading-relaxed opacity-80">提交后，AI 将自动分析配料表，计算热量、蛋白质及微量元素，生成营养全景图。</p>
        </div>

        <button 
          onClick={handleSubmit} 
          disabled={isAnalyzing || isUploading}
          className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
           {isAnalyzing ? <><Loader2 className="animate-spin" size={20} /> AI 分析中...</> : <><Save size={20} /> 提交审核</>}
        </button>
      </div>
    </div>
  );
};

export default ProductEdit;