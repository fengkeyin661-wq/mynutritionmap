
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, ProductStatus, DetailedNutrients, ProductDetail, RecipeDetail } from '../types';
import { supabase } from '../lib/supabase';
import { useToast } from './ToastContext';

interface PlatformContextType {
  products: ProductDetail[];
  recipes: (RecipeDetail & { category: string })[];
  
  addProduct: (product: ProductDetail) => Promise<void>;
  addRecipe: (recipe: RecipeDetail & { category: string }) => Promise<void>;
  
  updateProductStatus: (id: string, status: ProductStatus) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
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
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [recipes, setRecipes] = useState<(RecipeDetail & { category: string })[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
    // 可选：设置 Realtime Subscription
    const channel = supabase.channel('public:data')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recipes' }, fetchData)
      .subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchData = async () => {
    try {
      // 1. Fetch Products & Merchants JOIN
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select(`
          *,
          merchants ( name, address, rating, location_lat, location_lng )
        `)
        .order('created_at', { ascending: false });

      if (!prodError && prodData) {
        const mappedProducts: ProductDetail[] = prodData.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          imageUrl: p.image_url,
          calories: p.calories,
          protein: p.protein,
          carbs: p.carbs,
          fat: p.fat,
          tags: p.tags || [],
          isPromo: p.is_promo,
          merchantId: p.merchant_id,
          merchantName: p.merchants?.name || '未知商家',
          distance: "1.2km", // 需结合地理位置计算
          status: p.status as ProductStatus,
          merchantAddress: p.merchants?.address,
          merchantRating: p.merchants?.rating || 5.0,
          salesCount: p.sales_count || 0,
          description: p.description,
          ingredients: p.ingredients || [],
          detailedNutrients: p.detailed_nutrients
        }));
        setProducts(mappedProducts);
      }

      // 2. Fetch Recipes & Authors JOIN
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .select(`
          *,
          profiles ( nickname )
        `)
        .order('created_at', { ascending: false });

      if (!recipeError && recipeData) {
        const mappedRecipes: (RecipeDetail & { category: string })[] = recipeData.map((r: any) => ({
          id: r.id,
          title: r.title,
          author: r.profiles?.nickname || 'NutriMap用户',
          likes: r.likes_count,
          imageUrl: r.image_url,
          calories: r.calories,
          protein: r.detailed_nutrients?.protein?.value || 0,
          carbs: r.detailed_nutrients?.carbs?.total?.value || 0,
          fat: r.detailed_nutrients?.fat?.total?.value || 0,
          prepTime: r.prep_time,
          category: r.category || '全部',
          description: r.description,
          ingredients: r.ingredients || [],
          steps: r.steps || [],
          detailedNutrients: r.detailed_nutrients
        }));
        setRecipes(mappedRecipes);
      }
    } catch (e) {
      console.warn("Platform data fetch failed", e);
    }
  };

  // --- Actions ---

  const addProduct = async (product: ProductDetail) => {
    const { error } = await supabase.from('products').insert({
      merchant_id: product.merchantId,
      name: product.name,
      price: product.price,
      description: product.description,
      image_url: product.imageUrl,
      calories: product.calories,
      protein: product.protein,
      carbs: product.carbs,
      fat: product.fat,
      tags: product.tags,
      ingredients: product.ingredients,
      detailed_nutrients: product.detailedNutrients,
      status: 'PENDING'
    });

    if (error) {
      console.error(error);
      showToast('发布失败', 'error');
    } else {
      fetchData(); // Refresh
    }
  };

  const addRecipe = async (recipe: RecipeDetail & { category: string }) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const { error } = await supabase.from('recipes').insert({
      author_id: user.id,
      title: recipe.title,
      description: recipe.description,
      image_url: recipe.imageUrl,
      prep_time: recipe.prepTime,
      category: recipe.category,
      calories: recipe.calories,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      detailed_nutrients: recipe.detailedNutrients,
      status: 'APPROVED'
    });

    if (error) {
      console.error(error);
      showToast('发布失败', 'error');
    } else {
      fetchData();
    }
  };

  const updateProductStatus = async (id: string, status: ProductStatus) => {
    const { error } = await supabase.from('products').update({ status }).eq('id', id);
    if (!error) {
      showToast(`已更新为: ${status}`, 'success');
      fetchData();
    }
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      showToast('商品已删除', 'info');
      fetchData();
    }
  };

  const getMerchantProducts = (merchantId: string) => {
    return products.filter(p => p.merchantId === merchantId);
  };

  const getAllPendingProducts = () => {
    return products.filter(p => p.status === 'PENDING');
  };

  return (
    <PlatformContext.Provider value={{ 
      products, recipes,
      addProduct, addRecipe,
      updateProductStatus, deleteProduct,
      getMerchantProducts, getAllPendingProducts
    }}>
      {children}
    </PlatformContext.Provider>
  );
};
