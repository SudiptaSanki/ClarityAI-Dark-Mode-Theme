// ClarityAI Universal Multi-Provider AI Engine
// Supports Gemini, Groq (Free), OpenRouter (Free/Paid), OpenAI, Anthropic, DeepSeek, and Custom/Local endpoints.

export const AI_PROVIDERS = {
  gemini: {
    id: "gemini",
    name: "Google Gemini",
    badge: "Free Tier Available",
    isFreeTier: true,
    keyPlaceholder: "AIzaSy... or AQ...",
    keyUrl: "https://aistudio.google.com/app/apikey",
    keyInstructions: "1. Visit Google AI Studio (aistudio.google.com)\n2. Sign in with your Google account\n3. Click 'Create API key'\n4. Copy and paste your key here",
    defaultModel: "gemini-flash-latest",
    models: [
      { id: "gemini-flash-latest", name: "Gemini Flash (Latest Stable - Recommended)" },
      { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash (Fast & Reliable)" },
      { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash (Latest Preview)" },
      { id: "gemini-flash-lite-latest", name: "Gemini Flash Lite (Ultra-fast)" },
      { id: "gemini-pro-latest", name: "Gemini Pro (Latest Capable)" },
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash (Legacy keys only)" },
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro (Legacy keys only)" }
    ],
    format: "gemini",
    defaultEndpoint: "https://generativelanguage.googleapis.com/v1beta"
  },
  groq: {
    id: "groq",
    name: "Groq",
    badge: "100% Free & Ultra Fast",
    isFreeTier: true,
    keyPlaceholder: "gsk_...",
    keyUrl: "https://console.groq.com/keys",
    keyInstructions: "1. Go to console.groq.com/keys\n2. Sign in or create a free account\n3. Click 'Create API Key'\n4. Copy and paste your key here (Free & blazing fast)",
    defaultModel: "llama-3.3-70b-versatile",
    models: [
      { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B Versatile (Free, Highly Recommended)" },
      { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B Instant (Free, Fastest)" },
      { id: "deepseek-r1-distill-llama-70b", name: "DeepSeek R1 Distill Llama 70B (Free Reasoning)" },
      { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B (Free, 32k context)" },
      { id: "gemma2-9b-it", name: "Gemma 2 9B IT (Free, Google open weights)" }
    ],
    format: "openai",
    defaultEndpoint: "https://api.groq.com/openai/v1/chat/completions"
  },
  openrouter: {
    id: "openrouter",
    name: "OpenRouter",
    badge: "Free & Paid 200+ Models",
    isFreeTier: true,
    keyPlaceholder: "sk-or-v1-...",
    keyUrl: "https://openrouter.ai/keys",
    keyInstructions: "1. Go to openrouter.ai/keys\n2. Create a free account & click 'Create Key'\n3. Models tagged ':free' require zero balance to use!",
    defaultModel: "meta-llama/llama-3.3-70b-instruct:free",
    models: [
      { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B (Free)" },
      { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0 Flash Exp (Free)" },
      { id: "deepseek/deepseek-r1:free", name: "DeepSeek R1 (Free)" },
      { id: "mistralai/mistral-7b-instruct:free", name: "Mistral 7B Instruct (Free)" },
      { id: "openai/gpt-4o-mini", name: "OpenAI GPT-4o Mini (Paid)" },
      { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet (Paid)" }
    ],
    format: "openai",
    defaultEndpoint: "https://openrouter.ai/api/v1/chat/completions"
  },
  openai: {
    id: "openai",
    name: "OpenAI",
    badge: "Industry Standard",
    isFreeTier: false,
    keyPlaceholder: "sk-proj-...",
    keyUrl: "https://platform.openai.com/api-keys",
    keyInstructions: "1. Go to platform.openai.com/api-keys\n2. Create a new secret key\n3. Copy and paste it here",
    defaultModel: "gpt-4o-mini",
    models: [
      { id: "gpt-4o-mini", name: "GPT-4o Mini (Fast & Affordable)" },
      { id: "gpt-4o", name: "GPT-4o (Flagship Multimodal)" },
      { id: "o3-mini", name: "o3-mini (Advanced Reasoning)" },
      { id: "o1-mini", name: "o1-mini (Reasoning)" },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo (Legacy)" }
    ],
    format: "openai",
    defaultEndpoint: "https://api.openai.com/v1/chat/completions"
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic Claude",
    badge: "Advanced Analysis",
    isFreeTier: false,
    keyPlaceholder: "sk-ant-...",
    keyUrl: "https://console.anthropic.com/settings/keys",
    keyInstructions: "1. Go to console.anthropic.com/settings/keys\n2. Create an API key\n3. Copy and paste it here",
    defaultModel: "claude-3-5-haiku-latest",
    models: [
      { id: "claude-3-5-haiku-latest", name: "Claude 3.5 Haiku (Fast & Crisp)" },
      { id: "claude-3-7-sonnet-latest", name: "Claude 3.7 Sonnet (Latest Flagship)" },
      { id: "claude-3-5-sonnet-latest", name: "Claude 3.5 Sonnet" },
      { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku" }
    ],
    format: "anthropic",
    defaultEndpoint: "https://api.anthropic.com/v1/messages"
  },
  deepseek: {
    id: "deepseek",
    name: "DeepSeek",
    badge: "Cost-Effective AI",
    isFreeTier: false,
    keyPlaceholder: "sk-...",
    keyUrl: "https://platform.deepseek.com/api_keys",
    keyInstructions: "1. Visit platform.deepseek.com/api_keys\n2. Create an API key\n3. Copy and paste it here",
    defaultModel: "deepseek-chat",
    models: [
      { id: "deepseek-chat", name: "DeepSeek Chat (V3)" },
      { id: "deepseek-reasoner", name: "DeepSeek Reasoner (R1)" }
    ],
    format: "openai",
    defaultEndpoint: "https://api.deepseek.com/v1/chat/completions"
  },
  custom: {
    id: "custom",
    name: "Custom / Local (Ollama, LM Studio)",
    badge: "100% Private & Free",
    isFreeTier: true,
    keyPlaceholder: "Optional API Key (or leave blank)",
    keyUrl: "https://ollama.com",
    keyInstructions: "Use local servers (e.g. Ollama http://localhost:11434/v1, LM Studio http://localhost:1234/v1) or any OpenAI-compatible API gateway.",
    defaultModel: "llama3",
    models: [
      { id: "llama3", name: "Llama 3" },
      { id: "mistral", name: "Mistral" },
      { id: "deepseek-r1", name: "DeepSeek R1" },
      { id: "qwen2.5", name: "Qwen 2.5" },
      { id: "phi3", name: "Phi-3" }
    ],
    format: "openai",
    defaultEndpoint: "http://localhost:11434/v1/chat/completions"
  }
};

/**
 * Executes a call to the selected AI provider
 */
export async function executeAICall({
  provider = "gemini",
  apiKey = "",
  model = "",
  customEndpoint = "",
  systemPrompt = "You are ClarityAI, an intelligent consultation and summarization assistant. Analyze the provided text with precision, clarity, and insightful structure.",
  userPrompt = "",
  temperature = 0.2
}) {
  const providerConfig = AI_PROVIDERS[provider] || AI_PROVIDERS.gemini;
  const activeModel = model || providerConfig.defaultModel;

  if (!apiKey && provider !== "custom") {
    throw new Error(`API key is required for ${providerConfig.name}. Please configure your API key in Settings.`);
  }

  if (providerConfig.format === "gemini") {
    return callGeminiAPI({ apiKey, model: activeModel, systemPrompt, userPrompt, temperature });
  } else if (providerConfig.format === "anthropic") {
    return callAnthropicAPI({ apiKey, model: activeModel, customEndpoint, systemPrompt, userPrompt, temperature });
  } else {
    // OpenAI-compatible format (OpenAI, Groq, OpenRouter, DeepSeek, Custom/Local)
    const endpoint = customEndpoint || providerConfig.defaultEndpoint;
    return callOpenAICompatibleAPI({
      providerId: provider,
      endpoint,
      apiKey,
      model: activeModel,
      systemPrompt,
      userPrompt,
      temperature
    });
  }
}

/**
 * Gemini API implementation with retry and dynamic load fallback
 */
async function callGeminiAPI({ apiKey, model, systemPrompt, userPrompt, temperature }) {
  let cleanModel = model.replace(/^models\//, "");
  const maxRetries = 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(cleanModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const body = {
      contents: [
        {
          role: "user",
          parts: [
            { text: `${systemPrompt}\n\n${userPrompt}` }
          ]
        }
      ],
      generationConfig: {
        temperature: temperature ?? 0.2
      }
    };

    let response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
    } catch (netErr) {
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      throw new Error(`Gemini connection error: ${netErr.message}`);
    }

    if (!response.ok) {
      const errorDetails = await parseErrorResponse(response);

      // Handle 503 (High Demand) or 429 (Rate Limit) with smart retry & capacity fallback
      if ((response.status === 503 || response.status === 429) && attempt < maxRetries) {
        // If 503 on a specific model (e.g. 3.5 or 3.8), route to gemini-flash-latest to avoid waiting
        if (response.status === 503 && cleanModel !== "gemini-flash-latest") {
          console.warn(`Model ${cleanModel} overloaded (503). Switching to gemini-flash-latest for capacity.`);
          cleanModel = "gemini-flash-latest";
        }
        const waitTime = (attempt + 1) * 1200;
        await new Promise(r => setTimeout(r, waitTime));
        continue;
      }

      if (response.status === 503) {
        throw new Error(`Gemini servers are experiencing temporary high demand. Please try again in a few moments, or select Groq (100% Free & Instant) in Settings.`);
      } else if (response.status === 429) {
        throw new Error(`Gemini rate limit exceeded. Please wait a short moment before trying again.`);
      } else if (response.status === 403 || response.status === 400) {
        throw new Error(`Gemini Error (${response.status}): ${errorDetails || 'Invalid API key or model'}`);
      } else if (response.status === 404) {
        if (model.includes("2.5") || model.includes("1.5") || model.includes("2.0")) {
          throw new Error(`Model '${model}' has been retired by Google for newly created API keys. Please select 'Gemini Flash (Latest Stable)' or 'gemini-flash-latest' in Settings.`);
        }
        throw new Error(`Model '${model}' not found in Gemini API (${errorDetails || '404'}). Try selecting 'gemini-flash-latest' in Settings.`);
      }
      throw new Error(`Gemini API error (${response.status}): ${errorDetails}`);
    }

    const data = await response.json();
    const candidate = data?.candidates?.[0];

    if (!candidate) {
      throw new Error("No response generated by Gemini API.");
    }

    if (candidate.finishReason === "SAFETY") {
      throw new Error("The response was filtered by Gemini safety settings.");
    }

    const text = candidate.content?.parts?.map(p => p.text || "").join("").trim();
    if (!text) {
      throw new Error("Empty response returned from Gemini.");
    }
    return text;
  }
}

/**
 * OpenAI-compatible API implementation (OpenAI, Groq, OpenRouter, DeepSeek, Local)
 */
async function callOpenAICompatibleAPI({ providerId, endpoint, apiKey, model, systemPrompt, userPrompt, temperature }) {
  const headers = {
    "Content-Type": "application/json"
  };

  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey.trim()}`;
  }

  // OpenRouter requires/recommends these attribution headers
  if (providerId === "openrouter") {
    headers["HTTP-Referer"] = "https://github.com/SudiptaSanki/ClarityAI-extension-Dark-Mode-Theme";
    headers["X-Title"] = "ClarityAI Extension";
  }

  const body = {
    model: model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: temperature ?? 0.2
  };

  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });
  } catch (netErr) {
    throw new Error(`Connection to ${endpoint} failed: ${netErr.message}. If using a local model, verify the server is running.`);
  }

  if (!response.ok) {
    const errorDetails = await parseErrorResponse(response);
    if (response.status === 401) {
      throw new Error(`Invalid API key for ${providerId.toUpperCase()}. Please check your key in Settings.`);
    } else if (response.status === 429) {
      throw new Error(`Rate limit reached on ${providerId.toUpperCase()}. Please wait a short while.`);
    } else if (response.status === 404) {
      throw new Error(`Model '${model}' not found or endpoint URL is invalid (${endpoint}).`);
    }
    throw new Error(`${providerId.toUpperCase()} API error (${response.status}): ${errorDetails}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error(`No content returned by ${providerId.toUpperCase()}.`);
  }
  return content.trim();
}

/**
 * Anthropic API implementation
 */
async function callAnthropicAPI({ apiKey, model, customEndpoint, systemPrompt, userPrompt, temperature }) {
  const endpoint = customEndpoint || "https://api.anthropic.com/v1/messages";
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": apiKey.trim(),
    "anthropic-version": "2023-06-01",
    "anthropic-dangerous-direct-browser-access": "true"
  };

  const body = {
    model: model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      { role: "user", content: userPrompt }
    ],
    temperature: temperature ?? 0.2
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorDetails = await parseErrorResponse(response);
    if (response.status === 401) {
      throw new Error(`Invalid Anthropic API key. Please check your settings.`);
    } else if (response.status === 429) {
      throw new Error(`Anthropic rate limit reached. Please wait a moment.`);
    }
    throw new Error(`Anthropic API error (${response.status}): ${errorDetails}`);
  }

  const data = await response.json();
  const textParts = (data?.content || []).filter(c => c.type === "text").map(c => c.text);
  const result = textParts.join("").trim();
  if (!result) {
    throw new Error("No response returned by Anthropic Claude.");
  }
  return result;
}

/**
 * Helper to parse error details from fetch response
 */
async function parseErrorResponse(response) {
  try {
    const text = await response.text();
    try {
      const json = JSON.parse(text);
      return json?.error?.message || json?.error || json?.message || text;
    } catch {
      return text.slice(0, 300);
    }
  } catch {
    return response.statusText || `Status ${response.status}`;
  }
}

/**
 * Tests connection with the given provider, model, and key
 */
export async function testConnection({ provider, apiKey, model, customEndpoint }) {
  const startTime = Date.now();
  const testPrompt = "Please respond with 'ClarityAI connection successful' if you can read this.";
  const result = await executeAICall({
    provider,
    apiKey,
    model,
    customEndpoint,
    systemPrompt: "You are a test responder. Keep your answer brief and affirmative.",
    userPrompt: testPrompt,
    temperature: 0.1
  });
  const latency = Date.now() - startTime;
  return {
    success: true,
    latency,
    response: result
  };
}
