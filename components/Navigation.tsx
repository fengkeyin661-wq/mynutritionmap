
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Scan, Store, Users, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navigation: React.FC = () => {
  const { role } = useAuth();
  
  if (role !== 'USER') return null;

  const navItems = [
    { to: "/", icon: Home, label: "首页" },
    { to: "/community", icon: Users, label: "社区" },
    { to: "/scan", icon: Scan, label: "识别", isPrimary: true },
    { to: "/merchants", icon: Store, label: "商家" },
    { to: "/profile", icon: User, label: "我的" },
  ];

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50">
      <div className="bg-white/85 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] px-2 py-3 flex justify-between items-center relative">
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
  );
};

export default Navigation;
