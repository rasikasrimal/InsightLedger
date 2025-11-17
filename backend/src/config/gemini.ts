// Centralized access to the Gemini API key so we never hardcode secrets.
export const getGeminiApiKey = (): string => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY is not set. Add it to your environment or .env file.');
  }
  return key;
};
