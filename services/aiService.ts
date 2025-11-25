import { FoodAnalysisResult, IdentifiedFood, Ingredient } from "../types";

// ⚠️ 注意：在生产环境中，API Key 应存储在服务器端或环境变量中，不要直接暴露在前端代码里。
// 为了方便您测试，这里使用了您提供的 Key。
const API_KEY = "sk-8b944a2e69ae4ff695d107203e80fae9";

// 使用本地代理路径，解决跨域问题
const API_ENDPOINT = "/qwen-api/chat/completions";

/**
 * 通用 Fetch 函数，用于调用通义千问 API
 */
const callQwenAPI = async (messages: any[], model: string = "qwen-turbo") => {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.1, // 降低随机性，使 JSON 输出更稳定
        response_format: { type: "json_object" } // 强制返回 JSON 对象 (如果模型支持)
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) throw new Error("No content received from AI");

    // 清理可能存在的 Markdown 代码块标记 (```json ... ```)
    const jsonStr = content.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("Qwen API Call Failed:", error);
    throw error;
  }
};

/**
 * 辅助函数：标准化 Base64 字符串
 */
const formatBase64 = (dataUrl: string): string => {
  // Qwen VL 需要完整的 data URI (例如 data:image/jpeg;base64,...)
  // 如果输入已经是完整的 data URI，直接返回
  if (dataUrl.startsWith("data:")) return dataUrl;
  // 否则假设是 jpeg 并补全
  return `data:image/jpeg;base64,${dataUrl}`;
};

/**
 * 第一步：识别食物图片
 * 使用模型: qwen-vl-max
 */
export const identifyFoodFromImage = async (base64Image: string): Promise<IdentifiedFood> => {
  try {
    const formattedImage = formatBase64(base64Image);

    const messages = [
      {
        role: "system",
        content: "你是一个专业的营养师和食物识别助手。请识别用户上传的食物图片。"
      },
      {
        role: "user",
        content: [
          { 
            type: "text", 
            text: "请识别这张图片中的食物。如果是复杂的菜品，请分析其主要食材。请务必返回严格的 JSON 格式数据，结构如下：{ \"foodName\": \"菜名\", \"ingredients\": [{ \"name\": \"食材名\", \"amount\": \"估算重量(如100g)\" }] }" 
          },
          { 
            type: "image_url", 
            image_url: { "url": formattedImage } 
          }
        ]
      }
    ];

    // 使用 qwen-vl-max 进行视觉识别
    // 注意：VL 模型目前可能对 response_format: json_object 支持不完善，需要依赖 Prompt 约束
    // 这里我们手动 parse
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "qwen-vl-max",
        messages: messages
      })
    });

    if (!response.ok) throw new Error("Image identification failed");
    
    const data = await response.json();
    let content = data.choices?.[0]?.message?.content;
    
    if (!content) throw new Error("No content");

    // 尝试提取 JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as IdentifiedFood;
    } else {
      // 容错处理
      return { foodName: content.substring(0, 20), ingredients: [] };
    }

  } catch (error) {
    console.error("Identification Failed:", error);
    return {
      foodName: "识别超时/失败",
      ingredients: [{ name: "未知食材", amount: "适量" }]
    };
  }
};

/**
 * 第二步：详细营养分析
 * 使用模型: qwen-plus (或 qwen-turbo)
 */
export const analyzeNutritionFromIngredients = async (foodName: string, ingredients: Ingredient[]): Promise<FoodAnalysisResult> => {
  try {
    const ingredientsStr = ingredients.map(i => `${i.name} ${i.amount}`).join(', ');
    
    const messages = [
      {
        role: "system",
        content: "你是一个专业的营养分析引擎。请根据提供的食物名称和配料，计算详细的营养成分。"
      },
      {
        role: "user",
        content: `
          请对以下食物进行详细营养分析。
          名称：${foodName}
          配料：${ingredientsStr}

          请返回严格的 JSON 格式数据，结构如下（不要包含任何Markdown标记）：
          {
            "foodName": "${foodName}",
            "healthScore": 85,
            "advice": "一句话健康建议",
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
              "vitamins": { "维生素A": { "value": "0μg", "nrvPercent": 0 }, "维生素C": { "value": "0mg", "nrvPercent": 0 } },
              "minerals": { "钙": { "value": "0mg", "nrvPercent": 0 }, "铁": { "value": "0mg", "nrvPercent": 0 } }
            }
          }
          注意：必须估算并填充详细的维生素(A/B/C/D/E)和矿物质(钙/铁/锌/钠/钾)数据。
        `
      }
    ];

    // 使用 qwen-plus 进行逻辑推理和知识库查询，它比 turbo 更聪明
    return await callQwenAPI(messages, "qwen-plus");

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
    advice: "AI服务暂时繁忙，这是为您生成的模拟分析结果。",
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
      minerals: { '钙': { value: '80mg', nrvPercent: 10 } }
    }
  };
};
