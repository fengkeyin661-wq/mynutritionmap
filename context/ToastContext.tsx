
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
    } else if (typeof msg === 'number' || typeof msg === 'boolean') {
      safeMsg = String(msg);
    } else if (msg instanceof Error) {
      safeMsg = msg.message;
    } else if (msg && typeof msg === 'object') {
      // Prioritize standard error properties
      if (typeof msg.message === 'string') {
        safeMsg = msg.message;
      } else if (typeof msg.error_description === 'string') {
        safeMsg = msg.error_description;
      } else if (typeof msg.error === 'string') {
        safeMsg = msg.error;
      } else {
        // Last resort: JSON stringify or fallback, never allow [object Object]
        try {
          const json = JSON.stringify(msg);
          safeMsg = json === '{}' ? '操作失败 (未知错误)' : `错误: ${json}`;
        } catch {
          safeMsg = '操作失败 (未知错误)';
        }
      }
    } else {
      safeMsg = String(msg || '操作失败');
    }

    // Double check to ensure we never show the dreaded string
    if (safeMsg === '[object Object]') {
      safeMsg = '操作失败 (数据格式错误)';
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
