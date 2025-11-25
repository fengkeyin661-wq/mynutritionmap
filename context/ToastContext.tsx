
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Toast, ToastType } from '../components/Toast';

interface ToastContextType {
  showToast: (message: string | any, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('success');

  const showToast = (msg: string | any, t: ToastType = 'success') => {
    let safeMsg = '';

    if (typeof msg === 'string') {
      safeMsg = msg;
    } else if (msg instanceof Error) {
      safeMsg = msg.message;
    } else if (msg && typeof msg === 'object') {
      // Handle objects that look like errors (e.g. Supabase errors)
      if ('message' in msg && typeof msg.message === 'string') {
        safeMsg = msg.message;
      } else {
        // Fallback for objects that don't have a clear message
        console.warn('Toast received non-string object:', msg);
        safeMsg = '操作失败 (未知错误)';
      }
    } else {
      safeMsg = String(msg || '未知错误');
    }

    setMessage(safeMsg);
    setType(t);
    setIsVisible(true);
  };

  const closeToast = () => setIsVisible(false);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast message={message} type={type} isVisible={isVisible} onClose={closeToast} />
    </ToastContext.Provider>
  );
};
