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

export const generateSuggestionPrompts = async (
  recentMessages: Array<{ role: string; content: string }>,
  financialData: any
): Promise<string[]> => {
  const model = buildClient();

  const recentMessagesJson = JSON.stringify(recentMessages);
  const financialDataJson = JSON.stringify(financialData, null, 2);

  const prompt = `You are a financial insights assistant for a web app called InsightLedger.

Primary job:
Generate SHORT, CLICKABLE SUGGESTION PROMPTS that help the user ask better questions about their money.

Context:
- The user is looking at an AI chat about personal finance and budgeting.
- You must respond ONLY with an array of suggestion texts, not full answers.
- Each suggestion should be something the user can click to send as a full question.

Knowledge style:
- Base your ideas on general concepts from personal finance books such as:
  - "Rich Dad Poor Dad"
  - "The Psychology of Money"
  - "I Will Teach You to Be Rich"
  - "Your Money or Your Life"
- DO NOT quote or paraphrase sentences from these books.
- Instead, use their *themes* (e.g., cashflow focus, safety margin, behavior & psychology, long-term thinking, compounding, risk, etc.).

App data (JSON):
- Recent chat messages (model + user):
  ${recentMessagesJson}
- Current month snapshot:
  ${financialDataJson}

What to output:
- A JSON array of 3–6 strings.
- Each string must be a natural language question the user might want to ask.
- Max length per suggestion: 80 characters.
- Make them specific, concrete, and helpful. Avoid vague prompts.

Tone & content guidelines:
- Focus on:
  - cashflow management
  - saving and investing habits
  - risk and safety margin
  - behavior & psychology around money
  - long-term thinking and building assets, not just cutting expenses
- Avoid:
  - giving specific investment product recommendations (no individual stocks, crypto, or tickers)
  - guarantees of returns
  - tax or legal advice

Examples of good suggestions (DO NOT reuse exactly, just use as style reference):
- "How can I turn part of this surplus into long-term investments?"
- "What spending habits are most likely to sabotage my savings goals?"
- "Given my budgets, what's a realistic monthly target for my emergency fund?"
- "Which categories should I tighten without hurting my lifestyle too much?"

Output format (VERY IMPORTANT):
- Respond with ONLY valid JSON, like:
  [
    "First suggestion here",
    "Second suggestion here",
    "Third suggestion here"
  ]
- No extra fields, no explanations, no prose outside the JSON array.`;

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
    if (!text) {
      throw new Error('No response from AI model');
    }

    // Extract JSON from response, handling markdown code blocks
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\s*/, '').replace(/```\s*$/, '').trim();
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\s*/, '').replace(/```\s*$/, '').trim();
    }

    const suggestions = JSON.parse(jsonText);
    
    if (!Array.isArray(suggestions)) {
      throw new Error('Response is not an array');
    }

    // Validate and filter suggestions
    const validSuggestions = suggestions
      .filter((s: any) => typeof s === 'string' && s.length > 0 && s.length <= 80)
      .slice(0, 6);

    if (validSuggestions.length < 3) {
      throw new Error('Not enough valid suggestions generated');
    }

    return validSuggestions;
  } catch (error: any) {
    console.error('Generate suggestions error:', error?.message || error);
    // Return fallback suggestions if AI fails
    return [
      'How can I improve my savings rate this month?',
      'What are my biggest spending categories and why?',
      'How close am I to my financial goals?',
      'What changes would help me reach my emergency fund target?'
    ];
  }
};
