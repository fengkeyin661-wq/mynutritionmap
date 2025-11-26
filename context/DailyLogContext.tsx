
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MealLogItem, DailySummary } from '../types';
import { useToast } from './ToastContext';

interface DailyLogContextType {
  logs: MealLogItem[];
  summary: DailySummary;
  addLog: (item: Omit<MealLogItem, 'id' | 'timestamp'>) => void;
  removeLog: (id: string) => void;
  targetCalories: number;
}

const DailyLogContext = createContext<DailyLogContextType | undefined>(undefined);

export const useDailyLog = () => {
  const context = useContext(DailyLogContext);
  if (!context) {
    throw new Error('useDailyLog must be used within a DailyLogProvider');
  }
  return context;
};

export const DailyLogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<MealLogItem[]>([]);
  const [summary, setSummary] = useState<DailySummary>({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
  });
  
  const { showToast } = useToast();
  const targetCalories = 2200; // 假设的目标值

  // 当日志变化时重新计算总和
  useEffect(() => {
    const newSummary = logs.reduce(
      (acc, item) => ({
        totalCalories: acc.totalCalories + item.calories,
        totalProtein: acc.totalProtein + item.protein,
        totalCarbs: acc.totalCarbs + item.carbs,
        totalFat: acc.totalFat + item.fat,
      }),
      { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
    );
    setSummary(newSummary);
  }, [logs]);

  const addLog = (item: Omit<MealLogItem, 'id' | 'timestamp'>) => {
    const newLog: MealLogItem = {
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    setLogs((prev) => [newLog, ...prev]);
    showToast(`已添加: ${item.name}`, 'success');
  };

  const removeLog = (id: string) => {
    setLogs((prev) => prev.filter((log) => log.id !== id));
    showToast('记录已删除', 'info');
  };

  return (
    <DailyLogContext.Provider value={{ logs, summary, addLog, removeLog, targetCalories }}>
      {children}
    </DailyLogContext.Provider>
  );
};
