
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlatform } from '../../context/PlatformContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ProductDetail, DetailedNutrients, Ingredient } from '../../types';
import { analyzeNutritionFromIngredients } from '../../services/geminiService';
import { ArrowLeft, Save, Plus, Trash2, Loader2, ChefHat, Sparkles, Camera, Image as ImageIcon } from 'lucide-react';

const ProductEdit: React.FC = () => {
  const navigate = useNavigate();
  const { addProduct } = usePlatform();
  const { currentMerchantId, merchantName } = useAuth();
  const { showToast } = useToast();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', amount: '' }
  ]);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '' }]);
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field as any] = value;
    setIngredients(newIngredients);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!currentMerchantId) return;
    if (!name.trim()) { showToast('请输入商品名称', 'error'); return; }
    if (!price.trim()) { showToast('请输入价格', 'error'); return; }
    if (!image) { showToast('请上传商品图片', 'error'); return; }
    if (ingredients.some(i => !i.name)) { showToast('请完善配料表', 'error'); return; }

    setIsAnalyzing(true);
    showToast('AI正在分析营养成分...', 'info');

    try {
      // 1. Call AI to analyze nutrition based on name and ingredients
      const analysisResult = await analyzeNutritionFromIngredients(name, ingredients);
      
      // 2. Construct the full ProductDetail object
      const newProduct: ProductDetail = {
        id: Date.now().toString(),
        merchantId: currentMerchantId,
        merchantName: merchantName || "我的店铺", // 使用 AuthContext 中的名称
        merchantAddress: "店铺地址(演示)", // 在实际应用中应从商家信息获取
        merchantRating: 5.0,
        distance: "0.1km", // 演示数据
        status: 'PENDING', // 默认为待审核
        salesCount: 0,
        
        // User Inputs
        name,
        price: Number(price),
        description: description || analysisResult.advice, // 如果没填简介，用AI建议代替
        imageUrl: image, // 使用上传的图片
        ingredients: ingredients.filter(i => i.name && i.amount),
        
        // AI Generated Data
        calories: analysisResult.detailedNutrients.calories.value,
        protein: analysisResult.detailedNutrients.protein.value,
        carbs: analysisResult.detailedNutrients.carbs.total.value,
        fat: analysisResult.detailedNutrients.fat.total.value,
        tags: analysisResult.tags,
        detailedNutrients: analysisResult.detailedNutrients,
      };

      // 3. Submit to Platform
      addProduct(newProduct);
      showToast('提交成功！请等待管理员审核', 'success');
      navigate('/merchant/dashboard');

    } catch (error) {
      console.error(error);
      showToast('分析失败，请重试', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="bg-white px-4 py-4 border-b border-slate-100 flex items-center gap-2 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-100 rounded-full"><ArrowLeft size={20}/></button>
        <h1 className="font-bold text-lg text-slate-800">发布新商品</h1>
      </div>
      
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        {/* Image Upload */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`aspect-square sm:aspect-video w-full rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group transition-colors ${!image ? 'hover:border-emerald-400 hover:bg-emerald-50' : ''}`}
        >
          {image ? (
            <>
              <img src={image} alt="Cover" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/20 backdrop-blur text-white px-4 py-2 rounded-full font-bold flex items-center gap-2">
                   <Camera size={18} /> 更换图片
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-3">
                <ImageIcon size={32} />
              </div>
              <p className="text-slate-500 font-medium">点击上传商品图</p>
              <p className="text-slate-400 text-xs mt-1">支持 jpg, png 格式</p>
            </>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>

        {/* Basic Info */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">基本信息</h2>
          <div>
             <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">商品名称</label>
             <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 transition-colors" value={name} onChange={e => setName(e.target.value)} placeholder="如: 招牌低脂牛肉饭" />
          </div>
          <div>
             <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">价格 (¥)</label>
             <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 transition-colors" type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="28.0" />
          </div>
          <div>
             <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">商品简介</label>
             <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 transition-colors h-24 resize-none" value={description} onChange={e => setDescription(e.target.value)} placeholder="简单介绍一下这道菜的特色、口感或推荐理由..." />
          </div>
        </div>

        {/* Ingredients - Crucial for AI */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
           <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                 <ChefHat size={18} className="text-emerald-500" /> 所需配料
              </h2>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-bold">AI将基于此计算热量</span>
           </div>
           
           <div className="space-y-3">
            {ingredients.map((ing, idx) => (
              <div key={idx} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="食材 (如: 鸡胸肉)" 
                  className="flex-1 p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm outline-none focus:border-emerald-500"
                  value={ing.name}
                  onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                />
                <input 
                  type="text" 
                  placeholder="用量 (如: 150g)" 
                  className="w-28 p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm outline-none focus:border-emerald-500"
                  value={ing.amount}
                  onChange={(e) => handleIngredientChange(idx, 'amount', e.target.value)}
                />
                {ingredients.length > 1 && (
                  <button onClick={() => handleRemoveIngredient(idx)} className="p-2 text-slate-300 hover:text-red-500">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
            <button 
              onClick={handleAddIngredient}
              className="w-full py-3 border border-dashed border-emerald-300 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 mt-2 hover:bg-emerald-100 transition-colors"
            >
              <Plus size={16} /> 添加配料
            </button>
          </div>
        </div>

        {/* Steps (Optional text area) */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
           <h2 className="font-bold text-slate-800">制作步骤 / 备注 (选填)</h2>
           <textarea 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 transition-colors h-24 resize-none" 
              value={steps} 
              onChange={e => setSteps(e.target.value)} 
              placeholder="填写制作流程或给用户的特别提示..." 
           />
        </div>
        
        {/* Info Card */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl flex items-start gap-3 border border-emerald-100">
           <Sparkles className="text-emerald-500 shrink-0 mt-0.5" size={18} />
           <div className="text-sm text-emerald-800">
              <p className="font-bold mb-1">无需填写热量！</p>
              <p className="text-xs opacity-80 leading-relaxed">
                 提交后，NutriMap AI 引擎将自动根据您的配料表计算热量、蛋白质及详细的维生素/矿物质数据，并生成营养全景图。
              </p>
           </div>
        </div>

        <button 
          onClick={handleSubmit} 
          disabled={isAnalyzing}
          className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
             isAnalyzing 
             ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
             : 'bg-emerald-600 text-white shadow-emerald-200 active:scale-95 hover:bg-emerald-700'
          }`}
        >
           {isAnalyzing ? (
              <>
                 <Loader2 className="animate-spin" size={20} />
                 AI 正在分析营养数据...
              </>
           ) : (
              <>
                 <Save size={20} /> 智能分析并提交审核
              </>
           )}
        </button>
      </div>
    </div>
  );
};

export default ProductEdit;
