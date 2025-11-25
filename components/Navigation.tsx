
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Scan, Store, Users, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navigation: React.FC = () => {
  const { role } = useAuth();
  
  // 如果不是普通用户，隐藏底部导航栏 (商家和管理员有自己的界面布局)
  if (role !== 'USER') return null;

  const navItems = [
    { to: "/", icon: Home, label: "首页" },
    { to: "/community", icon: Users, label: "社区" },
    { to: "/scan", icon: Scan, label: "识别", isPrimary: true },
    { to: "/merchants", icon: Store, label: "商家" },
    { to: "/profile", icon: User, label: "我的" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe pt-2 px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-between items-end pb-2">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) => `
              flex flex-col items-center justify-center transition-all duration-300
              ${item.isPrimary ? '-mt-8' : ''}
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`
                  flex items-center justify-center rounded-full transition-all
                  ${item.isPrimary 
                    ? 'w-14 h-14 bg-emerald-500 shadow-lg shadow-emerald-200 text-white' 
                    : isActive ? 'text-emerald-600' : 'text-slate-400'}
                `}>
                  <item.icon size={item.isPrimary ? 28 : 24} strokeWidth={item.isPrimary ? 2 : 2.5} />
                </div>
                {!item.isPrimary && (
                  <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {item.label}
                  </span>
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
