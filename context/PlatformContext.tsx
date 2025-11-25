
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, ProductStatus, DetailedNutrients, ProductDetail, RecipeDetail } from '../types';

// --- MOCK PRODUCTS ---
const MOCK_PRODUCTS: ProductDetail[] = [
  {
    id: '1',
    name: "低脂鸡胸肉轻食餐盒",
    price: 28.0,
    imageUrl: "https://picsum.photos/300/300?random=20",
    calories: 350,
    protein: 32,
    carbs: 35,
    fat: 8.5,
    tags: ["高蛋白", "低碳水"],
    isPromo: true,
    merchantId: 'm1',
    merchantName: "轻食主义工坊",
    distance: "0.8km",
    status: 'APPROVED',
    merchantAddress: "朝阳区建国路88号",
    merchantRating: 4.8,
    salesCount: 1205,
    description: "经典畅销款，低脂健康。",
    ingredients: [{name:'鸡胸肉', amount:'150g'}],
    detailedNutrients: { calories: {value:350, nrvPercent:18}, protein: {value:32, nrvPercent:53}, carbs: {total:{value:35, nrvPercent:12}, available:{value:28}, fiber:{value:7}}, fat: {total:{value:8.5, nrvPercent:14}, saturated:{value:1.5}, monounsaturated:{value:4}, polyunsaturated:{value:2}}, vitamins:{}, minerals:{} }
  },
  {
    id: '2',
    name: "待审核：新品藜麦沙拉",
    price: 32.0,
    imageUrl: "https://picsum.photos/300/300?random=30",
    calories: 280,
    protein: 12,
    carbs: 40,
    fat: 10,
    tags: ["素食", "新品"],
    merchantId: 'm1',
    merchantName: "轻食主义工坊",
    distance: "0.8km",
    status: 'PENDING',
    merchantAddress: "朝阳区建国路88号",
    merchantRating: 4.8,
    salesCount: 0,
    description: "全新推出的素食主义沙拉。",
    ingredients: [{name:'藜麦', amount:'100g'}],
    detailedNutrients: { calories: {value:280, nrvPercent:14}, protein: {value:12, nrvPercent:20}, carbs: {total:{value:40, nrvPercent:15}, available:{value:35}, fiber:{value:5}}, fat: {total:{value:10, nrvPercent:16}, saturated:{value:1}, monounsaturated:{value:5}, polyunsaturated:{value:3}}, vitamins:{}, minerals:{} }
  },
  {
    id: '3',
    name: "有机羽衣甘蓝 (200g)",
    price: 12.5,
    imageUrl: "https://picsum.photos/300/300?random=21",
    calories: 45,
    protein: 3,
    carbs: 8,
    fat: 0.5,
    tags: ["有机认证", "膳食纤维"],
    merchantId: 'm2',
    merchantName: "绿源有机农场",
    distance: "3.2km",
    status: 'APPROVED',
    merchantAddress: "海淀区西山农场",
    merchantRating: 4.9,
    salesCount: 800,
    description: "新鲜采摘，当日直达。",
    ingredients: [{name:'羽衣甘蓝', amount:'200g'}],
    detailedNutrients: { calories: {value:45, nrvPercent:2}, protein: {value:3, nrvPercent:5}, carbs: {total:{value:8, nrvPercent:3}, available:{value:4}, fiber:{value:4}}, fat: {total:{value:0.5, nrvPercent:1}, saturated:{value:0}, monounsaturated:{value:0}, polyunsaturated:{value:0}}, vitamins:{}, minerals:{} }
  },
];

// --- MOCK RECIPES (Moved from Community.tsx) ---
const MOCK_RECIPES_INITIAL: (RecipeDetail & { category: string })[] = [
  {
    id: '1',
    title: '牛油果吐司配溏心蛋',
    author: '莎拉·格林',
    likes: 124,
    imageUrl: 'https://picsum.photos/400/300?random=1',
    calories: 320,
    protein: 14.5,
    carbs: 28,
    fat: 18,
    prepTime: 10,
    category: '早餐',
    description: '这道早餐富含健康的单不饱和脂肪和优质蛋白质，是开启活力一天的完美选择。',
    ingredients: [{ name: '全麦面包', amount: '2片' }, { name: '牛油果', amount: '半个' }, { name: '鸡蛋', amount: '1个' }],
    steps: [{ step: 1, description: '烤面包，煎蛋，切牛油果。' }],
    detailedNutrients: { calories: {value:320, nrvPercent:16}, protein: {value:14.5, nrvPercent:24}, carbs: {total:{value:28, nrvPercent:9}, available:{value:22}, fiber:{value:6}}, fat: {total:{value:18, nrvPercent:30}, saturated:{value:3.5}, monounsaturated:{value:11}, polyunsaturated:{value:2.5}}, vitamins:{'A':{value:'180μg', nrvPercent:22}}, minerals:{'钾 (K)':{value:'450mg', nrvPercent:22}} }
  },
  {
    id: '2',
    title: '莓果燕麦碗',
    author: '健身达人Mike',
    likes: 89,
    imageUrl: 'https://picsum.photos/400/300?random=2',
    calories: 280,
    protein: 10,
    carbs: 45,
    fat: 6,
    prepTime: 5,
    category: '早餐',
    description: '清爽快手的早餐。',
    ingredients: [{ name: '燕麦', amount: '50g' }, { name: '牛奶', amount: '200ml' }],
    steps: [{ step: 1, description: '混合所有食材。' }],
    detailedNutrients: { calories: {value:280, nrvPercent:14}, protein: {value:10, nrvPercent:16}, carbs: {total:{value:45, nrvPercent:15}, available:{value:40}, fiber:{value:5}}, fat: {total:{value:6, nrvPercent:10}, saturated:{value:1}, monounsaturated:{value:2}, polyunsaturated:{value:1}}, vitamins:{}, minerals:{} }
  },
  {
    id: '3',
    title: '香烤鸡胸肉沙拉',
    author: '安娜大厨',
    likes: 256,
    imageUrl: 'https://picsum.photos/400/300?random=3',
    calories: 450,
    protein: 40,
    carbs: 15,
    fat: 20,
    prepTime: 20,
    category: '高蛋白',
    description: '低脂高蛋白，减脂期必备。',
    ingredients: [{ name: '鸡胸肉', amount: '150g' }, { name: '蔬菜', amount: '200g' }],
    steps: [{ step: 1, description: '鸡胸肉腌制后煎熟，切块拌入蔬菜。' }],
    detailedNutrients: { calories: {value:450, nrvPercent:22}, protein: {value:40, nrvPercent:66}, carbs: {total:{value:15, nrvPercent:5}, available:{value:10}, fiber:{value:5}}, fat: {total:{value:20, nrvPercent:33}, saturated:{value:5}, monounsaturated:{value:8}, polyunsaturated:{value:4}}, vitamins:{}, minerals:{} }
  },
];

interface PlatformContextType {
  products: ProductDetail[];
  recipes: (RecipeDetail & { category: string })[]; // 扩展类型包含 category
  
  addProduct: (product: ProductDetail) => void;
  addRecipe: (recipe: RecipeDetail & { category: string }) => void;
  
  updateProductStatus: (id: string, status: ProductStatus) => void;
  deleteProduct: (id: string) => void;
  getMerchantProducts: (merchantId: string) => ProductDetail[];
  getAllPendingProducts: () => ProductDetail[];
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
};

export const PlatformProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<ProductDetail[]>(MOCK_PRODUCTS);
  const [recipes, setRecipes] = useState<(RecipeDetail & { category: string })[]>(MOCK_RECIPES_INITIAL);

  // Products
  const addProduct = (product: ProductDetail) => {
    const newProduct = { ...product, status: 'PENDING' as ProductStatus };
    setProducts(prev => [newProduct, ...prev]);
  };

  const updateProductStatus = (id: string, status: ProductStatus) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const getMerchantProducts = (merchantId: string) => {
    return products.filter(p => p.merchantId === merchantId);
  };

  const getAllPendingProducts = () => {
    return products.filter(p => p.status === 'PENDING');
  };

  // Recipes
  const addRecipe = (recipe: RecipeDetail & { category: string }) => {
    setRecipes(prev => [recipe, ...prev]);
  };

  return (
    <PlatformContext.Provider value={{ 
      products, 
      recipes,
      addProduct, 
      addRecipe,
      updateProductStatus, 
      deleteProduct,
      getMerchantProducts,
      getAllPendingProducts
    }}>
      {children}
    </PlatformContext.Provider>
  );
};
