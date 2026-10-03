// ClarityAI Background Service Worker (Manifest V3 Module)
import { AI_PROVIDERS, executeAICall, testConnection } from "./utils/ai-providers.js";
import { buildConsultationPrompt, buildFollowUpPrompt } from "./utils/summarizer.js";

// Initialize extension defaults and context menu
chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.create({
    id: "ClarityAI-summarize",
    title: "Summarize with ClarityAI",
    contexts: ["page", "selection"]
  });

  // Check and migrate existing settings if needed
  const storage = await chrome.storage.local.get(null);
  const updates = {};

  if (!storage.provider) {
    // If user already had a geminiApiKey, default to gemini; otherwise groq or gemini
    updates.provider = storage.geminiApiKey ? "gemini" : "groq";
  }

  // Ensure apiKeys structure exists and migrate legacy keys
  const apiKeys = storage.apiKeys || {};
  if (storage.geminiApiKey && !apiKeys.gemini) {
    apiKeys.gemini = storage.geminiApiKey;
    updates.apiKeys = apiKeys;
  }
  if (!storage.apiKeys) {
    updates.apiKeys = apiKeys;
  }

  // Ensure models structure exists
  const models = storage.models || {};
  if (!models.gemini || models.gemini === "gemini-2.5-flash" || models.gemini === "gemini-1.5-flash") {
    models.gemini = "gemini-flash-latest";
    updates.models = models;
  }
  if (!storage.models) {
    updates.models = {
      gemini: "gemini-flash-latest",
      groq: "llama-3.3-70b-versatile",
      openrouter: "meta-llama/llama-3.3-70b-instruct:free",
      openai: "gpt-4o-mini",
      anthropic: "claude-3-5-haiku-latest",
      deepseek: "deepseek-chat",
      custom: "llama3"
    };
  }

  if (!storage.summaryStyle) {
    updates.summaryStyle = "short";
  }

  if (Object.keys(updates).length > 0) {
    await chrome.storage.local.set(updates);
  }
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "ClarityAI-summarize" || !tab?.id) return;
  try {
    await chrome.storage.local.set({ isSummarizing: true });

    const pageData = await extractTabContent(tab.id);
    if (!pageData || !pageData.text || pageData.text.length === 0) {
      throw new Error("No readable text found on this page.");
    }

    const settings = await getActiveAISettings();
    const { systemPrompt, userPrompt } = buildConsultationPrompt({
      title: pageData.title,
      url: pageData.url,
      text: pageData.text,
      style: settings.summaryStyle || "short",
      customFocus: ""
    });

    const summary = await executeAICall({
      provider: settings.provider,
      apiKey: settings.apiKey,
      model: settings.model,
      customEndpoint: settings.customEndpoint,
      systemPrompt,
      userPrompt,
      temperature: 0.2
    });

    await chrome.storage.local.set({
      lastSummary: summary,
      lastTitle: pageData.title,
      lastUrl: pageData.url,
      lastProvider: settings.provider,
      lastModel: settings.model,
      lastStyle: settings.summaryStyle || "short",
      lastPageText: pageData.text.substring(0, 15000),
      lastTimestamp: new Date().toISOString(),
      isSummarizing: false
    });

    if (tab.id) {
      chrome.action.openPopup?.();
    }
  } catch (error) {
    console.error("Context menu summarization error:", error);
    await chrome.storage.local.set({
      lastSummary: `❌ Error: ${error.message}`,
      isSummarizing: false
    });
  }
});

// Message listener for popup and options communications
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "SUMMARIZE_ACTIVE_TAB") {
    handleSummarizeActiveTab(message)
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }));
    return true; // asynchronous response
  }

  if (message?.type === "ASK_CONSULTATION") {
    handleConsultationQuestion(message)
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }

  if (message?.type === "TEST_API") {
    handleTestApi(message)
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }

  if (message?.type === "GET_ACTIVE_SETTINGS") {
    getActiveAISettings()
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }
});

/**
 * Handle Summarize Active Tab Request
 */
async function handleSummarizeActiveTab(message) {
  try {
    await chrome.storage.local.set({ isSummarizing: true, summarizingStartTime: Date.now() });

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      throw new Error("No active browser tab detected.");
    }

    const pageData = await extractTabContent(tab.id);
    if (!pageData || !pageData.text || pageData.text.trim().length === 0) {
      throw new Error("No readable text found on this page to analyze.");
    }

    const settings = await getActiveAISettings();
    const style = message.summaryStyle || settings.summaryStyle || "short";
    const customFocus = message.customFocus || "";

    const { systemPrompt, userPrompt } = buildConsultationPrompt({
      title: pageData.title,
      url: pageData.url,
      text: pageData.text,
      style: style,
      customFocus: customFocus
    });

    const summary = await executeAICall({
      provider: settings.provider,
      apiKey: settings.apiKey,
      model: settings.model,
      customEndpoint: settings.customEndpoint,
      systemPrompt,
      userPrompt,
      temperature: settings.temperature || 0.2
    });

    const record = {
      lastSummary: summary,
      lastTitle: pageData.title,
      lastUrl: pageData.url,
      lastProvider: settings.provider,
      lastModel: settings.model,
      lastStyle: style,
      lastPageText: pageData.text.substring(0, 15000),
      lastWordCount: pageData.wordCount,
      lastTimestamp: new Date().toISOString(),
      isSummarizing: false
    };

    await chrome.storage.local.set(record);

    return {
      summary,
      title: pageData.title,
      url: pageData.url,
      provider: settings.provider,
      model: settings.model,
      wordCount: pageData.wordCount
    };
  } catch (error) {
    await chrome.storage.local.set({ isSummarizing: false });
    throw error;
  }
}

/**
 * Handle Interactive Consultation Follow-up
 */
async function handleConsultationQuestion(message) {
  const { question, contextSummary = "", pageText = "" } = message;
  if (!question || !question.trim()) {
    throw new Error("Please enter a question to ask.");
  }

  const settings = await getActiveAISettings();
  const { systemPrompt, userPrompt } = buildFollowUpPrompt({
    contextSummary,
    pageText,
    question: question.trim()
  });

  const answer = await executeAICall({
    provider: settings.provider,
    apiKey: settings.apiKey,
    model: settings.model,
    customEndpoint: settings.customEndpoint,
    systemPrompt,
    userPrompt,
    temperature: 0.3
  });

  return { answer };
}

/**
 * Handle Test API connection
 */
async function handleTestApi(message) {
  const { provider, apiKey, model, customEndpoint } = message;
  return await testConnection({ provider, apiKey, model, customEndpoint });
}

/**
 * Helper to retrieve active provider, model, endpoint, and key
 */
async function getActiveAISettings() {
  const storage = await chrome.storage.local.get([
    "provider",
    "apiKeys",
    "geminiApiKey",
    "models",
    "customModel",
    "customEndpoints",
    "summaryStyle",
    "temperature"
  ]);

  const provider = storage.provider || (storage.geminiApiKey ? "gemini" : "groq");
  const providerDef = AI_PROVIDERS[provider] || AI_PROVIDERS.gemini;

  // Retrieve API key for active provider
  const apiKeys = storage.apiKeys || {};
  let apiKey = apiKeys[provider] || "";
  if (!apiKey && provider === "gemini" && storage.geminiApiKey) {
    apiKey = storage.geminiApiKey;
  }

  // Retrieve model
  const models = storage.models || {};
  let model = models[provider] || providerDef.defaultModel;
  if (storage.customModel && storage.customModel[provider]) {
    model = storage.customModel[provider];
  }

  // Retrieve custom endpoint if defined
  const customEndpoints = storage.customEndpoints || {};
  const customEndpoint = customEndpoints[provider] || providerDef.defaultEndpoint || "";

  return {
    provider,
    providerName: providerDef.name,
    apiKey,
    model,
    customEndpoint,
    summaryStyle: storage.summaryStyle || "short",
    temperature: typeof storage.temperature === "number" ? storage.temperature : 0.2
  };
}

/**
 * Robust in-page content extraction script executed on active tab
 */
async function extractTabContent(tabId) {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const pageTitle = document.title || "Untitled Page";
      const pageUrl = window.location.href || "";

      // Check selection first
      const selection = window.getSelection?.()?.toString()?.trim();
      if (selection && selection.length > 25) {
        return {
          title: pageTitle,
          url: pageUrl,
          text: selection,
          wordCount: selection.split(/\s+/).length
        };
      }

      // Filter tags that contain non-prose noise
      const excludedTags = new Set([
        "SCRIPT", "STYLE", "NOSCRIPT", "NAV", "HEADER", "FOOTER",
        "ASIDE", "DIALOG", "IFRAME", "SVG", "CANVAS", "FORM", "BUTTON"
      ]);

      const container = document.querySelector("article, main, [role='main'], #content, .post-content") || document.body;

      const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            let parent = node.parentElement;
            while (parent && parent !== container) {
              if (excludedTags.has(parent.tagName)) {
                return NodeFilter.FILTER_REJECT;
              }
              const classOrId = (parent.className || "") + " " + (parent.id || "");
              if (/advertisement|ad-container|cookie|banner|sidebar|newsletter/i.test(classOrId)) {
                return NodeFilter.FILTER_REJECT;
              }
              if (parent.style && (parent.style.display === "none" || parent.style.visibility === "hidden")) {
                return NodeFilter.FILTER_REJECT;
              }
              parent = parent.parentElement;
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );

      const parts = [];
      let node;
      let totalLength = 0;
      const maxChars = 30000;

      while ((node = walker.nextNode())) {
        const text = node.nodeValue?.replace(/\s+/g, " ")?.trim();
        if (text && text.length > 2) {
          parts.push(text);
          totalLength += text.length + 1;
          if (totalLength > maxChars) break;
        }
      }

      const fullText = parts.join("\n\n").trim();
      return {
        title: pageTitle,
        url: pageUrl,
        text: fullText,
        wordCount: fullText ? fullText.split(/\s+/).length : 0
      };
    }
  });

  return result;
}
