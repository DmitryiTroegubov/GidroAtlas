// Gemini API integration for chatbot
// Uses Google's Generative AI API

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent';

interface GeminiMessage {
  role: 'user' | 'model';
  content: string;
}

interface GeminiRequest {
  contents: Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  }>;
  systemInstruction?: {
    parts: Array<{ text: string }>;
  };
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
      role: 'model';
    };
  }>;
}

export async function sendGeminiMessage(
  userMessage: string,
  conversationHistory: GeminiMessage[] = []
): Promise<{ reply: string; error: any }> {
  if (!GEMINI_API_KEY) {
    return { reply: '', error: 'Gemini API key not configured' };
  }

  try {
    // Build conversation history
    const contents = [
      ...conversationHistory.map((msg) => ({
        role: msg.role as 'user' | 'model',
        parts: [{ text: msg.content }],
      })),
      {
        role: 'user' as const,
        parts: [{ text: userMessage }],
      },
    ];

    const request: GeminiRequest = {
      contents,
      systemInstruction: {
        parts: [
          {
            text: `You are a helpful assistant for ГидроАтлас, a water resources monitoring system for Kazakhstan. 
You help users with questions about water objects, monitoring data, and system features. 
Answer in Russian if the user writes in Russian, otherwise in English.
Be concise and friendly in your responses.`,
          },
        ],
      },
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { reply: '', error: errorData.error || `API error: ${response.status}` };
    }

    const data: GeminiResponse = await response.json();

    if (data.candidates && data.candidates.length > 0) {
      const reply = data.candidates[0].content.parts[0].text;
      return { reply, error: null };
    }

    return { reply: '', error: 'No response from Gemini' };
  } catch (error: any) {
    console.error('Gemini API error:', error);
    return { reply: '', error: error.message || 'Failed to get response from Gemini' };
  }
}
