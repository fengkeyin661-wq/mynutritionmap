
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { UserRole, UserProfile, Gender, ActivityLevel, UserFoodItem } from '../types';
import { useToast } from './ToastContext';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  role: UserRole;
  userProfile: UserProfile | null;
  currentMerchantId: string | null;
  merchantName: string | null;
  isLoading: boolean;
  
  // Actions
  login: (email: string, pass: string) => Promise<boolean>;
  register: (email: string, pass: string, profile: UserProfile) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (profile: UserProfile) => void;
  loginAs: (targetRole: UserRole, merchantId?: string, mName?: string) => void;
  
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

// 基础代谢率计算
const calculateBMR = (gender: Gender, weight: number, height: number, age: number): number => {
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  if (gender === 'MALE') bmr += 5;
  else bmr -= 161;
  return Math.round(bmr);
};

// TDEE 计算
const calculateTDEE = (bmr: number, level: ActivityLevel): number => {
  const multipliers: Record<ActivityLevel, number> = {
    'SEDENTARY': 1.2,
    'LIGHT': 1.375,
    'MODERATE': 1.55,
    'ACTIVE': 1.725,
    'VERY_ACTIVE': 1.9
  };
  return Math.round(bmr * (multipliers[level] || 1.2));
};

const calculateBMI = (weight: number, height: number): number => {
  const h = height / 100;
  return parseFloat((weight / (h * h)).toFixed(1));
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  
  const [role, setRole] = useState<UserRole>('USER');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentMerchantId, setCurrentMerchantId] = useState<string | null>(null);
  const [merchantName, setMerchantName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [favoriteRecipes, setFavoriteRecipes] = useState<string[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<string[]>([]);
  const [userFoodLibrary, setUserFoodLibrary] = useState<UserFoodItem[]>([]);

  // 1. 初始化检查 Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setRole('USER');
        setUserProfile(null);
        setCurrentMerchantId(null);
        setMerchantName(null);
        setFavoriteRecipes([]);
        setFavoriteProducts([]);
        setUserFoodLibrary([]);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. 拉取用户完整档案
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // 如果没有找到 profile (可能是新用户延迟)，暂不报错
        console.warn('Profile fetch warning:', error.message);
      }
      
      if (data) {
        // Map DB snake_case to Frontend camelCase
        const profile: UserProfile = {
          nickname: data.nickname,
          avatarUrl: data.avatar_url,
          gender: data.gender as Gender,
          age: data.age,
          height: data.height,
          weight: data.weight,
          activityLevel: data.activity_level as ActivityLevel,
          bmr: data.bmr,
          tdee: data.tdee,
          bmi: data.bmi
        };
        
        setUserProfile(profile);
        setRole((data.role as UserRole) || 'USER');
        
        // 如果是商家，获取商家信息
        if (data.role === 'MERCHANT') {
           const { data: merchantData } = await supabase.from('merchants').select('id, name').eq('owner_id', userId).single();
           if (merchantData) {
             setCurrentMerchantId(merchantData.id);
             setMerchantName(merchantData.name);
           }
        }

        // 加载关联数据
        loadFavorites(userId);
        loadFoodLibrary(userId);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFavorites = async (userId: string) => {
    try {
      const { data } = await supabase.from('favorites').select('*').eq('user_id', userId);
      if (data) {
        setFavoriteRecipes(data.filter(f => f.item_type === 'RECIPE').map(f => f.item_id));
        setFavoriteProducts(data.filter(f => f.item_type === 'PRODUCT').map(f => f.item_id));
      }
    } catch(e) {
      console.warn("Failed to load favorites", e);
    }
  };

  const loadFoodLibrary = async (userId: string) => {
    try {
      const { data } = await supabase.from('user_food_library').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (data) {
        const mapped: UserFoodItem[] = data.map(item => ({
          id: item.id,
          name: item.name,
          imageUrl: item.image_url,
          calories: item.calories,
          detailedNutrients: item.detailed_nutrients,
          timestamp: new Date(item.created_at).getTime(),
          protein: item.detailed_nutrients?.protein?.value || 0,
          carbs: item.detailed_nutrients?.carbs?.total?.value || 0,
          fat: item.detailed_nutrients?.fat?.total?.value || 0
        }));
        setUserFoodLibrary(mapped);
      }
    } catch(e) {
      console.warn("Failed to load food library", e);
    }
  };

  // Actions
  const login = async (email: string, pass: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) {
      showToast(error.message || '登录失败', 'error');
      return false;
    }
    return true;
  };

  const register = async (email: string, pass: string, profile: UserProfile): Promise<boolean> => {
    const bmr = calculateBMR(profile.gender, profile.weight, profile.height, profile.age);
    const tdee = calculateTDEE(bmr, profile.activityLevel);
    const bmi = calculateBMI(profile.weight, profile.height);

    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password: pass,
      options: {
        data: {
          nickname: profile.nickname,
          avatar_url: profile.avatarUrl
        }
      }
    });

    if (error) {
      showToast(error.message || '注册失败', 'error');
      return false;
    }

    if (data.user) {
      // Create or Update Profile Record (Using Upsert for safety)
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        nickname: profile.nickname,
        avatar_url: profile.avatarUrl,
        gender: profile.gender,
        age: profile.age,
        height: profile.height,
        weight: profile.weight,
        activity_level: profile.activityLevel,
        bmr, tdee, bmi,
        role: 'USER'
      });
      
      if (profileError) {
        console.error('Profile Creation Error:', profileError);
        showToast('账号创建成功但资料保存异常，请稍后重试', 'info');
      }

      setTimeout(() => {
        if (data.user) fetchProfile(data.user.id);
      }, 500);
      
      return true;
    }
    return false;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    showToast('已安全退出', 'success');
  };

  const updateUserProfile = async (profileData: UserProfile) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const bmr = calculateBMR(profileData.gender, profileData.weight, profileData.height, profileData.age);
    const tdee = calculateTDEE(bmr, profileData.activityLevel);
    const bmi = calculateBMI(profileData.weight, profileData.height);

    const fullProfile = { ...profileData, bmr, tdee, bmi };

    const { error } = await supabase.from('profiles').update({
       nickname: fullProfile.nickname,
       gender: fullProfile.gender,
       age: fullProfile.age,
       height: fullProfile.height,
       weight: fullProfile.weight,
       activity_level: fullProfile.activityLevel,
       bmr, tdee, bmi
    }).eq('id', user.id);

    if (error) {
      showToast('更新失败', 'error');
    } else {
      setUserProfile(fullProfile);
      showToast('资料已更新', 'success');
    }
  };

  // Favorites
  const toggleFavorite = async (id: string, type: 'RECIPE' | 'PRODUCT') => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    try {
      const { data } = await supabase.from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_id', id)
        .eq('item_type', type)
        .single();

      if (data) {
        // Remove
        await supabase.from('favorites').delete().eq('id', data.id);
        if (type === 'RECIPE') setFavoriteRecipes(prev => prev.filter(i => i !== id));
        else setFavoriteProducts(prev => prev.filter(i => i !== id));
        showToast('已取消收藏', 'info');
      } else {
        // Add
        await supabase.from('favorites').insert({
          user_id: user.id,
          item_id: id,
          item_type: type
        });
        if (type === 'RECIPE') setFavoriteRecipes(prev => [...prev, id]);
        else setFavoriteProducts(prev => [...prev, id]);
        showToast('已加入收藏', 'success');
      }
    } catch(e) {
      showToast('操作失败', 'error');
    }
  };

  const toggleFavoriteRecipe = (id: string) => toggleFavorite(id, 'RECIPE');
  const toggleFavoriteProduct = (id: string) => toggleFavorite(id, 'PRODUCT');
  const isFavoriteRecipe = (id: string) => favoriteRecipes.includes(id);
  const isFavoriteProduct = (id: string) => favoriteProducts.includes(id);

  // Food Library
  const saveToFoodLibrary = async (item: Omit<UserFoodItem, 'id' | 'timestamp'>) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    try {
      const { data, error } = await supabase.from('user_food_library').insert({
        user_id: user.id,
        name: item.name,
        image_url: item.imageUrl,
        calories: item.calories,
        detailed_nutrients: item.detailedNutrients
      }).select().single();

      if (!error && data) {
         loadFoodLibrary(user.id);
      }
    } catch(e) {
      console.warn("Save to library failed", e);
    }
  };

  const deleteFromFoodLibrary = async (id: string) => {
    try {
      await supabase.from('user_food_library').delete().eq('id', id);
      setUserFoodLibrary(prev => prev.filter(i => i.id !== id));
      showToast('已移除', 'info');
    } catch(e) {
      showToast('删除失败', 'error');
    }
  };

  const loginAs = (targetRole: UserRole, merchantId?: string, mName?: string) => {
    setRole(targetRole);
    if(merchantId) setCurrentMerchantId(merchantId);
    if(mName) setMerchantName(mName);
  };

  return (
    <AuthContext.Provider value={{ 
      role, userProfile, currentMerchantId, merchantName, isLoading,
      login, register, logout, updateUserProfile, loginAs,
      favoriteRecipes, favoriteProducts, toggleFavoriteRecipe, toggleFavoriteProduct, isFavoriteRecipe, isFavoriteProduct,
      userFoodLibrary, saveToFoodLibrary, deleteFromFoodLibrary
    }}>
      {children}
    </AuthContext.Provider>
  );
};
