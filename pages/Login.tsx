
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserProfile, Gender, ActivityLevel } from '../types';
import { 
  Camera, ChevronRight, ArrowLeft, CheckCircle, 
  User, Lock, Mail, Loader2, Leaf
} from 'lucide-react';

type ViewState = 'LANDING' | 'LOGIN' | 'REGISTER';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // View Control
  const [view, setView] = useState<ViewState>('LANDING');
  const [regStep, setRegStep] = useState(1);
  const totalSteps = 3;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [avatar, setAvatar] = useState<string>('');
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<Gender>('MALE');
  const [age, setAge] = useState<string>('25');
  const [height, setHeight] = useState<string>('170');
  const [weight, setWeight] = useState<string>('65');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('MODERATE');

  // --- Handlers ---

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('请输入邮箱和密码', 'error');
      return;
    }
    setIsSubmitting(true);
    const success = await login(email, password);
    setIsSubmitting(false);
    
    if (success) {
      showToast('登录成功', 'success');
      navigate('/');
    }
  };

  const handleRegisterFinish = async () => {
    if (!email || !password) {
      showToast('请填写登录邮箱和密码', 'error');
      return; 
    }
    if (!nickname.trim()) {
      showToast('请填写昵称', 'error');
      setRegStep(1);
      return;
    }

    setIsSubmitting(true);
    const profile: UserProfile = {
      nickname,
      avatarUrl: avatar,
      gender,
      age: parseInt(age) || 25,
      height: parseInt(height) || 170,
      weight: parseInt(weight) || 65,
      activityLevel,
      bmr: 0, tdee: 0, bmi: 0
    };

    const success = await register(email, password, profile);
    setIsSubmitting(false);

    if (success) {
      showToast('注册成功！欢迎加入', 'success');
      // 跳转到个人中心
      navigate('/profile');
    }
  };

  const nextStep = () => {
    if (regStep === 1) {
      if (!nickname.trim()) { showToast('请给自己起个好听的名字', 'error'); return; }
      if (!email.includes('@') || password.length < 6) { showToast('请输入有效的邮箱和至少6位密码', 'error'); return; }
    }
    if (regStep < totalSteps) {
      setRegStep(regStep + 1);
    } else {
      handleRegisterFinish();
    }
  };

  const prevStep = () => {
    if (regStep > 1) {
      setRegStep(regStep - 1);
    } else {
      setView('LANDING');
    }
  };

  // 1. Landing View
  if (view === 'LANDING') {
    return (
      <div className="fixed inset-0 z-[200] h-[100dvh] bg-slate-50 flex flex-col items-center justify-end overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[60vh] bg-emerald-600 rounded-b-[3rem] shadow-xl z-0 flex items-center justify-center overflow-hidden">
           <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -top-20 -left-20"></div>
           <div className="absolute w-80 h-80 bg-emerald-400/20 rounded-full blur-2xl bottom-0 right-0"></div>
           <div className="text-center z-10 text-white animate-fade-in-down">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/30 shadow-lg">
                 <Leaf size={48} className="text-white" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">NutriMap</h1>
              <p className="text-emerald-100 text-lg font-medium">您的智能营养管家</p>
           </div>
        </div>

        <div className="w-full max-w-md p-8 z-10 animate-fade-in-up mb-8 pb-safe">
           <div className="space-y-4">
              <button onClick={() => setView('REGISTER')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-slate-200 active:scale-95 transition-transform flex items-center justify-center gap-2">
                开启健康之旅 <ChevronRight size={20} />
              </button>
              <button onClick={() => setView('LOGIN')} className="w-full py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 active:scale-95 transition-all">
                已有账号登录
              </button>
           </div>
           <p className="text-center text-slate-400 text-xs mt-8">
              登录即代表您同意 <span className="text-slate-600 underline">用户协议</span> 和 <span className="text-slate-600 underline">隐私政策</span>
           </p>
        </div>
      </div>
    );
  }

  // 2. Login View
  if (view === 'LOGIN') {
    return (
      <div className="fixed inset-0 z-[200] h-[100dvh] bg-white flex flex-col">
        <div className="p-6">
          <button onClick={() => setView('LANDING')} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 mb-8 hover:bg-slate-100">
            <ArrowLeft size={20} />
          </button>

          <div className="flex-1">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">账号登录</h2>
            <p className="text-slate-400 text-sm mb-10">欢迎回到 NutriMap</p>

            <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">邮箱账号</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-4 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                      <Mail size={20} className="text-slate-400 mr-3" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" className="bg-transparent outline-none flex-1 font-bold text-slate-700 placeholder:font-normal" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">密码</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-4 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                      <Lock size={20} className="text-slate-400 mr-3" />
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="请输入密码" className="bg-transparent outline-none flex-1 font-bold text-slate-700 placeholder:font-normal" />
                  </div>
                </div>
            </div>

            <button 
                onClick={handleLogin}
                disabled={isSubmitting}
                className="w-full mt-10 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-200 active:scale-95 transition-transform flex justify-center items-center gap-2"
            >
                {isSubmitting ? <Loader2 className="animate-spin" /> : '登录'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Register Wizard
  return (
    <div className="fixed inset-0 z-[200] h-[100dvh] bg-slate-50 flex flex-col">
      <div className="bg-white p-4 pt-6 sticky top-0 z-10 shadow-sm shrink-0">
         <div className="flex items-center justify-between mb-4">
            <button onClick={prevStep} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100"><ArrowLeft size={20} /></button>
            <div className="text-sm font-bold text-slate-800">步骤 {regStep} / {totalSteps}</div>
            <div className="w-10"></div>
         </div>
         <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-500 ease-out" style={{ width: `${(regStep / totalSteps) * 100}%` }}></div>
         </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {/* STEP 1: ACCOUNT & IDENTITY */}
        {regStep === 1 && (
          <div className="animate-fade-in space-y-6">
             <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">建立账号</h2>
                <p className="text-slate-500 text-sm">请提供登录信息和您的昵称</p>
             </div>

             <div className="flex flex-col items-center">
                <div onClick={() => fileInputRef.current?.click()} className="relative w-24 h-24 rounded-full bg-white border-4 border-emerald-50 shadow-lg flex items-center justify-center cursor-pointer group mb-6">
                  {avatar ? <img src={avatar} className="w-full h-full object-cover rounded-full" /> : <User size={32} className="text-slate-300" />}
                  <div className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1.5 rounded-full"><Camera size={14} /></div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
             </div>

             <div className="space-y-4">
                 <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">昵称</label>
                    <input value={nickname} onChange={(e) => setNickname(e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold" placeholder="您的称呼" />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">邮箱</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold" placeholder="name@example.com" />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">密码</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold" placeholder="设置登录密码" />
                 </div>
             </div>
          </div>
        )}

        {/* STEP 2: BODY STATS */}
        {regStep === 2 && (
          <div className="animate-fade-in space-y-6">
             <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">身体数据</h2>
                <p className="text-slate-500 text-sm">用于精准计算代谢率 (隐私加密存储)</p>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setGender('MALE')} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${gender === 'MALE' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100 bg-white text-slate-400'}`}>
                   <span className="text-2xl">♂</span><span className="font-bold">我是男生</span>
                </button>
                <button onClick={() => setGender('FEMALE')} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${gender === 'FEMALE' ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-slate-100 bg-white text-slate-400'}`}>
                   <span className="text-2xl">♀</span><span className="font-bold">我是女生</span>
                </button>
             </div>
             <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
                <div className="flex justify-between items-center"><span className="font-bold text-slate-700">年龄</span><div className="flex items-center gap-2"><input type="number" value={age} onChange={e => setAge(e.target.value)} className="w-16 text-right font-bold text-xl outline-none" /><span className="text-sm text-slate-400">岁</span></div></div>
                <div className="flex justify-between items-center"><span className="font-bold text-slate-700">身高</span><div className="flex items-center gap-2"><input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-16 text-right font-bold text-xl outline-none" /><span className="text-sm text-slate-400">cm</span></div></div>
                <div className="flex justify-between items-center"><span className="font-bold text-slate-700">体重</span><div className="flex items-center gap-2"><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-16 text-right font-bold text-xl outline-none" /><span className="text-sm text-slate-400">kg</span></div></div>
             </div>
          </div>
        )}

        {/* STEP 3: ACTIVITY */}
        {regStep === 3 && (
          <div className="animate-fade-in space-y-4">
             <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">日常活动量</h2>
                <p className="text-slate-500 text-sm">选择最符合您状态的选项</p>
             </div>
             <div className="space-y-3">
                {[{ val: 'SEDENTARY', label: '久坐不动', desc: '办公室工作，几乎不运动' },{ val: 'LIGHT', label: '轻度活动', desc: '每周运动 1-3 天' },{ val: 'MODERATE', label: '中度活动', desc: '每周运动 3-5 天' },{ val: 'ACTIVE', label: '高度活动', desc: '每周运动 6-7 天' },{ val: 'VERY_ACTIVE', label: '极度活动', desc: '体力劳动或专业训练' }].map((option) => (
                  <button key={option.val} onClick={() => setActivityLevel(option.val as ActivityLevel)} className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${activityLevel === option.val ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-white'}`}>
                    <div className="flex justify-between items-center"><div><div className={`font-bold ${activityLevel === option.val ? 'text-emerald-700' : 'text-slate-700'}`}>{option.label}</div><div className="text-xs text-slate-400 mt-1">{option.desc}</div></div>{activityLevel === option.val && <CheckCircle size={20} className="text-emerald-500" />}</div>
                  </button>
                ))}
             </div>
          </div>
        )}
      </div>

      {/* Footer Button - Fixed outside scroll area */}
      <div className="p-4 bg-white border-t border-slate-50 z-20 pb-safe shrink-0">
         <button onClick={nextStep} disabled={isSubmitting} className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 className="animate-spin" /> : (regStep === totalSteps ? '完成注册' : '下一步')}
         </button>
      </div>
    </div>
  );
};

export default Login;
