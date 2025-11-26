
export interface NutrientInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

// 详细营养素结构
export interface DetailedNutrients {
  calories: { value: number; nrvPercent: number };
  protein: { value: number; nrvPercent: number };
  carbs: {
    total: { value: number; nrvPercent: number };
    available: { value: number };
    fiber: { value: number };
  };
  fat: {
    total: { value: number; nrvPercent: number };
    saturated: { value: number };
    monounsaturated: { value: number };
    polyunsaturated: { value: number };
  };
  vitamins: {
    [key: string]: { value: string; nrvPercent: number }; // e.g., A, B1, C...
  };
  minerals: {
    [key: string]: { value: string; nrvPercent: number }; // e.g., Calcium, Iron...
  };
}

export interface Ingredient {
  name: string;
  amount: string; // e.g., "150g"
}

export interface IdentifiedFood {
  foodName: string;
  ingredients: Ingredient[];
}

export interface FoodAnalysisResult {
  foodName: string;
  // 使用详细结构替换简单的 NutrientInfo
  detailedNutrients: DetailedNutrients; 
  healthScore: number; // 0-100
  advice: string;
  tags: string[];
}

// --- 新增：系统角色与状态定义 ---

export type UserRole = 'USER' | 'MERCHANT' | 'ADMIN';

export type ProductStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// 新增：用户画像与健康数据
export type Gender = 'MALE' | 'FEMALE';
export type ActivityLevel = 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'VERY_ACTIVE';

export interface UserProfile {
  nickname: string;
  avatarUrl?: string;
  gender: Gender;
  age: number;
  height: number; // cm
  weight: number; // kg
  activityLevel: ActivityLevel;
  bmr: number; // 基础代谢率
  tdee: number; // 每日总能量消耗
  bmi: number; // 身体质量指数
}

export interface Merchant {
  id: string;
  name: string;
  type: 'restaurant' | 'grocery' | 'farm';
  rating: number;
  distance: string; // e.g., "0.8km"
  imageUrl: string;
  tags: string[];
  isVerified: boolean;
  address?: string; // 新增
  status?: ProductStatus; // 新增：商户本身也需要审核
}

// 商品接口
export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  calories: number; // Kcal per serving
  tags: string[];
  isPromo?: boolean;
  merchantId: string; // 新增：关联ID
  merchantName: string; 
  distance: string;     
  status: ProductStatus; // 新增：审核状态
  // 新增：用于列表页快速添加
  protein: number;
  carbs: number;
  fat: number;
}

// 商品详情接口 (新增)
export interface ProductDetail extends Product {
  description: string;
  ingredients: Ingredient[];
  detailedNutrients: DetailedNutrients;
  merchantAddress: string;
  merchantRating: number;
  salesCount: number;
}

// 基础食谱信息
export interface Recipe {
  id: string;
  title: string;
  author: string;
  likes: number;
  imageUrl: string;
  calories: number;
  prepTime: number; // minutes
  // 新增：用于列表页快速添加
  protein: number;
  carbs: number;
  fat: number;
}

export interface CookingStep {
  step: number;
  description: string;
  imageUrl?: string;
}

// 扩展后的详情接口
export interface RecipeDetail extends Recipe {
  description: string;
  ingredients: Ingredient[];
  steps: CookingStep[];
  detailedNutrients: DetailedNutrients;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  IDENTIFYING = 'IDENTIFYING', // 识别中
  REVIEWING = 'REVIEWING',     // 用户确认中
  ANALYZING = 'ANALYZING',     // 详细分析中
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

// --- 新增：饮食记录相关接口 ---

export type MealSource = 'RECIPE' | 'PRODUCT' | 'AI_ANALYSIS';

export interface MealLogItem {
  id: string; // unique log id
  sourceId?: string; // original item id
  name: string;
  imageUrl?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sourceType: MealSource;
  timestamp: number;
  detailedNutrients?: DetailedNutrients; // 新增：支持详细分析聚合
}

export interface DailySummary {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

// --- 新增：用户DIY食物库 ---
export interface UserFoodItem {
  id: string;
  name: string;
  imageUrl?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  detailedNutrients: DetailedNutrients;
  timestamp: number;
}
