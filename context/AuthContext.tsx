
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { UserRole, UserProfile, Gender, ActivityLevel, UserFoodItem } from '../types';
import { useToast } from './ToastContext';

interface AuthContextType {
  role: UserRole;
  userProfile: UserProfile | null;
  currentMerchantId: string | null;
  merchantName: string | null; // 新增：当前商户名称
  
  // Actions
  loginAs: (role: UserRole, merchantId?: string, merchantName?: string) => void;
  logout: () => void;
  updateUserProfile: (profile: UserProfile) => void;
  
  // Favorites
  favoriteRecipes: string[];
  favoriteProducts: string[];
  toggleFavoriteRecipe: (id: string) => void;
  toggleFavoriteProduct: (id: string) => void;
  isFavoriteRecipe: (id: string) => boolean;
  isFavoriteProduct: (id: string) => boolean;

  // DIY Food Library
  userFoodLibrary: UserFoodItem[];
  saveToFoodLibrary: (item: Omit<UserFoodItem, 'id' | 'timestamp'>) => void;
  deleteFromFoodLibrary: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 基础代谢率计算公式 (Mifflin-St Jeor Equation)
const calculateBMR = (gender: Gender, weight: number, height: number, age: number): number => {
  // Weight in kg, Height in cm, Age in years
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  if (gender === 'MALE') {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  return Math.round(bmr);
};

// 每日总能量消耗计算
const calculateTDEE = (bmr: number, level: ActivityLevel): number => {
  const multipliers: Record<ActivityLevel, number> = {
    'SEDENTARY': 1.2,      // 久坐
    'LIGHT': 1.375,        // 轻度活动
    'MODERATE': 1.55,      // 中度活动
    'ACTIVE': 1.725,       // 高度活动
    'VERY_ACTIVE': 1.9     // 极度活动
  };
  return Math.round(bmr * (multipliers[level] || 1.2));
};

const calculateBMI = (weight: number, height: number): number => {
  const h = height / 100; // convert to meters
  return parseFloat((weight / (h * h)).toFixed(1));
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  
  const [role, setRole] = useState<UserRole>('USER');
  const [currentMerchantId, setCurrentMerchantId] = useState<string | null>(null);
  const [merchantName, setMerchantName] = useState<string | null>(null);
  
  // 用户资料
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // 收藏夹 (存储ID)
  const [favoriteRecipes, setFavoriteRecipes] = useState<string[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<string[]>([]);

  // 用户 DIY 食物库
  const [userFoodLibrary, setUserFoodLibrary] = useState<UserFoodItem[]>([
    // Mock Data
    {
      id: 'mock_1',
      name: '自制蔬菜沙拉',
      imageUrl: 'https://picsum.photos/200/200?random=101',
      calories: 180,
      protein: 5,
      carbs: 12,
      fat: 8,
      timestamp: Date.now() - 86400000,
      detailedNutrients: { calories: {value:180, nrvPercent:9}, protein: {value:5, nrvPercent:8}, carbs: {total:{value:12, nrvPercent:4}, available:{value:8}, fiber:{value:4}}, fat: {total:{value:8, nrvPercent:13}, saturated:{value:1}, monounsaturated:{value:4}, polyunsaturated:{value:3}}, vitamins:{}, minerals:{} }
    },
    {
      id: 'mock_2',
      name: '早餐燕麦杯',
      imageUrl: 'https://picsum.photos/200/200?random=102',
      calories: 320,
      protein: 12,
      carbs: 45,
      fat: 6,
      timestamp: Date.now() - 172800000,
      detailedNutrients: { calories: {value:320, nrvPercent:16}, protein: {value:12, nrvPercent:20}, carbs: {total:{value:45, nrvPercent:15}, available:{value:40}, fiber:{value:5}}, fat: {total:{value:6, nrvPercent:10}, saturated:{value:1}, monounsaturated:{value:3}, polyunsaturated:{value:2}}, vitamins:{}, minerals:{} }
    }
  ]);

  const loginAs = (newRole: UserRole, merchantId?: string, mName?: string) => {
    setRole(newRole);
    if (newRole === 'MERCHANT' && merchantId) {
      setCurrentMerchantId(merchantId);
      setMerchantName(mName || '我的店铺');
    } else {
      setCurrentMerchantId(null);
      setMerchantName(null);
    }
  };

  const logout = () => {
    setRole('USER');
    setCurrentMerchantId(null);
    setMerchantName(null);
    // 登出不一定清空 Profile，视需求而定，这里保留以便演示
  };

  const updateUserProfile = (profileData: UserProfile) => {
    // 自动计算 BMR, TDEE, BMI
    const bmr = calculateBMR(profileData.gender, profileData.weight, profileData.height, profileData.age);
    const tdee = calculateTDEE(bmr, profileData.activityLevel);
    const bmi = calculateBMI(profileData.weight, profileData.height);

    const fullProfile: UserProfile = {
      ...profileData,
      bmr,
      tdee,
      bmi
    };

    setUserProfile(fullProfile);
    showToast(`资料已更新，您的每日推荐热量为 ${tdee} kcal`, 'success');
  };

  // 收藏逻辑
  const toggleFavoriteRecipe = (id: string) => {
    if (favoriteRecipes.includes(id)) {
      setFavoriteRecipes(prev => prev.filter(rid => rid !== id));
      showToast('已取消收藏', 'info');
    } else {
      setFavoriteRecipes(prev => [...prev, id]);
      showToast('已添加到收藏夹', 'success');
    }
  };

  const toggleFavoriteProduct = (id: string) => {
    if (favoriteProducts.includes(id)) {
      setFavoriteProducts(prev => prev.filter(pid => pid !== id));
      showToast('已取消收藏', 'info');
    } else {
      setFavoriteProducts(prev => [...prev, id]);
      showToast('已添加到收藏夹', 'success');
    }
  };

  const isFavoriteRecipe = (id: string) => favoriteRecipes.includes(id);
  const isFavoriteProduct = (id: string) => favoriteProducts.includes(id);

  // DIY Food Library Logic
  const saveToFoodLibrary = (item: Omit<UserFoodItem, 'id' | 'timestamp'>) => {
    const newItem: UserFoodItem = {
      ...item,
      id: 'diy_' + Date.now(),
      timestamp: Date.now()
    };
    setUserFoodLibrary(prev => [newItem, ...prev]);
  };

  const deleteFromFoodLibrary = (id: string) => {
    setUserFoodLibrary(prev => prev.filter(item => item.id !== id));
    showToast('已从记录中移除', 'info');
  };

  return (
    <AuthContext.Provider value={{ 
      role, 
      userProfile,
      currentMerchantId, 
      merchantName,
      loginAs, 
      logout,
      updateUserProfile,
      favoriteRecipes,
      favoriteProducts,
      toggleFavoriteRecipe,
      toggleFavoriteProduct,
      isFavoriteRecipe,
      isFavoriteProduct,
      userFoodLibrary,
      saveToFoodLibrary,
      deleteFromFoodLibrary
    }}>
      {children}
    </AuthContext.Provider>
  );
};
