
import OpenAI from "openai";
import { FoodAnalysisResult, IdentifiedFood, Ingredient } from "../types";

// 初始化 OpenAI 客户端，配置阿里云 DashScope 的 BaseURL
// 注意：在浏览器端使用 dangerouslyAllowBrowser: true 是必须的，但请确保 Key 的安全
const client = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY || '',
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  dangerouslyAllowBrowser: true 
});

/**
 * 辅助函数：清理 JSON 字符串（去除 Markdown 代码块）
 */
const cleanJsonString = (str: string) => {
  return str.replace(/^```json\s*/, '').replace(/\s*```$/, '');
};

/**
 * 第一步：识别食物图片
 * 模型：qwen-vl-max
 */
export const identifyFoodFromImage = async (base64Image: string): Promise<IdentifiedFood> => {
  if (!process.env.DASHSCOPE_API_KEY) {
    console.warn("Missing DASHSCOPE_API_KEY, using mock fallback.");
    return {
      foodName: "识别功能需配置API Key",
      ingredients: [{ name: "示例食材", amount: "100g" }]
    };
  }

  try {
    const response = await client.chat.completions.create({
      model: "qwen-vl-max",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: '请识别图中的食物。请务必返回纯 JSON 格式：{ "foodName": "菜名", "ingredients": [{ "name": "食材名", "amount": "估算重量(如100g)" }] }。不要包含任何 markdown 标记。' },
            {
              type: "image_url",
              image_url: {
                url: base64Image
              }
            }
          ]
        }
      ],
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No response from AI");
    
    const jsonStr = cleanJsonString(content);
    return JSON.parse(jsonStr) as IdentifiedFood;

  } catch (error) {
    console.error("Identification Failed:", error);
    return {
      foodName: "识别失败 (请重试)",
      ingredients: [{ name: "未知食材", amount: "适量" }]
    };
  }
};

/**
 * 第二步：详细营养分析
 * 模型：qwen-plus
 */
export const analyzeNutritionFromIngredients = async (foodName: string, ingredients: Ingredient[]): Promise<FoodAnalysisResult> => {
  if (!process.env.DASHSCOPE_API_KEY) {
    console.warn("Missing DASHSCOPE_API_KEY, using mock fallback.");
    return getFallbackAnalysisResult(foodName);
  }

  try {
    const ingredientsStr = ingredients.map(i => `${i.name} ${i.amount}`).join(', ');
    const prompt = `
      请对以下食物进行详细营养分析。
      名称：${foodName}
      配料：${ingredientsStr}

      请返回严格的 JSON 格式数据，不要使用 markdown 代码块，结构如下：
      {
        "foodName": "${foodName}",
        "healthScore": 85,
        "advice": "简短建议(50字以内)",
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
          "vitamins": { "A": { "value": "0μg", "nrvPercent": 0 }, "C": { "value": "0mg", "nrvPercent": 0 } },
          "minerals": { "钙 (Ca)": { "value": "0mg", "nrvPercent": 0 }, "铁 (Fe)": { "value": "0mg", "nrvPercent": 0 } }
        }
      }
      注意：请尽可能补全常见的维生素(A/B族/C/D/E)和矿物质(钠钾钙镁铁锌等)。如果数据不确定，请基于配料进行科学估算。
    `;

    const response = await client.chat.completions.create({
      model: "qwen-plus",
      messages: [
        { role: "system", content: "你是一个专业的营养师AI助手，请只输出 JSON 数据。" },
        { role: "user", content: prompt }
      ]
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No response from AI");

    const jsonStr = cleanJsonString(content);
    return JSON.parse(jsonStr) as FoodAnalysisResult;

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
    advice: "AI服务暂时不可用，这是为您生成的模拟分析结果。请检查网络连接。",
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
