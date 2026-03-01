export const config = {
  runtime: 'edge', // Vercel Edge Runtime for faster cold starts
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  // Read the secret key securely from the server environment
  // Notice it does NOT have the VITE_ prefix, so it's never bundled to the frontend
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'GEMINI_API_KEY is not configured on the server.' }),
      { status: 500 }
    );
  }

  try {
    const { model, fullPrompt } = await req.json();

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-2.5-flash'}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: fullPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      return new Response(errBody, { status: response.status });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to proxy request to Gemini', details: String(error) }),
      { status: 500 }
    );
  }
}
