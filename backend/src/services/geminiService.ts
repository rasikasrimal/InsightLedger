import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { getGeminiApiKey } from '../config/gemini';

const modelName = process.env.GEMINI_MODEL || 'gemini-flash-latest';

const buildClient = () => {
  const apiKey = getGeminiApiKey();
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
};

export const generateFinancialAnswer = async (prompt: string): Promise<string> => {
  const model = buildClient();

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE }
      ]
    });

    const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text;
    return text?.trim() || 'I could not generate an insight right now. Please try again.';
  } catch (error: any) {
    console.error('Gemini generate error:', error?.message || error);
    throw new Error(error?.message || 'Gemini request failed');
  }
};
