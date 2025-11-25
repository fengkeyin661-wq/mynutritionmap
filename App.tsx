import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import Community from './pages/Community';
import RecipeDetail from './pages/RecipeDetail';
import CreateRecipe from './pages/CreateRecipe';
import Merchants from './pages/Merchants';
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile';
import Login from './pages/Login';
import MerchantLogin from './pages/merchant/MerchantLogin';
import MerchantDashboard from './pages/merchant/MerchantDashboard';
import ProductEdit from './pages/merchant/ProductEdit';
import AdminDashboard from './pages/admin/AdminDashboard';
import { DailyLogProvider } from './context/DailyLogContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { PlatformProvider } from './context/PlatformContext';

// 布局包装器：根据路由决定是否给底部导航留白
const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  // 这些页面不需要底部导航栏，因此不需要底部 padding
  const fullScreenPaths = [
    '/login', 
    '/merchant/login', 
    '/community/create', 
    '/merchant/edit',
    '/scan' // 扫描页通常全屏
  ];
  
  const isFullScreen = fullScreenPaths.some(path => location.pathname.startsWith(path));
  
  // 详情页也不需要底部导航，但可能有自己的底部操作栏，这里统一处理
  const isDetail = location.pathname.includes('/recipe/') || location.pathname.includes('/product/');

  return (
    <div className={`flex-1 w-full overflow-y-auto no-scrollbar relative flex flex-col ${(!isFullScreen && !isDetail) ? 'pb-[90px]' : ''}`}>
      {children}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <PlatformProvider>
          <DailyLogProvider>
            <Router>
              {/* 移动端仿真容器：在桌面端限制宽度并居中，移动端占满 */}
              <div className="w-full md:max-w-[480px] mx-auto h-full bg-slate-50 relative shadow-2xl flex flex-col overflow-hidden">
                
                <LayoutWrapper>
                  <Routes>
                    {/* 公共/用户路由 */}
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/scan" element={<Analysis />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/community/create" element={<CreateRecipe />} />
                    <Route path="/community/recipe/:id" element={<RecipeDetail />} />
                    <Route path="/merchants" element={<Merchants />} />
                    <Route path="/merchants/product/:id" element={<ProductDetail />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/login" element={<Login />} />
                    
                    {/* 商家路由 */}
                    <Route path="/merchant/login" element={<MerchantLogin />} />
                    <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
                    <Route path="/merchant/edit/:id" element={<ProductEdit />} />
                    
                    {/* 管理员路由 */}
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </LayoutWrapper>

                {/* 底部导航栏 */}
                <Navigation />
              </div>
            </Router>
          </DailyLogProvider>
        </PlatformProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;