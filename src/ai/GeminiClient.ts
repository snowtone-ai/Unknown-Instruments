import { buildInstrumentPrompt } from './prompts';
import { instrumentResponseSchema } from './schema';
import { validateAndClampInstrument } from './validator';
import type { Instrument } from '../types';

export async function generateInstrument(userText: string, configuredApiKey?: string): Promise<Instrument> {
  const apiKey = configuredApiKey || (import.meta.env.VITE_GEMINI_API_KEY as string | undefined);
  const model = (import.meta.env.VITE_GEMINI_MODEL as string | undefined) ?? 'gemini-2.5-flash';
  if (!apiKey) throw new Error('Gemini APIキーが設定されていません。Settingsで入力するか .env.local に VITE_GEMINI_API_KEY を設定してください。');

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const body = {
    contents: [{ parts: [{ text: buildInstrumentPrompt(userText) }] }],
    generationConfig: {
      responseFormat: {
        text: {
          mimeType: 'application/json',
          schema: instrumentResponseSchema,
        },
      },
    },
  };

  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const message = `Gemini request failed with status ${response.status}`;
        if (!isRetryableStatus(response.status)) throw new Error(message);
        throw new RetryableGeminiError(message);
      }
      const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const cleanJson = rawText.replace(/```json\s*|```\s*/g, '').trim();
      if (!cleanJson) throw new Error('Gemini response did not include JSON text.');
      return validateAndClampInstrument(JSON.parse(cleanJson), userText);
    } catch (error) {
      lastError = error;
      if (!(error instanceof RetryableGeminiError) || attempt === 2) break;
      await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Gemini generation failed.');
}

class RetryableGeminiError extends Error {}

function isRetryableStatus(status: number): boolean {
  return status === 429 || (status >= 500 && status < 600);
}
