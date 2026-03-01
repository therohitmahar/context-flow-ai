import type { AIPayload } from '../types';

export async function generateOutput(payload: AIPayload): Promise<string> {
  const model = payload.model || 'gemini-2.5-flash';

  // Build the prompt from the payload
  const parts: string[] = [];

  // System memory (always-on context)
  if (payload.systemMemory.length > 0) {
    parts.push('## System Context (Always Active)');
    for (const mem of payload.systemMemory) {
      parts.push(`### ${mem.title}\n${mem.content}`);
      if (mem.instruction) parts.push(`_Instruction: ${mem.instruction}_`);
    }
    parts.push('');
  }

  // Connected context blocks
  if (payload.contexts.length > 0) {
    parts.push('## Context Blocks');
    for (const ctx of payload.contexts) {
      parts.push(`### @${ctx.title}\n${ctx.content}`);
      if (ctx.instruction) parts.push(`_Instruction: ${ctx.instruction}_`);
    }
    parts.push('');
  }

  // User prompt / instructions
  parts.push('## User Instructions');
  parts.push(payload.instructions);

  const fullPrompt = parts.join('\n');

  try {
    let response;

    // LOCAL DEV FALLBACK:
    // Vite's `npm run dev` doesn't run Vercel's `api/` folder.
    // So in local dev mode, we'll try to call Google directly if VITE_GEMINI_API_KEY is present in .env
    const localKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (import.meta.env.DEV && localKey) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${localKey}`;
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 2048 },
        }),
      });
    } else {
      // PRODUCTION (Vercel): Call our secure Vercel Serverless backend
      response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, fullPrompt }),
      });
    }

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Gemini API error:', response.status, errBody);
      throw new Error(`Gemini API returned ${response.status}: ${errBody}`);
    }

    const data = await response.json();

    // Extract text from the Gemini response
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      'No response generated. Please try again.';

    return text;
  } catch (error) {
    console.error('Gemini API call failed:', error);
    // Return a user-friendly error message instead of crashing
    const errMsg = error instanceof Error ? error.message : String(error);
    return `⚠️ **Gemini API Error**\n\n${errMsg}\n\nPlease check your API key and quota, then try again.`;
  }
}
