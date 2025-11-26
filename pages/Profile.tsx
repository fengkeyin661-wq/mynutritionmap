
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDailyLog } from '../context/DailyLogContext';
import { 
  User, ChevronRight, LogOut, Heart, 
  QrCode, Info, Camera, Edit2, X, Trash2,
  Shield, FileText, Flame, PlusCircle
} from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';

type ModalType = 'NONE' | 'QR' | 'LOGS' | 'AGREEMENT' | 'PRIVACY' | 'ABOUT';

const Profile: React.FC = () => {
  const { role, userProfile, loginAs, logout, favoriteRecipes, favoriteProducts, userFoodLibrary, deleteFromFoodLibrary } = useAuth();
  const { addLog } = useDailyLog();
  const navigate = useNavigate();
  
  const [activeModal, setActiveModal] = useState<ModalType>('NONE');

  // 如果没有用户资料，直接跳转到登录/注册引导页
  if (role === 'USER' && !userProfile) {
     return <Navigate to="/login" replace />;
  }

  // Handle Role Switch for Demo Purposes
  const handleRoleSwitch = (targetRole: 'USER' | 'MERCHANT' | 'ADMIN', merchantId?: string) => {
    loginAs(targetRole, merchantId);
    if (targetRole === 'MERCHANT') navigate('/merchant/dashboard');
    if (targetRole === 'ADMIN') navigate('/admin/dashboard');
    if (targetRole === 'USER') navigate('/');
  };

  const handleFoodLogClick = () => {
    // 即使没有记录也打开，展示空状态引导
    setActiveModal('LOGS');
  };

  const handleAddToDailyLog = (item: any) => {
    addLog({
      name: item.name,
      imageUrl: item.imageUrl,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      sourceType: 'AI_ANALYSIS', // DIY items are usually from analysis
      detailedNutrients: item.detailedNutrients
    });
  };

  const closeModal = () => setActiveModal('NONE');

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      
      {/* 1. Header Section */}
      <div className="bg-white p-6 pb-8 rounded-b-[2.5rem] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
        
        <div className="flex justify-between items-start relative z-10">
           <h1 className="text-2xl font-bold text-slate-800">我的</h1>
           <button onClick={() => navigate('/login')} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-emerald-600 transition-colors">
              <Edit2 size={18} />
           </button>
        </div>

        <div className="flex items-center gap-4 mt-6 relative z-10">
           <div className="w-20 h-20 rounded-full border-4 border-slate-50 shadow-md overflow-hidden bg-slate-200">
              {userProfile?.avatarUrl ? (
                 <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                 <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                    <User size={32} />
                 </div>
              )}
           </div>
           <div>
              <h2 className="text-xl font-bold text-slate-800">{userProfile?.nickname || '用户8848'}</h2>
              <div className="flex gap-2 mt-1">
                 <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold">
                    {userProfile?.gender === 'MALE' ? '♂ 男生' : '♀ 女生'}
                 </span>
                 <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-bold">
                    {userProfile?.activityLevel === 'SEDENTARY' ? '久坐' : '活跃'}
                 </span>
              </div>
           </div>
        </div>

        {/* Health Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mt-8">
           <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
              <div className="text-xs text-slate-400 mb-1">BMI指数</div>
              <div className="text-lg font-bold text-slate-800">{userProfile?.bmi}</div>
              <div className="text-[10px] text-emerald-500 font-medium">
                 {userProfile && userProfile.bmi < 18.5 ? '偏瘦' : userProfile && userProfile.bmi < 24 ? '正常' : '偏胖'}
              </div>
           </div>
           <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
              <div className="text-xs text-slate-400 mb-1">基础代谢</div>
              <div className="text-lg font-bold text-slate-800">{userProfile?.bmr}</div>
              <div className="text-[10px] text-slate-400">kcal/天</div>
           </div>
           <div className="bg-slate-50 p-3 rounded-2xl text-center border border-emerald-100 bg-emerald-50/50">
              <div className="text-xs text-emerald-600/70 mb-1 font-bold">每日推荐</div>
              <div className="text-lg font-bold text-emerald-600">{userProfile?.tdee}</div>
              <div className="text-[10px] text-emerald-500">kcal</div>
           </div>
        </div>
      </div>

      {/* 2. Content Body */}
      <div className="px-4 mt-6 space-y-6">
         
         {/* Shortcuts */}
         <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleFoodLogClick}
              className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-3 text-left hover:bg-slate-50 transition-colors"
            >
               <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center shrink-0">
                  <Camera size={20} />
               </div>
               <div>
                  <div className="font-bold text-slate-700">饮食记录</div>
                  <div className="text-xs text-slate-400">
                    {userFoodLibrary.length > 0 ? `已上传 ${userFoodLibrary.length} 道` : '自建DIY库'}
                  </div>
               </div>
            </button>
            <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-3">
               <div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center shrink-0">
                  <Heart size={20} />
               </div>
               <div>
                  <div className="font-bold text-slate-700">我的收藏</div>
                  <div className="text-xs text-slate-400">{favoriteRecipes.length + favoriteProducts.length} 个喜欢</div>
               </div>
            </div>
         </div>

         {/* Menu List */}
         <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button 
               onClick={() => setActiveModal('QR')}
               className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-50"
            >
               <div className="flex items-center gap-3">
                  <QrCode size={20} className="text-slate-400" />
                  <span className="font-medium text-slate-700">加入社区</span>
               </div>
               <ChevronRight size={16} className="text-slate-300" />
            </button>
            
            <button 
               onClick={() => setActiveModal('AGREEMENT')}
               className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-50"
            >
               <div className="flex items-center gap-3">
                  <FileText size={20} className="text-slate-400" />
                  <span className="font-medium text-slate-700">用户协议</span>
               </div>
               <ChevronRight size={16} className="text-slate-300" />
            </button>

            <button 
               onClick={() => setActiveModal('PRIVACY')}
               className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-50"
            >
               <div className="flex items-center gap-3">
                  <Shield size={20} className="text-slate-400" />
                  <span className="font-medium text-slate-700">隐私政策</span>
               </div>
               <ChevronRight size={16} className="text-slate-300" />
            </button>

            <button 
               onClick={() => setActiveModal('ABOUT')}
               className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
            >
               <div className="flex items-center gap-3">
                  <Info size={20} className="text-slate-400" />
                  <span className="font-medium text-slate-700">关于 APP</span>
               </div>
               <ChevronRight size={16} className="text-slate-300" />
            </button>
         </div>

         {/* Dev Options: Role Switching */}
         <div className="bg-slate-100 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">开发者选项 (切换身份)</h3>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
               <button onClick={() => handleRoleSwitch('MERCHANT', 'm1')} className="px-3 py-1.5 bg-white rounded-lg text-xs font-bold text-slate-600 border border-slate-200 whitespace-nowrap">
                  切换商家端
               </button>
               <button onClick={() => handleRoleSwitch('ADMIN')} className="px-3 py-1.5 bg-white rounded-lg text-xs font-bold text-slate-600 border border-slate-200 whitespace-nowrap">
                  切换管理端
               </button>
            </div>
         </div>

         <button 
           onClick={logout}
           className="w-full py-3 text-red-500 font-bold bg-white border border-red-50 rounded-xl flex items-center justify-center gap-2"
         >
            <LogOut size={18} /> 退出登录
         </button>
      </div>

      {/* --- MODALS --- */}

      {/* QR Code Modal */}
      {activeModal === 'QR' && (
         <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center animate-fade-in-up relative">
               <button onClick={closeModal} className="absolute top-4 right-4 text-slate-300 hover:text-slate-500">
                  <X size={24} />
               </button>
               <h3 className="text-xl font-bold text-slate-800 mb-2">加入 NutriMap 社区</h3>
               <p className="text-slate-500 text-sm mb-6">扫描二维码，和千万食友一起健康打卡</p>
               <div className="w-48 h-48 bg-slate-100 mx-auto rounded-xl flex items-center justify-center text-slate-400 mb-6">
                  <QrCode size={64} />
               </div>
               <button onClick={closeModal} className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl">关闭</button>
            </div>
         </div>
      )}

      {/* Food Logs Modal -> Now "User Food Library" */}
      {activeModal === 'LOGS' && (
         <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-md h-[80vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col animate-slide-up shadow-2xl">
               <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white z-10 sticky top-0">
                  <div>
                     <h3 className="text-lg font-bold text-slate-800">我的DIY美食库</h3>
                     <p className="text-xs text-slate-400">所有拍照/识别的历史记录 (仅自己可见)</p>
                  </div>
                  <button onClick={closeModal} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:bg-slate-100">
                     <X size={20} />
                  </button>
               </div>
               <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {userFoodLibrary.length === 0 ? (
                     <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <Camera size={48} className="mb-2 opacity-20" />
                        <p className="text-sm">暂无DIY记录</p>
                        <p className="text-xs mt-1">去"识别"页面拍照上传吧</p>
                     </div>
                  ) : (
                     userFoodLibrary.map(item => (
                        <div key={item.id} className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center gap-3 shadow-sm">
                           <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 relative group">
                             {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Flame size={20} className="text-slate-300"/></div>}
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-700 truncate">{item.name}</h4>
                              <p className="text-xs text-slate-400 mt-1">{item.calories} kcal</p>
                           </div>
                           
                           <div className="flex items-center gap-2">
                             <button 
                               onClick={() => handleAddToDailyLog(item)}
                               className="px-3 py-1.5 bg-emerald-50 text-emerald-600 font-bold text-xs rounded-lg flex items-center gap-1 active:scale-95 transition-transform"
                             >
                               <PlusCircle size={14} /> 记入今日
                             </button>
                             <button onClick={() => deleteFromFoodLibrary(item.id)} className="p-2 text-slate-300 hover:text-red-500 bg-slate-50 rounded-lg">
                                <Trash2 size={16} />
                             </button>
                           </div>
                        </div>
                     ))
                  )}
               </div>
            </div>
         </div>
      )}

      {/* User Agreement Modal */}
      {activeModal === 'AGREEMENT' && (
         <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-md h-[85vh] sm:h-[700px] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col animate-slide-up shadow-2xl">
               <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-800">用户服务协议</h3>
                  <button onClick={closeModal}><X size={24} className="text-slate-400" /></button>
               </div>
               <div className="flex-1 overflow-y-auto p-6 text-sm text-slate-600 leading-relaxed space-y-6">
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-amber-800 text-xs font-bold leading-5">
                     特别提示：本应用提供的所有营养分析数据（含AI识别结果）仅供健康管理参考，不作为医疗诊断或治疗依据。在使用本服务前，请仔细阅读本协议。
                  </div>
                  
                  <section>
                     <h4 className="font-bold text-slate-800 mb-2">1. 服务内容</h4>
                     <p>NutriMap 是一款提供食物识别、营养分析、食谱分享及商家信息展示的智能健康助手应用。我们致力于通过技术手段帮助用户更好地管理饮食健康。</p>
                  </section>
                  
                  <section>
                     <h4 className="font-bold text-slate-800 mb-2">2. 用户规范</h4>
                     <ul className="list-disc pl-4 space-y-1">
                        <li>用户需保证在注册时提供真实、准确的个人信息（身高、体重等），以便我们提供准确的健康建议。</li>
                        <li>用户在社区发布的内容（食谱、评论）需符合法律法规，不得包含违法、色情、暴力或虚假信息。</li>
                        <li>严禁恶意攻击、骚扰其他用户或商家。</li>
                     </ul>
                  </section>

                  <section>
                     <h4 className="font-bold text-slate-800 mb-2">3. 知识产权</h4>
                     <p>用户在平台发布的原创内容（如食谱图片、文字），著作权归用户所有，但用户授权 NutriMap 在平台范围内免费使用、展示及推广。</p>
                  </section>

                  <section>
                     <h4 className="font-bold text-slate-800 mb-2">4. 免责声明</h4>
                     <p>AI 识别技术存在一定误差，识别结果受光线、角度等因素影响。我们不对因依赖此类数据而导致的任何健康问题承担法律责任。若您有特定疾病或饮食限制，请务必遵从专业医生的指导。</p>
                  </section>
               </div>
               <div className="p-4 border-t border-slate-100 bg-white">
                  <button onClick={closeModal} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold">我已阅读并同意</button>
               </div>
            </div>
         </div>
      )}

      {/* Privacy Policy Modal */}
      {activeModal === 'PRIVACY' && (
         <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-md h-[85vh] sm:h-[700px] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col animate-slide-up shadow-2xl">
               <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-800">隐私政策</h3>
                  <button onClick={closeModal}><X size={24} className="text-slate-400" /></button>
               </div>
               <div className="flex-1 overflow-y-auto p-6 text-sm text-slate-600 leading-relaxed space-y-6">
                  <p>NutriMap（以下简称“我们”）非常重视您的隐私。本政策旨在说明我们如何收集、使用和保护您的个人信息。</p>
                  
                  <section>
                     <h4 className="font-bold text-slate-800 mb-2">1. 我们收集的信息</h4>
                     <ul className="list-disc pl-4 space-y-1">
                        <li><strong>身体数据：</strong>如性别、年龄、身高、体重、活动水平。这些数据仅用于计算您的 BMR 和 TDEE，存储于本地或加密服务器，绝不用于其他用途。</li>
                        <li><strong>多媒体信息：</strong>当您使用拍照识别功能时，我们需要访问您的相机或相册。上传的图片仅用于 AI 分析，分析完成后不会被永久用于训练。</li>
                        <li><strong>位置信息：</strong>当您查找附近商家或注册店铺时，我们会请求地理位置权限。</li>
                     </ul>
                  </section>
                  
                  <section>
                     <h4 className="font-bold text-slate-800 mb-2">2. 信息的使用</h4>
                     <p>我们收集的信息仅用于为您提供个性化的健康服务、优化 APP 功能体验以及保障账户安全。</p>
                  </section>

                  <section>
                     <h4 className="font-bold text-slate-800 mb-2">3. 信息共享</h4>
                     <p>除非获得您的明确授权或法律法规要求，我们不会向任何第三方公司、组织或个人共享您的个人隐私信息。</p>
                  </section>

                  <section>
                     <h4 className="font-bold text-slate-800 mb-2">4. 您的权利</h4>
                     <p>您有权随时在“我的”页面查阅、修改或删除您的个人资料。如果您希望注销账号，请通过“关于APP-联系客服”进行操作。</p>
                  </section>
               </div>
               <div className="p-4 border-t border-slate-100 bg-white">
                  <button onClick={closeModal} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold">我已了解</button>
               </div>
            </div>
         </div>
      )}

      {/* About Modal */}
      {activeModal === 'ABOUT' && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-fade-in">
            <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center animate-fade-in-up relative">
               <button onClick={closeModal} className="absolute top-4 right-4 text-slate-300 hover:text-slate-500">
                  <X size={24} />
               </button>
               <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Flame size={32} />
               </div>
               <h3 className="text-xl font-bold text-slate-800">NutriMap</h3>
               <p className="text-xs text-slate-400 font-mono mb-6">Version 1.0.2 Beta</p>
               <p className="text-slate-600 text-sm mb-6">
                  NutriMap 是一款基于 GenAI 技术的智能营养健康助手。我们希望通过科技的力量，让健康的饮食方式变得简单、有趣且触手可及。
               </p>
               <div className="text-xs text-slate-300">
                  Designed & Developed with ❤️
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default Profile;
