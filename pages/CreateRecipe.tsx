
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Camera, Clock, Plus, Trash2, 
  ChefHat, AlignLeft, Image as ImageIcon, Save 
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { usePlatform } from '../context/PlatformContext';
import { useAuth } from '../context/AuthContext';
import { RecipeDetail, DetailedNutrients, CookingStep, Ingredient } from '../types';

interface IngredientInput {
  name: string;
  amount: string;
}

interface StepInput {
  description: string;
  image?: string;
}

const CreateRecipe: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { addRecipe } = usePlatform();
  const { userProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form States
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState('');
  
  const [ingredients, setIngredients] = useState<IngredientInput[]>([
    { name: '', amount: '' },
    { name: '', amount: '' }
  ]);
  
  const [steps, setSteps] = useState<StepInput[]>([
    { description: '' }
  ]);

  // Handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '' }]);
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleIngredientChange = (index: number, field: keyof IngredientInput, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const handleAddStep = () => {
    setSteps([...steps, { description: '' }]);
  };

  const handleRemoveStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps);
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index].description = value;
    setSteps(newSteps);
  };

  const handleSubmit = () => {
    // Basic Validation
    if (!title.trim()) {
      showToast('请填写食谱标题', 'error');
      return;
    }
    if (!coverImage) {
      showToast('请上传食谱封面图', 'error');
      return;
    }
    if (ingredients.some(i => !i.name.trim())) {
      showToast('请完善食材信息', 'error');
      return;
    }

    // Generate Mock Nutrition Data (Since we don't have user input for it, we simulate AI calc)
    // 实际项目中可以调用 geminiService 进行估算
    const estimatedCalories = Math.floor(Math.random() * 400 + 200); // 200-600
    const estimatedProtein = Math.floor(estimatedCalories * 0.2 / 4);
    const estimatedCarbs = Math.floor(estimatedCalories * 0.5 / 4);
    const estimatedFat = Math.floor(estimatedCalories * 0.3 / 9);

    const mockDetailedNutrients: DetailedNutrients = {
      calories: { value: estimatedCalories, nrvPercent: Math.round(estimatedCalories/2000*100) },
      protein: { value: estimatedProtein, nrvPercent: 0 },
      carbs: { 
        total: { value: estimatedCarbs, nrvPercent: 0 },
        available: { value: Math.round(estimatedCarbs * 0.9) },
        fiber: { value: Math.round(estimatedCarbs * 0.1) }
      },
      fat: {
        total: { value: estimatedFat, nrvPercent: 0 },
        saturated: { value: Math.round(estimatedFat * 0.2) },
        monounsaturated: { value: Math.round(estimatedFat * 0.5) },
        polyunsaturated: { value: Math.round(estimatedFat * 0.3) }
      },
      vitamins: {},
      minerals: {}
    };

    const newRecipe: RecipeDetail & { category: string } = {
      id: Date.now().toString(),
      title,
      author: userProfile?.nickname || '我',
      likes: 0,
      imageUrl: coverImage,
      calories: estimatedCalories,
      protein: estimatedProtein,
      carbs: estimatedCarbs,
      fat: estimatedFat,
      prepTime: Number(prepTime) || 15,
      description,
      ingredients: ingredients.filter(i => i.name),
      steps: steps.map((s, idx) => ({ step: idx + 1, description: s.description })),
      detailedNutrients: mockDetailedNutrients,
      category: '全部' // 默认分类
    };

    addRecipe(newRecipe);

    showToast('发布成功！', 'success');
    setTimeout(() => {
      navigate('/community');
    }, 1500);
  };

  return (
    <div className="bg-white min-h-screen pb-24 relative">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-bold text-lg text-slate-800">发布食谱</h1>
        <button 
          onClick={handleSubmit}
          className="text-sm font-bold text-white bg-emerald-600 px-4 py-1.5 rounded-full shadow-lg shadow-emerald-200 active:scale-95 transition-transform"
        >
          发布
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Cover Image Upload */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`aspect-video w-full rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group transition-colors ${!coverImage ? 'hover:border-emerald-400 hover:bg-emerald-50' : ''}`}
        >
          {coverImage ? (
            <>
              <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/20 backdrop-blur text-white px-4 py-2 rounded-full font-bold flex items-center gap-2">
                   <Camera size={18} /> 更换封面
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-3">
                <ImageIcon size={32} />
              </div>
              <p className="text-slate-500 font-medium">点击上传成品图</p>
              <p className="text-slate-400 text-xs mt-1">诱人的封面是成功的开始</p>
            </>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <input 
              type="text" 
              placeholder="填写食谱标题，如：低脂牛油果意面" 
              className="w-full text-xl font-bold placeholder:text-slate-300 border-none outline-none bg-transparent"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <textarea 
              placeholder="说说这道菜的灵感、口感或适合的场景..." 
              className="w-full h-24 p-4 bg-slate-50 rounded-xl border border-slate-100 resize-none outline-none focus:border-emerald-500 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 w-max">
            <Clock size={18} className="text-slate-400" />
            <span className="text-sm font-bold text-slate-600">制作时长</span>
            <input 
              type="number" 
              placeholder="15" 
              className="w-12 bg-white rounded-md text-center py-1 text-sm font-bold border border-slate-200 focus:border-emerald-500 outline-none"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
            />
            <span className="text-sm text-slate-400">分钟</span>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Ingredients */}
        <div>
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ChefHat size={20} className="text-emerald-500" /> 所需食材
          </h3>
          <div className="space-y-3">
            {ingredients.map((ing, idx) => (
              <div key={idx} className="flex gap-2 items-center animate-fade-in">
                <div className="grid grid-cols-2 gap-2 flex-1">
                  <input 
                    type="text" 
                    placeholder="食材名称 (如: 鸡胸肉)" 
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm outline-none focus:border-emerald-500 transition-colors"
                    value={ing.name}
                    onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                  />
                  <input 
                    type="text" 
                    placeholder="用量 (默认g)" 
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm outline-none focus:border-emerald-500 transition-colors"
                    value={ing.amount}
                    onChange={(e) => handleIngredientChange(idx, 'amount', e.target.value)}
                  />
                </div>
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
              <Plus size={16} /> 添加食材
            </button>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Steps */}
        <div>
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlignLeft size={20} className="text-emerald-500" /> 制作步骤
          </h3>
          <div className="space-y-6">
            {steps.map((step, idx) => (
              <div key={idx} className="flex gap-4 animate-fade-in">
                <div className="shrink-0 w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md shadow-slate-200">
                  {idx + 1}
                </div>
                <div className="flex-1 space-y-3">
                  <textarea 
                    placeholder={`请输入步骤 ${idx + 1} 的具体操作...`}
                    className="w-full p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm outline-none focus:border-emerald-500 transition-colors resize-none h-28 leading-relaxed"
                    value={step.description}
                    onChange={(e) => handleStepChange(idx, e.target.value)}
                  />
                  {/* Step Image Placeholder (Optional functionality) */}
                  <div className="flex justify-between items-center">
                    <button className="text-xs text-slate-400 flex items-center gap-1 hover:text-emerald-600 transition-colors bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <Camera size={14} /> 添加步骤图
                    </button>
                    {steps.length > 1 && (
                      <button onClick={() => handleRemoveStep(idx)} className="text-xs text-slate-400 hover:text-red-500 px-2">
                        删除步骤
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
             <button 
              onClick={handleAddStep}
              className="w-full py-3 border border-dashed border-emerald-300 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 mt-2 hover:bg-emerald-100 transition-colors"
            >
              <Plus size={16} /> 添加步骤
            </button>
          </div>
        </div>

        {/* Safe area for bottom spacing */}
        <div className="h-8"></div>
      </div>
    </div>
  );
};

export default CreateRecipe;
