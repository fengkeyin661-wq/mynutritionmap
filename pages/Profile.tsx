
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDailyLog } from '../context/DailyLogContext';
import { 
  User, Settings, ChevronRight, LogOut, Heart, ShoppingBag, 
  QrCode, MessageSquare, Info, BookOpen, Camera, Edit2, X, Flame, Trash2,
  Shield, FileText, Lock
} from 'lucide-react';
import { useNavigate, Link, Navigate } from 'react-router-dom';

type ModalType = 'NONE' | 'QR' | 'LOGS' | 'AGREEMENT' | 'PRIVACY' | 'ABOUT';

const Profile: React.FC = () => {
  const { role, userProfile, loginAs, logout, favoriteRecipes, favoriteProducts } = useAuth();
  const { logs, removeLog } = useDailyLog();
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
    if (logs.length === 0) {
      navigate('/'); // 没有记录，跳转首页
    } else {
      setActiveModal('LOGS');
    }
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
                    {logs.length > 0 ? `已记录 ${logs.length} 餐` : '今天还没吃'}
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
         <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
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

      {/* Food Logs Modal */}
      {activeModal === 'LOGS' && (
         <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-md h-[80vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col animate-slide-up shadow-2xl">
               <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                  <h3 className="text-xl font-bold text-slate-800">今日饮食记录</h3>
                  <button onClick={closeModal} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
                     <X size={20} />
                  </button>
               </div>
               <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                  <div className="space-y-3">
                    {logs.map((log) => (
                       <div key={log.id} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-50 flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 relative">
                             {log.imageUrl ? <img src={log.imageUrl} alt={log.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><Flame size={16} /></div>}
                          </div>
                          <div className="flex-1 min-w-0">
                             <h4 className="font-bold text-slate-700 text-sm truncate">{log.name}</h4>
                             <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1.5">
                                <span className="font-bold text-slate-600">{log.calories} kcal</span>
                                <span className="w-px h-2 bg-slate-200"></span>
                                <span>P:{log.protein}g C:{log.carbs}g F:{log.fat}g</span>
                             </div>
                          </div>
                          <button onClick={() => removeLog(log.id)} className="p-1.5 text-slate-300 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-lg"><Trash2 size={12} /></button>
                       </div>
                    ))}
                  </div>
                  {logs.length === 0 && (
                     <div className="text-center py-10 text-slate-400">
                        <p>记录已清空</p>
                        <button onClick={() => navigate('/')} className="text-emerald-600 text-sm font-bold mt-2">去首页添加</button>
                     </div>
                  )}
               </div>
            </div>
         </div>
      )}

      {/* User Agreement Modal */}
      {activeModal === 'AGREEMENT' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-up">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText size={20} className="text-emerald-600" /> 用户服务协议
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20}/></button>
            </div>
            <div className="p-6 overflow-y-auto text-sm text-slate-600 leading-relaxed space-y-4">
              <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-xs font-bold mb-2">
                重要提示：NutriMap 提供的所有营养分析与建议仅供参考，不构成医疗诊断或治疗建议。
              </div>
              <p>欢迎您使用 NutriMap！请您仔细阅读以下条款：</p>
              
              <h4 className="font-bold text-slate-800">1. 服务内容</h4>
              <p>NutriMap 是一款利用人工智能技术提供食物识别、营养分析及饮食管理的工具。我们致力于提供准确的数据，但不对AI分析结果的绝对准确性负责。</p>
              
              <h4 className="font-bold text-slate-800">2. 用户行为规范</h4>
              <p>您在使用社区功能（发布食谱、评论）时，不得发布违法、色情、暴力或侵犯他人知识产权的内容。我们保留删除违规内容及封禁账号的权利。</p>
              
              <h4 className="font-bold text-slate-800">3. 免责声明</h4>
              <p>本应用提供的健康建议基于一般人群标准。孕妇、慢性病患者或有特殊饮食需求的用户，请遵循专业医生或注册营养师的指导。</p>
              
              <h4 className="font-bold text-slate-800">4. 知识产权</h4>
              <p>应用内的设计、代码、算法及官方内容归 NutriMap 所有。用户发布的原创食谱版权归用户所有，但授权 NutriMap 在平台内展示及推广。</p>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <button onClick={closeModal} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl">我已阅读并同意</button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {activeModal === 'PRIVACY' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-up">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Shield size={20} className="text-emerald-600" /> 隐私保护政策
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20}/></button>
            </div>
            <div className="p-6 overflow-y-auto text-sm text-slate-600 leading-relaxed space-y-4">
              <p>NutriMap 非常重视您的隐私。本政策旨在说明我们如何收集、使用和保护您的个人信息。</p>
              
              <h4 className="font-bold text-slate-800">1. 我们收集的信息</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>健康数据：</strong>身高、体重、年龄、性别、活动水平（用于计算基础代谢率）。</li>
                <li><strong>多媒体信息：</strong>您上传的食物照片（用于AI识别）。</li>
                <li><strong>位置信息：</strong>（仅限商家或查找附近服务时）用于定位店铺距离。</li>
              </ul>
              
              <h4 className="font-bold text-slate-800">2. 信息使用方式</h4>
              <p>您的身体数据仅用于生成个性化的每日热量目标。上传的照片会发送至 AI 服务器进行分析，分析完成后即刻删除，不会用于其他用途。</p>
              
              <h4 className="font-bold text-slate-800">3. 信息安全</h4>
              <p>我们采用行业标准的加密技术（SSL/TLS）传输您的数据。未经您的授权，我们不会将您的个人敏感信息共享给第三方。</p>
              
              <h4 className="font-bold text-slate-800">4. 您的权利</h4>
              <p>您可以在“我的”页面随时修改您的身体档案，或联系客服申请注销账号及删除所有历史数据。</p>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <button onClick={closeModal} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl">我已了解</button>
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      {activeModal === 'ABOUT' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center animate-slide-up relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-slate-300 hover:text-slate-500"><X size={24}/></button>
            <div className="w-20 h-20 bg-emerald-100 rounded-3xl mx-auto flex items-center justify-center text-emerald-600 mb-4">
               <Flame size={40} fill="currentColor" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">NutriMap</h2>
            <p className="text-sm text-slate-400 font-medium mb-6">版本 v1.0.2 (Beta)</p>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              NutriMap 是您的全天候智能营养助手，结合 DeepSeek AI 技术，帮助您轻松管理饮食，发现健康美食。
            </p>
            <div className="text-xs text-slate-400">
               © 2024 NutriMap Health Inc. <br/> All Rights Reserved.
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
