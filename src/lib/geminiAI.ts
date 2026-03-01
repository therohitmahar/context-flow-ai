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
    // Call our secure Vercel Serverless backend instead of Google directly
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, fullPrompt }),
    });

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
