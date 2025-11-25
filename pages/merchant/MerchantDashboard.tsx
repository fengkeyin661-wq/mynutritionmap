import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import { Plus, Package, Clock, CircleCheck, CircleX, ArrowLeft, Store } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const MerchantDashboard: React.FC = () => {
  const { currentMerchantId, merchantName } = useAuth();
  const { getMerchantProducts, deleteProduct } = usePlatform();
  const navigate = useNavigate();

  if (!currentMerchantId) {
     return <div className="p-10 text-center">请先登录商家账号</div>;
  }

  const myProducts = getMerchantProducts(currentMerchantId);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
        <button onClick={() => navigate('/profile')} className="p-2 -ml-2 text-slate-400">
           <ArrowLeft size={24} />
        </button>
        <div className="flex flex-col items-center">
           <h1 className="font-bold text-lg text-slate-800">商家管理后台</h1>
           <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5">
             <Store size={10} /> {merchantName || '我的店铺'}
           </span>
        </div>
        <div className="w-8"></div>
      </div>

      <div className="p-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white p-3 rounded-xl border border-slate-100 text-center">
            <div className="text-xs text-slate-400 mb-1">商品总数</div>
            <div className="font-bold text-xl text-slate-800">{myProducts.length}</div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-100 text-center">
             <div className="text-xs text-slate-400 mb-1">待审核</div>
             <div className="font-bold text-xl text-yellow-500">
               {myProducts.filter(p => p.status === 'PENDING').length}
             </div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-100 text-center">
             <div className="text-xs text-slate-400 mb-1">已上架</div>
             <div className="font-bold text-xl text-emerald-500">
                {myProducts.filter(p => p.status === 'APPROVED').length}
             </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-slate-700">商品列表</h2>
          <Link to="/merchant/edit/new" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm">
             <Plus size={16} /> 发布商品
          </Link>
        </div>

        {/* Product List */}
        <div className="space-y-3">
          {myProducts.length === 0 ? (
             <div className="text-center py-10 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                <Package size={40} className="mx-auto mb-2 opacity-30" />
                <p>暂无商品，快去发布吧</p>
             </div>
          ) : (
            myProducts.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex gap-4">
                 <img src={p.imageUrl} alt={p.name} className="w-16 h-16 rounded-lg object-cover bg-slate-100 shrink-0" />
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-slate-800 truncate">{p.name}</h3>
                      {p.status === 'APPROVED' && <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded flex items-center gap-1"><CircleCheck size={10} /> 已上架</span>}
                      {p.status === 'PENDING' && <span className="text-[10px] bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded flex items-center gap-1"><Clock size={10} /> 审核中</span>}
                      {p.status === 'REJECTED' && <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded flex items-center gap-1"><CircleX size={10} /> 已驳回</span>}
                    </div>
                    <p className="text-xs text-slate-400 mb-2">¥{p.price.toFixed(1)} | {p.calories} kcal</p>
                    <div className="flex gap-2">
                       <button className="px-3 py-1 bg-slate-50 text-slate-600 text-xs rounded font-medium border border-slate-200">编辑</button>
                       <button onClick={() => deleteProduct(p.id)} className="px-3 py-1 bg-red-50 text-red-500 text-xs rounded font-medium">下架/删除</button>
                    </div>
                 </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MerchantDashboard;