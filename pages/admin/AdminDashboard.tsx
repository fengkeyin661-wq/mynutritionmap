
import React from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { useNavigate } from 'react-router-dom';
import { Check, X, ArrowLeft, ShieldCheck } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { getAllPendingProducts, updateProductStatus } = usePlatform();
  const navigate = useNavigate();
  const pendingProducts = getAllPendingProducts();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-800 text-white px-4 py-4 flex justify-between items-center sticky top-0 z-10">
        <button onClick={() => navigate('/profile')} className="p-2 -ml-2 text-slate-300 hover:text-white">
           <ArrowLeft size={24} />
        </button>
        <h1 className="font-bold text-lg flex items-center gap-2">
           <ShieldCheck size={20} /> 系统管理后台
        </h1>
        <div className="w-8"></div>
      </div>

      <div className="p-4">
         <h2 className="font-bold text-slate-700 mb-4">待审核商品 ({pendingProducts.length})</h2>
         
         {pendingProducts.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
               <ShieldCheck size={48} className="mx-auto mb-2 opacity-20" />
               <p>暂无待审核任务</p>
            </div>
         ) : (
            <div className="space-y-4">
               {pendingProducts.map(p => (
                  <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                     <div className="flex gap-4 mb-4">
                        <img src={p.imageUrl} className="w-20 h-20 rounded-lg bg-slate-100 object-cover" />
                        <div>
                           <h3 className="font-bold text-slate-800">{p.name}</h3>
                           <p className="text-xs text-slate-500 mt-1">商家: {p.merchantName}</p>
                           <p className="text-xs text-slate-500">价格: ¥{p.price} | 热量: {p.calories}</p>
                           <div className="mt-2 text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded inline-block">
                              申请时间: 刚刚
                           </div>
                        </div>
                     </div>
                     <div className="flex gap-3">
                        <button 
                           onClick={() => updateProductStatus(p.id, 'REJECTED')}
                           className="flex-1 py-2 bg-red-50 text-red-600 font-bold text-sm rounded-lg flex items-center justify-center gap-1"
                        >
                           <X size={16} /> 驳回
                        </button>
                        <button 
                           onClick={() => updateProductStatus(p.id, 'APPROVED')}
                           className="flex-1 py-2 bg-emerald-600 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-1 shadow-sm"
                        >
                           <Check size={16} /> 通过
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
    </div>
  );
};

export default AdminDashboard;
