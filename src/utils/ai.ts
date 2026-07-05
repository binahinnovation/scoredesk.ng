// AI Utility - Uses Gemini API for generating content
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function generateWithAI(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "AI generation failed.");
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No content generated.";
}
