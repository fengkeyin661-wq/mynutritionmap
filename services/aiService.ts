import { GoogleGenAI, Type } from "@google/genai";
import { FoodAnalysisResult, IdentifiedFood, Ingredient } from "../types";

// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * 辅助函数：从 Data URL 解析 MIME 和 Base64
 */
const parseBase64 = (dataUrl: string) => {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    // 尝试直接作为 base64 处理，假设 jpeg
    return { mimeType: 'image/jpeg', data: dataUrl.replace(/^data:image\/\w+;base64,/, '') };
  }
  return { mimeType: matches[1], data: matches[2] };
};

/**
 * 第一步：识别食物图片
 */
export const identifyFoodFromImage = async (base64Image: string): Promise<IdentifiedFood> => {
  try {
    const { mimeType, data } = parseBase64(base64Image);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: data
            }
          },
          {
            text: '请识别图中的食物。返回JSON格式：{ "foodName": "菜名", "ingredients": [{ "name": "食材名", "amount": "估算重量(如100g)" }] }'
          }
        ]
      },
      config: {
        responseMimeType: 'application/json',
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
                  amount: { type: Type.STRING }
                },
                required: ['name', 'amount']
              }
            }
          },
          required: ['foodName', 'ingredients']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as IdentifiedFood;

  } catch (error) {
    console.error("Identification Failed:", error);
    return {
      foodName: "识别失败 (请手动输入)",
      ingredients: [{ name: "食材", amount: "适量" }]
    };
  }
};

/**
 * 第二步：详细营养分析
 */
export const analyzeNutritionFromIngredients = async (foodName: string, ingredients: Ingredient[]): Promise<FoodAnalysisResult> => {
  try {
    const ingredientsStr = ingredients.map(i => `${i.name} ${i.amount}`).join(', ');
    const prompt = `
      请对以下食物进行详细营养分析。
      名称：${foodName}
      配料：${ingredientsStr}

      请返回严格的 JSON 格式数据，结构如下：
      {
        "foodName": "${foodName}",
        "healthScore": 85,
        "advice": "简短建议",
        "tags": ["标签1", "标签2"],
        "detailedNutrients": {
          "calories": { "value": 0, "nrvPercent": 0 },
          "protein": { "value": 0, "nrvPercent": 0 },
          "carbs": {
            "total": { "value": 0, "nrvPercent": 0 },
            "available": { "value": 0 },
            "fiber": { "value": 0 }
          },
          "fat": {
            "total": { "value": 0, "nrvPercent": 0 },
            "saturated": { "value": 0 },
            "monounsaturated": { "value": 0 },
            "polyunsaturated": { "value": 0 }
          },
          "vitamins": { "A": { "value": "0μg", "nrvPercent": 0 } ... },
          "minerals": { "钙 (Ca)": { "value": "0mg", "nrvPercent": 0 } ... }
        }
      }
      注意：请补全常见的维生素(A/B族/C/D/E)和矿物质(钠钾钙镁铁锌等)。仅返回JSON。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
        // Skip responseSchema to allow flexible keys for vitamins/minerals maps
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as FoodAnalysisResult;

  } catch (error) {
    console.error("Detailed Analysis Failed:", error);
    return getFallbackAnalysisResult(foodName);
  }
};

// Fallback Data (当 API 不可用时)
const getFallbackAnalysisResult = (foodName: string): FoodAnalysisResult => {
  return {
    foodName: foodName || "健康餐 (模拟数据)",
    healthScore: 88,
    advice: "AI服务暂时不可用，这是为您生成的模拟分析结果。请检查API Key配置。",
    tags: ["高蛋白", "模拟数据"],
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
      vitamins: { 'C': { value: '15mg', nrvPercent: 15 } },
      minerals: { '钙 (Ca)': { value: '80mg', nrvPercent: 10 } }
    }
  };
};