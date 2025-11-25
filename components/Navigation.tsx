
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Scan, Store, Users, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navigation: React.FC = () => {
  const { role } = useAuth();
  const location = useLocation();
  
  if (role !== 'USER') return null;

  // Define paths where the main navigation should be hidden
  const hiddenPaths = [
    '/login', 
    '/merchant', 
    '/community/create', 
    '/community/recipe/', 
    '/merchants/product/',
    '/scan'
  ];

  const shouldHide = hiddenPaths.some(path => location.pathname.startsWith(path));

  if (shouldHide) return null;

  const navItems = [
    { to: "/", icon: Home, label: "首页" },
    { to: "/community", icon: Users, label: "社区" },
    { to: "/scan", icon: Scan, label: "识别", isPrimary: true },
    { to: "/merchants", icon: Store, label: "商家" },
    { to: "/profile", icon: User, label: "我的" },
  ];

  return (
    // Fixed container to position over the app content
    // 'pointer-events-none' ensures the full-width wrapper doesn't block clicks on content behind it (on sides)
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      {/* 
         Constraint container: matches App max-width (480px).
         'pointer-events-auto' re-enables clicks for the nav itself.
         'pb-safe-nav-offset' handles iPhone Home indicator spacing.
      */}
      <div className="w-full md:max-w-[480px] px-4 pb-6 pointer-events-auto pb-safe-nav-offset">
        <div className="bg-white/90 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] px-2 py-3 flex justify-between items-center relative">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) => `
                relative flex flex-col items-center justify-center transition-all duration-300 w-full
                ${item.isPrimary ? '-mt-12' : ''}
              `}
            >
              {({ isActive }) => (
                <>
                  {item.isPrimary ? (
                    // Primary Action Button (Scan)
                    <div className={`
                      w-16 h-16 rounded-full flex items-center justify-center shadow-xl transform transition-all duration-300
                      ${isActive 
                        ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white scale-110 shadow-emerald-200 ring-4 ring-white' 
                        : 'bg-slate-800 text-white scale-100 ring-4 ring-white shadow-slate-300'}
                    `}>
                      <item.icon size={28} strokeWidth={2.5} />
                    </div>
                  ) : (
                    // Standard Nav Items
                    <div className={`
                      p-2 rounded-2xl transition-all duration-300 flex flex-col items-center gap-1
                      ${isActive ? 'bg-emerald-50/80 text-emerald-600 translate-y-[-2px]' : 'text-slate-400 hover:text-slate-600'}
                    `}>
                      <item.icon 
                        size={24} 
                        strokeWidth={isActive ? 2.5 : 2} 
                        className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}
                      />
                      <span className={`text-[10px] font-bold leading-none transition-all duration-300 ${isActive ? 'scale-100 opacity-100 mt-1' : 'scale-0 opacity-0 h-0 w-0'}`}>
                        {item.label}
                      </span>
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Navigation;
