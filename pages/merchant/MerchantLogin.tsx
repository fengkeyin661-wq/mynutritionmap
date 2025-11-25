import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { supabase } from '../../lib/supabase';
import { 
  Store, ArrowLeft, CheckCircle, Phone, Clock, 
  MapPin, FileText, Camera, Image as ImageIcon, Loader2, Mail, Lock
} from 'lucide-react';

const MerchantLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Auth Fields ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- Merchant Data ---
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('');
  const [hours, setHours] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  
  // Images
  const [businessLicense, setBusinessLicense] = useState<string>('');
  const [foodPermit, setFoodPermit] = useState<string>('');
  const [storefrontImg, setStorefrontImg] = useState<string>('');
  const [environmentImg, setEnvironmentImg] = useState<string>('');

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('请输入邮箱和密码', 'error');
      return;
    }
    setIsSubmitting(true);
    const success = await login(email, password);
    setIsSubmitting(false);

    if (success) {
      // 检查是否是商家角色
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
    if (!email || !password) { showToast('请设置登录邮箱和密码', 'error'); return; }
    if (!shopName.trim()) { showToast('请输入店铺名称', 'error'); return; }
    if (!phone.trim()) { showToast('请输入联系电话', 'error'); return; }

    setIsSubmitting(true);

    try {
      // 1. Sign Up User
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) throw authError;

      if (authData.user) {
         // 2. Create Profile as MERCHANT
         const { error: profileError } = await supabase.from('profiles').insert({
            id: authData.user.id,
            nickname: shopName, // Use shop name as nickname initially
            role: 'MERCHANT'
         });
         
         if (profileError) throw profileError;

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
            images: {
              license: businessLicense, // Note: In real app, upload these to Storage and get URL first
              permit: foodPermit,
              storefront: storefrontImg,
              environment: environmentImg
            }
         });

         if (merchantError) throw merchantError;

         showToast('入驻申请已提交，等待审核', 'success');
         // Auto login logic will handle redirection via AuthContext listener or manual
         navigate('/merchant/dashboard');
      }

    } catch (e: any) {
      console.error(e);
      showToast(e.message || '注册失败', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) { showToast('不支持地理定位', 'error'); return; }
    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLoadingLocation(false);
        const l = position.coords.latitude.toFixed(4);
        const lg = position.coords.longitude.toFixed(4);
        setLat(l); setLng(lg);
        setAddress(`自动定位: ${l}, ${lg}`);
        showToast('定位成功', 'success');
      },
      (error) => {
        setIsLoadingLocation(false);
        showToast('定位失败', 'error');
      }
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      // Temporary base64 for demo. In real app, upload to Supabase Storage here.
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const UploadBox = ({ label, value, onChange }: any) => {
    const inputRef = useRef<HTMLInputElement>(null);
    return (
      <div onClick={() => inputRef.current?.click()} className={`relative h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden ${value ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
        {value ? <img src={value} className="w-full h-full object-cover opacity-80" /> : <div className="text-center p-2"><Camera size={18} className="mx-auto text-slate-400 mb-1"/><span className="text-[10px] text-slate-500 font-bold block">{label}</span></div>}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
        {value && <div className="absolute bottom-1 right-1 bg-emerald-500 text-white rounded-full p-0.5"><CheckCircle size={10} /></div>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 shadow-sm border-b border-slate-100 flex items-center justify-between">
        <button onClick={() => navigate('/merchants')} className="flex items-center text-slate-500 hover:text-emerald-700 -ml-2 p-2"><ArrowLeft size={20} className="mr-1"/><span className="text-sm font-bold">返回</span></button>
        <h1 className="font-bold text-slate-800 text-sm">{isRegistering ? '商家入驻' : '商家登录'}</h1>
        <div className="w-12"></div>
      </div>

      <div className="px-4 py-6">
        <div className="max-w-sm mx-auto">
          {!isRegistering ? (
            <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 mt-4 animate-fade-in-up">
               <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-white mb-5 mx-auto shadow-lg shadow-slate-300"><Store size={28} /></div>
               <h2 className="text-xl font-bold text-slate-800 text-center mb-6">商家后台登录</h2>
               <div className="space-y-4">
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-4"><Mail size={20} className="text-slate-400 mr-3" /><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="登录邮箱" className="bg-transparent outline-none flex-1 font-bold text-slate-700" /></div>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-4"><Lock size={20} className="text-slate-400 mr-3" /><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="密码" className="bg-transparent outline-none flex-1 font-bold text-slate-700" /></div>
                  
                  <button onClick={handleLogin} disabled={isSubmitting} className="w-full py-3.5 bg-slate-800 text-white rounded-xl font-bold shadow-lg shadow-slate-200 active:scale-95 transition-transform">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : '安全登录'}
                  </button>
                  <div className="text-center pt-4 border-t border-slate-100 mt-2">
                     <p className="text-xs text-slate-400 mb-2">还不是认证商家？</p>
                     <button onClick={() => setIsRegistering(true)} className="text-sm text-emerald-600 font-bold hover:underline">立即申请入驻</button>
                  </div>
               </div>
            </div>
          ) : (
            <div className="space-y-5 animate-fade-in">
               <div className="text-center mb-2"><h2 className="text-xl font-bold text-slate-800">填写店铺资料</h2></div>
               
               <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-2">账号信息</h3>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="登录邮箱" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="设置密码" />
               </div>

               <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-2">基本信息</h3>
                  <input type="text" value={shopName} onChange={e => setShopName(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" placeholder="店铺名称" />
                  <div className="grid grid-cols-2 gap-3">
                     <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="联系电话" />
                     <input type="text" value={hours} onChange={e => setHours(e.target.value)} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="营业时间" />
                  </div>
               </div>

               <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-2">位置与资质</h3>
                  <div className="flex gap-2"><input type="text" value={address} onChange={e => setAddress(e.target.value)} className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="地址" /><button onClick={handleGetLocation} className="bg-emerald-50 text-emerald-600 px-2 rounded-xl text-[10px] w-16 flex flex-col items-center justify-center">{isLoadingLocation ? <Loader2 className="animate-spin" /> : <MapPin />} 定位</button></div>
                  <div className="grid grid-cols-2 gap-3"><UploadBox label="营业执照" value={businessLicense} onChange={(e: any) => handleImageUpload(e, setBusinessLicense)} /><UploadBox label="门头照片" value={storefrontImg} onChange={(e: any) => handleImageUpload(e, setStorefrontImg)} /></div>
               </div>

               <div className="pt-2">
                 <button onClick={handleRegister} disabled={isSubmitting} className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 active:scale-95 transition-transform text-base">{isSubmitting ? <Loader2 className="animate-spin" /> : '提交审核'}</button>
                 <button onClick={() => setIsRegistering(false)} className="w-full mt-3 text-xs text-slate-400 font-bold hover:text-slate-600 py-2">取消申请</button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MerchantLogin;
