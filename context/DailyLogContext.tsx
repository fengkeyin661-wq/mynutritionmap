import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MealLogItem, DailySummary } from '../types';
import { useToast } from './ToastContext';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface DailyLogContextType {
  logs: MealLogItem[];
  summary: DailySummary;
  addLog: (item: Omit<MealLogItem, 'id' | 'timestamp'>) => Promise<void>;
  removeLog: (id: string) => Promise<void>;
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
    totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0
  });
  
  const { showToast } = useToast();
  const { userProfile } = useAuth(); // To detect user change
  const targetCalories = userProfile?.tdee || 2000;

  useEffect(() => {
    fetchLogs();
  }, [userProfile]); // Reload logs when user changes

  const fetchLogs = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLogs([]);
      return;
    }

    // Load logs for TODAY (Server timestamp check would be better, but simple filter here)
    // For simplicity, we load all and filter by date in frontend or DB query
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayISO = today.toISOString();

    const { data, error } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('logged_at', todayISO)
      .order('logged_at', { ascending: false });

    if (data && !error) {
      const mapped: MealLogItem[] = data.map(item => ({
        id: item.id,
        name: item.name,
        imageUrl: item.image_url,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        sourceType: item.source_type,
        sourceId: item.source_id,
        timestamp: new Date(item.logged_at).getTime(),
        detailedNutrients: item.detailed_nutrients
      }));
      setLogs(mapped);
    }
  };

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

  const addLog = async (item: Omit<MealLogItem, 'id' | 'timestamp'>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      showToast('请先登录', 'error');
      return;
    }

    const { data, error } = await supabase.from('food_logs').insert({
      user_id: session.user.id,
      name: item.name,
      image_url: item.imageUrl,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      source_type: item.sourceType,
      source_id: item.sourceId,
      detailed_nutrients: item.detailedNutrients
    }).select().single();

    if (error) {
      console.error(error);
      showToast('记录失败', 'error');
    } else if (data) {
      showToast(`已加入: ${item.name}`, 'success');
      fetchLogs(); // Reload to sync
    }
  };

  const removeLog = async (id: string) => {
    const { error } = await supabase.from('food_logs').delete().eq('id', id);
    if (!error) {
      setLogs(prev => prev.filter(l => l.id !== id));
      showToast('记录已删除', 'info');
    }
  };

  return (
    <DailyLogContext.Provider value={{ logs, summary, addLog, removeLog, targetCalories }}>
      {children}
    </DailyLogContext.Provider>
  );
};
