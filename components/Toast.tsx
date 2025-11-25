import React, { useEffect } from 'react';
import { CircleCheck, CircleAlert, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 2500); // 2.5秒后自动关闭
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] animate-fade-in-down">
      <div className="bg-white/95 backdrop-blur-sm rounded-full shadow-xl shadow-slate-200 border border-slate-100 pl-4 pr-5 py-3 flex items-center gap-3 min-w-[280px] max-w-[90vw]">
        {type === 'success' && <CircleCheck className="text-emerald-500 shrink-0" size={20} strokeWidth={2.5} />}
        {type === 'error' && <CircleAlert className="text-red-500 shrink-0" size={20} strokeWidth={2.5} />}
        {type === 'info' && <Info className="text-blue-500 shrink-0" size={20} strokeWidth={2.5} />}
        
        <span className="text-slate-700 font-bold text-sm flex-1">{message}</span>
        
        <button 
          onClick={onClose} 
          className="text-slate-300 hover:text-slate-500 transition-colors ml-2"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};