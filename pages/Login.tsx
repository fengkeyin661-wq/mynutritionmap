import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserProfile, Gender, ActivityLevel } from '../types';
import { 
  ChevronRight, ArrowLeft, CheckCircle, 
  Lock, Mail, Loader2, Leaf, User
} from 'lucide-react';

type ViewState = 'LANDING' | 'LOGIN' | 'REGISTER';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { showToast } = useToast();

  const [view, setView] = useState<ViewState>('LANDING');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Register Form - All in one or simplified steps
  const [regStep, setRegStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<Gender>('MALE');
  const [age, setAge] = useState<string>('25');
  const [height, setHeight] = useState<string>('170');
  const [weight, setWeight] = useState<string>('65');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('MODERATE');

  const handleLogin = async () => {
    if (!loginEmail || !loginPass) {
      showToast('请输入邮箱和密码', 'error');
      return;
    }
    setIsSubmitting(true);
    const success = await login(loginEmail, loginPass);
    setIsSubmitting(false);
    
    if (success) {
      showToast('登录成功', 'success');
      navigate('/');
    }
  };

  const handleRegister = async () => {
    if (!nickname.trim()) { showToast('请填写昵称', 'error'); return; }
    if (!email || !password) { showToast('请填写邮箱和密码', 'error'); return; }
    
    setIsSubmitting(true);
    const profile: UserProfile = {
      nickname,
      avatarUrl: '', // No avatar needed
      gender,
      age: parseInt(age) || 25,
      height: parseInt(height) || 170,
      weight: parseInt(weight) || 65,
      activityLevel,
      bmr: 0, tdee: 0, bmi: 0 // Will be calc in backend/context
    };

    const success = await register(email, password, profile);
    setIsSubmitting(false);

    if (success) {
      showToast('注册成功！', 'success');
      navigate('/profile');
    }
  };

  // --- Views ---

  if (view === 'LANDING') {
    return (
      <div className="h-full flex flex-col bg-slate-50 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-[55%] bg-gradient-to-br from-emerald-600 to-teal-500 rounded-b-[3rem] shadow-2xl flex items-center justify-center overflow-hidden">
           <div className="absolute w-80 h-80 bg-white/10 rounded-full blur-3xl -top-20 -left-20 animate-pulse"></div>
           <div className="absolute w-64 h-64 bg-teal-300/20 rounded-full blur-2xl bottom-10 right-0"></div>
           
           <div className="text-center z-10 text-white animate-fade-in flex flex-col items-center">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-6 border border-white/30 shadow-lg">
                 <Leaf size={48} className="text-white drop-shadow-md" />
              </div>
              <h1 className="text-4xl font-black tracking-tight mb-2 text-white drop-shadow-sm">NutriMap</h1>
              <p className="text-emerald-50 text-lg font-medium tracking-wide">您的智能营养管家</p>
           </div>
        </div>

        <div className="flex-1 flex flex-col justify-end p-8 pb-safe z-10 animate-fade-in-up">
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

  if (view === 'LOGIN') {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="px-6 pt-safe">
          <button onClick={() => setView('LANDING')} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 mb-8 mt-4 hover:bg-slate-100">
            <ArrowLeft size={20} />
          </button>

          <h2 className="text-3xl font-black text-slate-800 mb-2">欢迎回来</h2>
          <p className="text-slate-400 text-sm mb-8">登录您的 NutriMap 账号</p>

          <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">邮箱账号</label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-4 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                    <Mail size={20} className="text-slate-400 mr-3" />
                    <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="name@example.com" className="bg-transparent outline-none flex-1 font-bold text-slate-700 placeholder:font-normal" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">密码</label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-4 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                    <Lock size={20} className="text-slate-400 mr-3" />
                    <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="请输入密码" className="bg-transparent outline-none flex-1 font-bold text-slate-700 placeholder:font-normal" />
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
    );
  }

  // Register Wizard
  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="bg-white p-4 pt-safe sticky top-0 z-10 border-b border-slate-100 flex items-center justify-between">
         <button onClick={() => regStep === 1 ? setView('LANDING') : setRegStep(regStep - 1)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600"><ArrowLeft size={20} /></button>
         <div className="text-sm font-bold text-slate-800">步骤 {regStep} / 2</div>
         <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {regStep === 1 ? (
          <div className="animate-fade-in space-y-6">
             <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">创建账号</h2>
                <p className="text-slate-500 text-sm">基本信息</p>
             </div>

             <div className="space-y-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                 <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">昵称</label>
                    <div className="flex items-center gap-3 border-b border-slate-100 py-2">
                       <User size={18} className="text-slate-300"/>
                       <input value={nickname} onChange={(e) => setNickname(e.target.value)} className="flex-1 outline-none font-bold text-slate-800" placeholder="怎么称呼您" />
                    </div>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">邮箱</label>
                    <div className="flex items-center gap-3 border-b border-slate-100 py-2">
                       <Mail size={18} className="text-slate-300"/>
                       <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 outline-none font-bold text-slate-800" placeholder="name@example.com" />
                    </div>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">密码</label>
                    <div className="flex items-center gap-3 border-b border-slate-100 py-2">
                       <Lock size={18} className="text-slate-300"/>
                       <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="flex-1 outline-none font-bold text-slate-800" placeholder="设置密码 (6位以上)" />
                    </div>
                 </div>
             </div>
          </div>
        ) : (
          <div className="animate-fade-in space-y-6">
             <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">身体档案</h2>
                <p className="text-slate-500 text-sm">定制您的营养计划 (保密)</p>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setGender('MALE')} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${gender === 'MALE' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100 bg-white text-slate-400'}`}>
                   <span className="text-2xl">♂</span><span className="font-bold">男生</span>
                </button>
                <button onClick={() => setGender('FEMALE')} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${gender === 'FEMALE' ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-slate-100 bg-white text-slate-400'}`}>
                   <span className="text-2xl">♀</span><span className="font-bold">女生</span>
                </button>
             </div>

             <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
                <div className="flex justify-between items-center"><span className="font-bold text-slate-700">年龄</span><div className="flex items-center gap-2"><input type="number" value={age} onChange={e => setAge(e.target.value)} className="w-16 text-right font-bold text-xl outline-none border-b border-slate-200 focus:border-emerald-500" /><span className="text-sm text-slate-400">岁</span></div></div>
                <div className="flex justify-between items-center"><span className="font-bold text-slate-700">身高</span><div className="flex items-center gap-2"><input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-16 text-right font-bold text-xl outline-none border-b border-slate-200 focus:border-emerald-500" /><span className="text-sm text-slate-400">cm</span></div></div>
                <div className="flex justify-between items-center"><span className="font-bold text-slate-700">体重</span><div className="flex items-center gap-2"><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-16 text-right font-bold text-xl outline-none border-b border-slate-200 focus:border-emerald-500" /><span className="text-sm text-slate-400">kg</span></div></div>
             </div>

             <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-2 mb-2 block">活动量</label>
                <select value={activityLevel} onChange={e => setActivityLevel(e.target.value as ActivityLevel)} className="w-full p-4 bg-white rounded-2xl border border-slate-200 font-bold text-slate-700 outline-none">
                   <option value="SEDENTARY">久坐不动 (办公室)</option>
                   <option value="LIGHT">轻度活动 (每周1-3次)</option>
                   <option value="MODERATE">中度活动 (每周3-5次)</option>
                   <option value="ACTIVE">高度活动 (每周6-7次)</option>
                   <option value="VERY_ACTIVE">极度活动 (体力劳动)</option>
                </select>
             </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-50 pb-safe">
         <button 
           onClick={() => regStep === 1 ? setRegStep(2) : handleRegister()} 
           disabled={isSubmitting} 
           className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
         >
            {isSubmitting ? <Loader2 className="animate-spin" /> : (regStep === 2 ? '完成注册' : '下一步')}
         </button>
      </div>
    </div>
  );
};

export default Login;