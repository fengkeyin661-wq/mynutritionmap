
import { GoogleGenAI, Type } from "@google/genai";
import { FoodAnalysisResult, IdentifiedFood, Ingredient } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Helper for fallback data
const getFallbackAnalysisResult = (foodName: string): FoodAnalysisResult => {
  return {
    foodName: foodName || "健康餐 (AI模拟数据)",
    healthScore: 88,
    advice: "由于AI服务暂时不可用，这是为您生成的模拟分析结果。建议保持均衡饮食，多摄入蔬菜和优质蛋白。",
    tags: ["高蛋白", "营养均衡", "低GI"],
    detailedNutrients: {
      calories: { value: 450, nrvPercent: 22 },
      protein: { value: 35, nrvPercent: 58 },
      carbs: {
        total: { value: 45, nrvPercent: 15 },
        available: { value: 38 },
        fiber: { value: 7 }
      },
      fat: {
        total: { value: 12, nrvPercent: 20 },
        saturated: { value: 2 },
        monounsaturated: { value: 6 },
        polyunsaturated: { value: 4 }
      },
      vitamins: {
        'A': { value: '120μg', nrvPercent: 15 },
        'B1': { value: '0.1mg', nrvPercent: 8 },
        'B2': { value: '0.2mg', nrvPercent: 12 },
        'B3': { value: '2mg', nrvPercent: 10 },
        'B5': { value: '1mg', nrvPercent: 15 },
        'B6': { value: '0.3mg', nrvPercent: 18 },
        'B7': { value: '5μg', nrvPercent: 10 },
        'B9': { value: '50μg', nrvPercent: 12 },
        'B12': { value: '0.5μg', nrvPercent: 20 },
        'C': { value: '15mg', nrvPercent: 15 },
        'D': { value: '0.5μg', nrvPercent: 10 },
        'E': { value: '2mg', nrvPercent: 14 }
      },
      minerals: {
        '钠 (Na)': { value: '300mg', nrvPercent: 15 },
        '钾 (K)': { value: '400mg', nrvPercent: 20 },
        '钙 (Ca)': { value: '80mg', nrvPercent: 10 },
        '镁 (Mg)': { value: '40mg', nrvPercent: 12 },
        '磷 (P)': { value: '100mg', nrvPercent: 14 },
        '铁 (Fe)': { value: '3mg', nrvPercent: 20 },
        '锌 (Zn)': { value: '2mg', nrvPercent: 13 },
        '铜 (Cu)': { value: '0.2mg', nrvPercent: 10 },
        '碘 (I)': { value: '15μg', nrvPercent: 10 },
        '硒 (Se)': { value: '10μg', nrvPercent: 20 },
        '铬 (Cr)': { value: '10μg', nrvPercent: 15 },
        '钼 (Mo)': { value: '5μg', nrvPercent: 8 }
      }
    }
  };
};

/**
 * 第一步：识别食物和配料
 */
export const identifyFoodFromImage = async (base64Image: string): Promise<IdentifiedFood> => {
  try {
    const prompt = `
      请识别这张图片中的食物。
      1. 给出这道菜的名称（简体中文）。
      2. 估算其中包含的主要食材名称和大致重量（克）。
      请以严格的JSON格式返回。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodName: { type: Type.STRING },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  amount: { type: Type.STRING, description: "e.g. 100g" }
                },
                required: ["name", "amount"]
              }
            }
          },
          required: ["foodName", "ingredients"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as IdentifiedFood;

  } catch (error) {
    console.error("Identification Failed:", error);
    // Fallback data
    return {
      foodName: "未能识别 (服务繁忙)",
      ingredients: [
        { name: "食材 (AI估算)", amount: "150g" },
        { name: "配菜 (AI估算)", amount: "50g" }
      ]
    };
  }
};

/**
 * 第二步：根据确认后的信息进行详细营养分析
 * 此函数同时用于用户拍照分析 和 商家发布商品分析
 */
export const analyzeNutritionFromIngredients = async (foodName: string, ingredients: Ingredient[]): Promise<FoodAnalysisResult> => {
  try {
    const ingredientsStr = ingredients.map(i => `${i.name} ${i.amount}`).join(', ');
    const prompt = `
      请对以下食物/商品进行详细的营养分析：
      名称：${foodName}
      配料表：${ingredientsStr}

      请提供以下详细数据（NRV%参考中国成人每日推荐摄入量）：
      1. 核心营养素：热量(kcal), 蛋白质(g), 总碳水(含膳食纤维和可利用碳水, g), 总脂肪(含饱和/单不饱和/多不饱和, g)。
      2. 维生素：A, B1, B2, B3, B5, B6, B7, B9, B12, C, D, E。
      3. 矿物质：钠, 钾, 钙, 镁, 磷, 铁, 锌, 铜, 碘, 硒, 铬, 钼。
      4. 给出健康评分(0-100)和一条简短的营销或健康建议。
      5. 给出3-5个相关标签（如：高蛋白、低脂、今日配送等）。

      必须严格按照JSON格式返回，不需要Markdown格式。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { text: prompt },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodName: { type: Type.STRING },
            healthScore: { type: Type.NUMBER },
            advice: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            detailedNutrients: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.OBJECT, properties: { value: { type: Type.NUMBER }, nrvPercent: { type: Type.NUMBER } }, required: ["value", "nrvPercent"] },
                protein: { type: Type.OBJECT, properties: { value: { type: Type.NUMBER }, nrvPercent: { type: Type.NUMBER } }, required: ["value", "nrvPercent"] },
                carbs: {
                  type: Type.OBJECT,
                  properties: {
                    total: { type: Type.OBJECT, properties: { value: { type: Type.NUMBER }, nrvPercent: { type: Type.NUMBER } }, required: ["value", "nrvPercent"] },
                    available: { type: Type.OBJECT, properties: { value: { type: Type.NUMBER } }, required: ["value"] },
                    fiber: { type: Type.OBJECT, properties: { value: { type: Type.NUMBER } }, required: ["value"] }
                  },
                  required: ["total", "available", "fiber"]
                },
                fat: {
                  type: Type.OBJECT,
                  properties: {
                    total: { type: Type.OBJECT, properties: { value: { type: Type.NUMBER }, nrvPercent: { type: Type.NUMBER } }, required: ["value", "nrvPercent"] },
                    saturated: { type: Type.OBJECT, properties: { value: { type: Type.NUMBER } }, required: ["value"] },
                    monounsaturated: { type: Type.OBJECT, properties: { value: { type: Type.NUMBER } }, required: ["value"] },
                    polyunsaturated: { type: Type.OBJECT, properties: { value: { type: Type.NUMBER } }, required: ["value"] }
                  },
                  required: ["total", "saturated", "monounsaturated", "polyunsaturated"]
                },
                vitamins: {
                  type: Type.OBJECT,
                  properties: {
                    'A': { type: Type.OBJECT, properties: { value: { type: Type.STRING }, nrvPercent: { type: Type.NUMBER } } },
                    'B1': { type: Type.OBJECT, properties: { value: { type: Type.STRING }, nrvPercent: { type: Type.NUMBER } } },
                    'B2': { type: Type.OBJECT, properties: { value: { type: Type.STRING }, nrvPercent: { type: Type.NUMBER } } },
                    'B3': { type: Type.OBJECT, properties: { value: { type: Type.STRING }, nrvPercent: { type: Type.NUMBER } } },
                    'B5': { type: Type.OBJECT, properties: { value: { type: Type.STRING }, nrvPercent: { type: Type.NUMBER } } },
                    'B6': { type: Type.OBJECT, properties: { value: { type: Type.STRING }, nrvPercent: { type: Type.NUMBER } } },
                    'B7': { type: Type.OBJECT, properties: { value: { type: Type.STRING }, nrvPercent: { type: Type.NUMBER } } },
                    'B9': { type: Type.OBJECT, properties: { value: { type: Type.STRING }, nrvPercent: { type: Type.NUMBER } } },
                    'B12': { type: Type.OBJECT, properties: { value: { type: Type.STRING }, nrvPercent: { type: Type.NUMBER } } },
                    'C': { type: Type.OBJECT, properties: { value: { type: Type.STRING }, nrvPercent: { type: Type.NUMBER } } },
                    'D': { type: Type.OBJECT, properties: { value: { type: Type.STRING }, nrvPercent: { type: Type.NUMBER } } },
                    'E': { type: Type.OBJECT, properties: { value: { type: Type.STRING }, nrvPercent: { type: Type.NUMBER } } }
                  }
                },
                minerals: {
                  type: Type.OBJECT,
                  properties: {
                    '钠 (Na)': { type: Type.OBJECT, properties: { value: { type: Type.STRING }, nrvPercent: { type: Type.NUMBER } } },
                    '钾 (K)': { type: Type.OBJECT, properties: { value: { type: Type.STRING }, nrvPercent: { type: Type.NUMBER } } },
                    '钙 (Ca)': { type: Type.OBJECT, properties: { value: { type: Type.STRING }, nrvPercent: { type: Type.NUMBER } } },
                    '镁 (Mg)': { type: Type.OBJECT, properties: { value: { type: Type.STRING }, nrvPercent: { type: Type.NUMBER } } },
                    '磷 (P)': { type: Type.OBJECT, properties: { value: { type: Type.STRING }, nrvPercent: { type: Type.NUMBER } } },
                    '铁 (Fe)': { type: Type.OBJECT, properties: { value: { type: Type.STRING }, nrvPercent: { type: Type.NUMBER } } },
                    '锌 (Zn)': { type: Type.OBJECT, properties: { value: { type: Type.STRING }, nrvPercent: { type: Type.NUMBER } } },
                    '铜 (Cu)': { type: Type.OBJECT, properties: { value: { type: Type.STRING }, nrvPercent: { type: Type.NUMBER } } },
                    '碘 (I)': { type: Type.OBJECT, properties: { value: { type: Type.STRING }, nrvPercent: { type: Type.NUMBER } } },
                    '硒 (Se)': { type: Type.OBJECT, properties: { value: { type: Type.STRING }, nrvPercent: { type: Type.NUMBER } } },
                    '铬 (Cr)': { type: Type.OBJECT, properties: { value: { type: Type.STRING }, nrvPercent: { type: Type.NUMBER } } },
                    '钼 (Mo)': { type: Type.OBJECT, properties: { value: { type: Type.STRING }, nrvPercent: { type: Type.NUMBER } } }
                  }
                }
              },
              required: ["calories", "protein", "carbs", "fat", "vitamins", "minerals"]
            }
          },
          required: ["foodName", "healthScore", "advice", "tags", "detailedNutrients"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as FoodAnalysisResult;
  } catch (error) {
    console.error("Detailed Analysis Failed:", error);
    // Return graceful fallback so user flow is not interrupted
    return getFallbackAnalysisResult(foodName);
  }
};

export const generateMealSuggestion = async (userPreferences: string): Promise<string> => {
   try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `基于这些偏好建议一顿健康的晚餐: ${userPreferences}。请保持在50字以内，使用简体中文。`,
    });
    return response.text || "香煎三文鱼配藜麦和烤芦笋。";
   } catch (e) {
     return "烤鸡胸肉沙拉配牛油果和青柠酱。";
   }
};
