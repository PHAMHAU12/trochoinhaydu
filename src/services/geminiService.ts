/**
 * Gemini AI Service with Automatic Model Fallback & Retry
 * Following rules in AI_INSTRUCTIONS.md
 */

import { GoogleGenAI } from '@google/genai';

export interface AIModelOption {
  id: string;
  name: string;
  tag: string;
  badge: string;
  desc: string;
}

export const AVAILABLE_MODELS: AIModelOption[] = [
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview',
    tag: 'Default',
    badge: 'Khuyên dùng',
    desc: 'Tốc độ phản hồi siêu nhanh, thông minh và tiết kiệm quota',
  },
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro Preview',
    tag: 'Pro',
    badge: 'Mạnh mẽ',
    desc: 'Suy luận sâu, độ chính xác cao cho các câu hỏi phức tạp',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    tag: 'Fallback',
    badge: 'Ổn định',
    desc: 'Mô hình dự phòng ổn định cao khi các bản preview quá tải',
  },
];

export const FALLBACK_MODELS_ORDER = [
  'gemini-3-flash-preview',
  'gemini-3-pro-preview',
  'gemini-2.5-flash',
];

const API_KEY_STORAGE_KEY = 'gemini_api_key';
const MODEL_STORAGE_KEY = 'selected_gemini_model';

export const getStoredApiKey = (): string => {
  try {
    const key = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (key && key.trim()) return key.trim();
  } catch {
    // Ignore localStorage errors
  }
  // Fallback to environment variables if configured
  return (
    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
    ''
  );
};

export const setStoredApiKey = (key: string): void => {
  try {
    if (key.trim()) {
      localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
  } catch {
    // Ignore
  }
};

export const getStoredModel = (): string => {
  try {
    const model = localStorage.getItem(MODEL_STORAGE_KEY);
    if (model && AVAILABLE_MODELS.some((m) => m.id === model)) return model;
  } catch {
    // Ignore
  }
  return 'gemini-3-flash-preview';
};

export const setStoredModel = (modelId: string): void => {
  try {
    localStorage.setItem(MODEL_STORAGE_KEY, modelId);
  } catch {
    // Ignore
  }
};

export interface GenerateResult {
  text: string;
  modelUsed: string;
}

/**
 * Direct call with single model
 */
async function callGemini(apiKey: string, model: string, prompt: string): Promise<string> {
  // Use @google/genai SDK
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    const text = response.text;
    if (text) return text;
  } catch (sdkError: any) {
    // Fallback to direct REST API if SDK has bundling or browser quirks
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      const errMsg = errJson?.error?.message || `${res.status} ${res.statusText}`;
      const code = errJson?.error?.code || res.status;
      const status = errJson?.error?.status || '';
      throw new Error(`[${code} ${status}] ${errMsg}`.trim());
    }

    const data = await res.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidate) return candidate;
    throw new Error(sdkError?.message || 'Không nhận được phản hồi từ mô hình.');
  }
  throw new Error('Không nhận được phản hồi từ mô hình.');
}

/**
 * Generate content with automatic retry and model fallback
 * As mandated by AI_INSTRUCTIONS.md:
 * - Tự động thử lại ngay lập tức với model tiếp theo trong danh sách:
 *   1. gemini-3-flash-preview
 *   2. gemini-3-pro-preview
 *   3. gemini-2.5-flash
 * - Nếu tất cả thất bại -> báo lỗi đỏ nguyên văn từ API (VD: 429 RESOURCE_EXHAUSTED)
 */
export async function generateWithFallback(
  prompt: string,
  onRetry?: (failedModel: string, nextModel: string, errorMsg: string) => void
): Promise<GenerateResult> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    throw new Error('Chưa cấu hình API Key. Vui lòng bấm "Lấy API key để sử dụng app" trên Header để nhập key.');
  }

  const initialModel = getStoredModel();
  // Build fallback sequence starting with selected model, followed by the rest
  const modelsToTry = [
    initialModel,
    ...FALLBACK_MODELS_ORDER.filter((m) => m !== initialModel),
  ];

  let lastError: Error | null = null;

  for (let i = 0; i < modelsToTry.length; i++) {
    const currentModel = modelsToTry[i];
    try {
      const text = await callGemini(apiKey, currentModel, prompt);
      return { text, modelUsed: currentModel };
    } catch (err: any) {
      lastError = err;
      const errorMsg = err?.message || String(err);
      const nextModel = modelsToTry[i + 1];

      if (nextModel && onRetry) {
        onRetry(currentModel, nextModel, errorMsg);
      }
      // Continue to next model in loop
    }
  }

  // All models failed -> throw exact verbatim error message
  throw lastError || new Error('Tất cả các mô hình AI dự phòng đều gặp lỗi.');
}
