
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <PlatformProvider>
          <DailyLogProvider>
            <Router>
              {/* Main App Container - Mobile Optimized */}
              <div className="w-full md:max-w-[480px] mx-auto min-h-[100dvh] bg-slate-50 relative shadow-2xl flex flex-col">
                
                {/* Scrollable Content Area */}
                <div className="flex-1 w-full overflow-y-auto no-scrollbar pb-24">
                  <Routes>
                    {/* Public/User Routes */}
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/scan" element={<Analysis />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/community/create" element={<CreateRecipe />} />
                    <Route path="/community/recipe/:id" element={<RecipeDetail />} />
                    <Route path="/merchants" element={<Merchants />} />
                    <Route path="/merchants/product/:id" element={<ProductDetail />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/login" element={<Login />} />
                    
                    {/* Merchant Routes */}
                    <Route path="/merchant/login" element={<MerchantLogin />} />
                    <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
                    <Route path="/merchant/edit/:id" element={<ProductEdit />} />
                    
                    {/* Admin Routes */}
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>

                {/* Navigation (Fixed relative to viewport but centered via CSS in component) */}
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
