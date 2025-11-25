
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Store, ArrowLeft, CheckCircle, Building2, Phone, Clock, 
  MapPin, FileText, Camera, Image as ImageIcon, Loader2 
} from 'lucide-react';

const MerchantLogin: React.FC = () => {
  const navigate = useNavigate();
  const { loginAs } = useAuth();
  const { showToast } = useToast();

  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // --- Form States ---
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('');
  const [hours, setHours] = useState('');
  const [address, setAddress] = useState('');
  
  // Images
  const [businessLicense, setBusinessLicense] = useState<string>('');
  const [foodPermit, setFoodPermit] = useState<string>('');
  const [storefrontImg, setStorefrontImg] = useState<string>('');
  const [environmentImg, setEnvironmentImg] = useState<string>('');

  const handleLogin = () => {
    // Demo login logic
    loginAs('MERCHANT', 'm1', '轻食主义工坊');
    showToast('欢迎回来，店长！', 'success');
    navigate('/merchant/dashboard');
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      showToast('您的浏览器不支持地理定位', 'error');
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLoadingLocation(false);
        // In a real app, use Reverse Geocoding API here to get street address
        // For demo, we simulate a readable address based on coords
        const lat = position.coords.latitude.toFixed(4);
        const lng = position.coords.longitude.toFixed(4);
        setAddress(`定位地址: 经度${lng}, 纬度${lat} (请补充详细门牌号)`);
        showToast('定位成功', 'success');
      },
      (error) => {
        setIsLoadingLocation(false);
        console.error(error);
        showToast('获取定位失败，请手动填写', 'error');
      }
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = () => {
    // Validation
    if (!shopName.trim()) { showToast('请输入店铺名称', 'error'); return; }
    if (!phone.trim()) { showToast('请输入联系电话', 'error'); return; }
    if (!address.trim()) { showToast('请完善店铺地址', 'error'); return; }
    if (!businessLicense) { showToast('请上传营业执照', 'error'); return; }
    if (!foodPermit) { showToast('请上传食品经营许可证', 'error'); return; }

    // Demo registration - creates a random ID
    const newId = 'm_' + Date.now();
    
    // In a real app, send all this data to backend
    console.log({ shopName, phone, hours, address, businessLicense, foodPermit, storefrontImg, environmentImg });

    // 注册时保存店铺名称
    loginAs('MERCHANT', newId, shopName);
    showToast('申请提交成功！资质审核中...', 'success');
    
    // Slight delay to simulate processing
    setTimeout(() => {
        navigate('/merchant/dashboard');
    }, 1000);
  };

  // Helper Component for Image Upload Box
  const UploadBox = ({ label, value, onChange }: { label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    return (
      <div 
        onClick={() => inputRef.current?.click()}
        className={`relative h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden ${value ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
      >
        {value ? (
           <img src={value} alt={label} className="w-full h-full object-cover opacity-80" />
        ) : (
           <div className="text-center p-2">
             <Camera size={20} className="mx-auto text-slate-400 mb-1" />
             <span className="text-[10px] text-slate-500 font-bold block">{label}</span>
           </div>
        )}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
        {value && <div className="absolute bottom-1 right-1 bg-emerald-500 text-white rounded-full p-0.5"><CheckCircle size={12} /></div>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 bg-white shadow-sm z-20 sticky top-0 flex items-center justify-between">
        <button onClick={() => navigate('/merchants')} className="flex items-center text-slate-500 hover:text-emerald-700 transition-colors">
          <ArrowLeft size={20} className="mr-1" /> 返回
        </button>
        <h1 className="font-bold text-slate-800 text-sm">
           {isRegistering ? '商家入驻申请' : '商家登录'}
        </h1>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto pb-10 px-4 pt-6">
        <div className="max-w-md mx-auto">
            
          {!isRegistering ? (
            // --- LOGIN VIEW ---
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 mt-10">
               <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-white mb-6 mx-auto shadow-lg shadow-slate-300">
                  <Store size={32} />
               </div>
               <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">管理后台登录</h2>
               
               <div className="space-y-4">
                  {/* Mock Login Hint */}
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 text-sm flex items-start gap-3">
                      <CheckCircle size={18} className="shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">演示环境</p>
                        <p className="text-xs opacity-80 mt-1">点击下方按钮直接登录示例账号。</p>
                      </div>
                  </div>
                  
                  <button 
                    onClick={handleLogin}
                    className="w-full py-4 bg-slate-800 text-white rounded-xl font-bold shadow-lg shadow-slate-200 active:scale-95 transition-transform"
                  >
                    安全登录
                  </button>
                  <div className="text-center pt-4 border-t border-slate-100 mt-4">
                     <p className="text-xs text-slate-400 mb-2">还不是认证商家？</p>
                     <button onClick={() => setIsRegistering(true)} className="text-sm text-emerald-600 font-bold hover:underline">
                        立即申请入驻
                     </button>
                  </div>
               </div>
            </div>
          ) : (
            // --- REGISTER VIEW ---
            <div className="space-y-6">
               <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">填写店铺资料</h2>
                  <p className="text-slate-500 text-xs mt-1">请如实填写，审核将在 1-3 个工作日内完成</p>
               </div>

               {/* Section 1: Basic Info */}
               <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-2">
                     <Store size={16} className="text-emerald-500" /> 基本信息
                  </h3>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 ml-1">店铺名称</label>
                    <input 
                      type="text" 
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-sm font-bold"
                      placeholder="如: 绿源有机农场"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                     <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 ml-1 flex items-center gap-1"><Phone size={10} /> 联系电话</label>
                        <input 
                          type="tel" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-sm"
                          placeholder="手机或座机"
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 ml-1 flex items-center gap-1"><Clock size={10} /> 营业时间</label>
                        <input 
                          type="text" 
                          value={hours}
                          onChange={(e) => setHours(e.target.value)}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-sm"
                          placeholder="如: 09:00-22:00"
                        />
                     </div>
                  </div>
               </div>

               {/* Section 2: Location */}
               <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-2">
                     <MapPin size={16} className="text-emerald-500" /> 店铺地址
                  </h3>
                  <div className="flex gap-2">
                     <input 
                       type="text" 
                       value={address}
                       onChange={(e) => setAddress(e.target.value)}
                       className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-sm"
                       placeholder="点击右侧按钮获取定位"
                     />
                     <button 
                       onClick={handleGetLocation}
                       disabled={isLoadingLocation}
                       className="bg-emerald-50 text-emerald-600 px-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center border border-emerald-100 hover:bg-emerald-100 active:scale-95 transition-all w-20 shrink-0"
                     >
                       {isLoadingLocation ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
                       <span className="mt-1">{isLoadingLocation ? '定位中' : '获取定位'}</span>
                     </button>
                  </div>
               </div>

               {/* Section 3: Qualifications */}
               <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-2">
                     <FileText size={16} className="text-emerald-500" /> 资质认证
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                     <UploadBox 
                        label="营业执照" 
                        value={businessLicense} 
                        onChange={(e) => handleImageUpload(e, setBusinessLicense)} 
                     />
                     <UploadBox 
                        label="食品经营许可证" 
                        value={foodPermit} 
                        onChange={(e) => handleImageUpload(e, setFoodPermit)} 
                     />
                  </div>
                  <p className="text-[10px] text-slate-400">请确保上传的图片清晰可见，文字可识别。</p>
               </div>

               {/* Section 4: Environment */}
               <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-2">
                     <ImageIcon size={16} className="text-emerald-500" /> 店铺照片
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                     <UploadBox 
                        label="门头照片" 
                        value={storefrontImg} 
                        onChange={(e) => handleImageUpload(e, setStorefrontImg)} 
                     />
                     <UploadBox 
                        label="店内环境" 
                        value={environmentImg} 
                        onChange={(e) => handleImageUpload(e, setEnvironmentImg)} 
                     />
                  </div>
               </div>

               {/* Submit Button */}
               <div className="pt-2 pb-8">
                 <button 
                   onClick={handleRegister}
                   className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 active:scale-95 transition-transform text-lg"
                 >
                   提交审核
                 </button>
                 <button onClick={() => setIsRegistering(false)} className="w-full mt-4 text-sm text-slate-400 font-bold hover:text-slate-600">
                    取消申请，返回登录
                 </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MerchantLogin;
