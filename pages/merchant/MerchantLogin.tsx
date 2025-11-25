import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { supabase } from '../../lib/supabase';
import { 
  Store, ArrowLeft,
  MapPin, Loader2, Mail, Lock, Building2
} from 'lucide-react';

const MerchantLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [isRegistering, setIsRegistering] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('');
  const [hours, setHours] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('0');
  const [lng, setLng] = useState('0');

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('请输入邮箱和密码', 'error');
      return;
    }
    setIsSubmitting(true);
    const success = await login(email, password);
    setIsSubmitting(false);

    if (success) {
      // 检查角色
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role === 'MERCHANT') {
          showToast('商家登录成功', 'success');
          navigate('/merchant/dashboard');
        } else {
          showToast('该账号不是商家账号', 'error');
          supabase.auth.signOut();
        }
      }
    }
  };

  const handleRegister = async () => {
    if (!email || !password) { showToast('请设置邮箱和密码', 'error'); return; }
    if (!shopName.trim()) { showToast('请填写店铺名称', 'error'); return; }
    
    setIsSubmitting(true);

    try {
      // 1. Sign Up User (传递 Role Metadata)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nickname: shopName,
            role: 'MERCHANT'
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
         // 2. Upsert Profile (防 Race Condition)
         const { error: profileError } = await supabase.from('profiles').upsert({
            id: authData.user.id,
            nickname: shopName,
            role: 'MERCHANT'
         });
         
         if (profileError) console.warn("Profile upsert warning:", profileError);

         // 3. Create Merchant Record
         const { error: merchantError } = await supabase.from('merchants').insert({
            owner_id: authData.user.id,
            name: shopName,
            phone,
            hours,
            address,
            location_lat: lat,
            location_lng: lng,
            status: 'PENDING',
            images: { license: '', storefront: '' } // No images required initially
         });

         if (merchantError) throw merchantError;

         showToast('入驻申请提交成功！', 'success');
         if (authData.session) {
            navigate('/merchant/dashboard');
         } else {
            showToast('请查收验证邮件', 'info');
            setIsRegistering(false);
         }
      }

    } catch (e: any) {
      showToast(e.message || '注册失败', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) { showToast('不支持定位', 'error'); return; }
    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setAddress(`已定位: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        setIsLoadingLocation(false);
        showToast('定位成功', 'success');
      },
      () => {
        setIsLoadingLocation(false);
        showToast('定位失败，请手动填写', 'error');
      }
    );
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="bg-white p-4 pt-safe sticky top-0 z-10 border-b border-slate-100 flex items-center justify-between">
        <button onClick={() => navigate('/merchants')} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600"><ArrowLeft size={20}/></button>
        <h1 className="font-bold text-slate-800">{isRegistering ? '商家入驻' : '商家登录'}</h1>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {!isRegistering ? (
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 mt-4 animate-fade-in-up">
             <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-white mb-6 mx-auto shadow-xl shadow-slate-200">
                <Store size={32} />
             </div>
             
             <div className="space-y-4">
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-4">
                   <Mail size={20} className="text-slate-400 mr-3" />
                   <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="登录邮箱" className="bg-transparent outline-none flex-1 font-bold text-slate-700" />
                </div>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-4">
                   <Lock size={20} className="text-slate-400 mr-3" />
                   <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="密码" className="bg-transparent outline-none flex-1 font-bold text-slate-700" />
                </div>
                
                <button onClick={handleLogin} disabled={isSubmitting} className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold shadow-lg shadow-slate-200 active:scale-95 transition-transform">
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : '进入后台'}
                </button>

                <div className="text-center pt-4 border-t border-slate-100 mt-2">
                   <button onClick={() => setIsRegistering(true)} className="text-sm text-emerald-600 font-bold hover:underline">我是新商家，立即入驻</button>
                </div>
             </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
             <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center gap-2 mb-2 border-b border-slate-50 pb-2">
                   <Building2 size={18} className="text-emerald-600" />
                   <span className="font-bold text-slate-800">店铺资料</span>
                </div>
                <input value={shopName} onChange={e => setShopName(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-700" placeholder="店铺名称" />
                <div className="grid grid-cols-2 gap-3">
                   <input value={phone} onChange={e => setPhone(e.target.value)} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm" placeholder="联系电话" />
                   <input value={hours} onChange={e => setHours(e.target.value)} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm" placeholder="营业时间" />
                </div>
                <div className="flex gap-2">
                   <input value={address} onChange={e => setAddress(e.target.value)} className="flex-1 p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm" placeholder="店铺地址" />
                   <button onClick={getLocation} disabled={isLoadingLocation} className="bg-emerald-50 text-emerald-600 px-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center min-w-[60px]">
                      {isLoadingLocation ? <Loader2 size={16} className="animate-spin" /> : <><MapPin size={16} /> 定位</>}
                   </button>
                </div>
             </div>

             <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center gap-2 mb-2 border-b border-slate-50 pb-2">
                   <Lock size={18} className="text-slate-400" />
                   <span className="font-bold text-slate-800">后台账号</span>
                </div>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm" placeholder="登录邮箱" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm" placeholder="设置密码" />
             </div>

             <button onClick={handleRegister} disabled={isSubmitting} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 active:scale-95 transition-transform">
               {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : '提交入驻申请'}
             </button>
             <button onClick={() => setIsRegistering(false)} className="w-full text-center text-slate-400 text-sm font-bold">返回登录</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MerchantLogin;