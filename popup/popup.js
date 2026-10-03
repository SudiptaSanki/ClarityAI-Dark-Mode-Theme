import { exportSummaryToPDF } from "../utils/pdf-export.js";
import { AI_PROVIDERS } from "../utils/ai-providers.js";

// DOM Elements
const providerPill = document.getElementById("providerPill");
const pillText = document.getElementById("pillText");
const openSettingsBtn = document.getElementById("openSettingsBtn");

const summaryStyleSelect = document.getElementById("summaryStyle");
const customFocusInput = document.getElementById("customFocusInput");
const summarizeBtn = document.getElementById("summarizeBtn");
const summarizeBtnText = document.getElementById("summarizeBtnText");

const outputWrapper = document.querySelector(".output-wrapper");
const outputContent = document.getElementById("outputContent");
const emptyState = document.getElementById("emptyState");
const outputMetaBar = document.getElementById("outputMetaBar");
const metaTitle = document.getElementById("metaTitle");
const metaModel = document.getElementById("metaModel");
const loadingOverlay = document.getElementById("loadingOverlay");
const loadingStatusText = document.getElementById("loadingStatusText");

const qaSection = document.getElementById("qaSection");
const qaInput = document.getElementById("qaInput");
const qaSendBtn = document.getElementById("qaSendBtn");
const qaAnswer = document.getElementById("qaAnswer");

const copySummaryBtn = document.getElementById("copySummaryBtn");
const copyBtnText = document.getElementById("copyBtnText");
const exportPdfBtn = document.getElementById("exportPdfBtn");
const copyMarkdownBtn = document.getElementById("copyMarkdownBtn");
const extractTextBtn = document.getElementById("extractTextBtn");

// Runtime Memory State
let currentSummary = "";
let currentTitle = "";
let currentUrl = "";
let currentProvider = "gemini";
let currentModel = "";
let currentPageText = "";
let activeApiKey = "";
let isBusy = false;

/**
 * Initialize Popup
 */
async function initPopup() {
  const storage = await chrome.storage.local.get([
    "provider",
    "apiKeys",
    "geminiApiKey",
    "models",
    "customModel",
    "summaryStyle",
    "lastSummary",
    "lastTitle",
    "lastUrl",
    "lastProvider",
    "lastModel",
    "lastStyle",
    "lastPageText",
    "isSummarizing",
    "summarizingStartTime"
  ]);

  // Determine active provider & model
  currentProvider = storage.provider || (storage.geminiApiKey ? "gemini" : "groq");
  const providerDef = AI_PROVIDERS[currentProvider] || AI_PROVIDERS.gemini;

  const apiKeys = storage.apiKeys || {};
  activeApiKey = apiKeys[currentProvider] || (currentProvider === "gemini" ? storage.geminiApiKey : "") || "";

  const models = storage.models || {};
  currentModel = models[currentProvider] || providerDef.defaultModel;
  if (storage.customModel && storage.customModel[currentProvider]) {
    currentModel = storage.customModel[currentProvider];
  }

  // Update Pill Badge
  updateProviderPill(currentProvider, currentModel, activeApiKey);

  // Set selected summary style
  if (storage.summaryStyle) {
    summaryStyleSelect.value = storage.summaryStyle;
  }

  // Prevent stale stuck locks (>25s old)
  const now = Date.now();
  if (storage.isSummarizing) {
    if (storage.summarizingStartTime && (now - storage.summarizingStartTime > 25000)) {
      await chrome.storage.local.set({ isSummarizing: false });
      showLoading(false);
    } else {
      showLoading(true, "Summarization in progress...");
    }
  } else if (storage.lastSummary) {
    currentSummary = storage.lastSummary;
    currentTitle = storage.lastTitle || "Web Page Summary";
    currentUrl = storage.lastUrl || "";
    currentPageText = storage.lastPageText || "";
    displaySummary(currentSummary, currentTitle, storage.lastModel || currentModel);
  }

  // Bind Events
  providerPill.addEventListener("click", openSettings);
  openSettingsBtn.addEventListener("click", openSettings);
  summarizeBtn.addEventListener("click", handleSummarize);
  summaryStyleSelect.addEventListener("change", handleStyleChange);

  copySummaryBtn.addEventListener("click", handleCopyAll);
  exportPdfBtn.addEventListener("click", handleExportPdf);
  copyMarkdownBtn.addEventListener("click", handleCopyMarkdown);
  extractTextBtn.addEventListener("click", handleExtractRawText);

  qaSendBtn.addEventListener("click", handleConsultationQuestion);
  qaInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleConsultationQuestion();
  });

  // Real-time synchronization with background tasks
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace !== "local") return;

    if (changes.isSummarizing) {
      const isSum = changes.isSummarizing.newValue;
      if (isSum) {
        showLoading(true, "Analyzing with AI...");
      } else {
        showLoading(false);
      }
    }

    if (changes.lastSummary) {
      const newSummary = changes.lastSummary.newValue;
      if (newSummary && !newSummary.startsWith("❌")) {
        currentSummary = newSummary;
        chrome.storage.local.get(["lastTitle", "lastModel"]).then(({ lastTitle, lastModel }) => {
          displaySummary(newSummary, lastTitle || currentTitle, lastModel || currentModel);
        });
      }
    }
  });
}

/**
 * Format model name for compact pill display
 */
function formatModelName(modelId) {
  if (!modelId) return "Flash";
  if (modelId === "gemini-flash-latest") return "Flash Latest";
  if (modelId === "gemini-3.5-flash") return "3.5 Flash";
  if (modelId === "gemini-3.8-flash") return "3.8 Flash";
  if (modelId === "gemini-flash-lite-latest") return "Flash Lite";
  if (modelId === "gemini-pro-latest") return "Pro Latest";
  if (modelId === "gemini-2.5-flash") return "2.5 Flash";
  if (modelId === "llama-3.3-70b-versatile") return "Llama 3.3";
  if (modelId === "llama-3.1-8b-instant") return "Llama 3.1";
  if (modelId === "deepseek-r1-distill-llama-70b") return "DeepSeek R1";
  if (modelId.includes("llama-3.3")) return "Llama 3.3";
  if (modelId.includes("gpt-4o-mini")) return "GPT-4o Mini";
  if (modelId.includes("gpt-4o")) return "GPT-4o";
  if (modelId.includes("claude-3-5")) return "Claude 3.5";
  return modelId.length > 14 ? modelId.slice(0, 12) + "..." : modelId;
}

/**
 * Updates header provider badge
 */
function updateProviderPill(providerId, model, key) {
  const providerDef = AI_PROVIDERS[providerId] || AI_PROVIDERS.gemini;
  const shortModel = formatModelName(model || providerDef.defaultModel);
  const provShort = providerDef.name.replace("Google ", "");
  
  if (!key && providerId !== "custom") {
    pillText.textContent = `⚠️ Set ${provShort} Key`;
    pillText.style.color = "#f85149";
  } else {
    pillText.textContent = `${provShort} • ${shortModel}`;
    pillText.style.color = "#c9d1d9";
  }
}

/**
 * Display rendered summary
 */
function displaySummary(text, title, model) {
  if (!text) return;

  // Show metadata bar
  outputMetaBar.style.display = "flex";
  metaTitle.textContent = title || "Web Page";
  metaModel.textContent = formatModelName(model || currentModel);

  // Render markdown safely
  outputContent.innerHTML = renderMarkdown(text);
  qaSection.style.display = "flex";
}

/**
 * Handle Summarize Action
 */
async function handleSummarize() {
  if (isBusy) return;

  // Check if API key is configured
  if (!activeApiKey && currentProvider !== "custom") {
    outputContent.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3>API Key Required</h3>
        <p>Please configure your <strong>${AI_PROVIDERS[currentProvider]?.name || currentProvider}</strong> API key in Settings to summarize.</p>
        <button id="goToSettingsBtn" class="btn-summarize" style="margin-top:12px; padding:6px 14px; font-size:12px;">⚙️ Open Settings</button>
      </div>
    `;
    document.getElementById("goToSettingsBtn")?.addEventListener("click", openSettings);
    return;
  }

  isBusy = true;
  const selectedStyle = summaryStyleSelect.value;
  const customFocus = customFocusInput.value.trim();
  const providerName = AI_PROVIDERS[currentProvider]?.name || currentProvider;

  showLoading(true, "Extracting page content...");

  try {
    // Timeout safeguard
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out after 35 seconds. Please try again.")), 35000)
    );

    // Update status to analyzing
    setTimeout(() => {
      if (isBusy) loadingStatusText.textContent = `Consulting with ${providerName}...`;
    }, 400);

    const responsePromise = chrome.runtime.sendMessage({
      type: "SUMMARIZE_ACTIVE_TAB",
      summaryStyle: selectedStyle,
      customFocus: customFocus
    });

    const response = await Promise.race([responsePromise, timeoutPromise]);

    if (response?.error) {
      showError(response.error);
    } else if (response?.summary) {
      currentSummary = response.summary;
      currentTitle = response.title || "Web Page Summary";
      currentUrl = response.url || "";
      displaySummary(currentSummary, currentTitle, response.model);
    } else {
      showError("No response received from the AI engine.");
    }
  } catch (err) {
    console.error("Summarize error:", err);
    showError(err.message || "Failed to generate summary.");
  } finally {
    isBusy = false;
    showLoading(false);
  }
}

/**
 * Handle Follow-up Consultation Question
 */
async function handleConsultationQuestion() {
  const question = qaInput.value.trim();
  if (!question) return;

  qaSendBtn.disabled = true;
  qaSendBtn.textContent = "⏳";
  qaAnswer.style.display = "block";
  qaAnswer.textContent = "ClarityAI is thinking...";

  try {
    const response = await chrome.runtime.sendMessage({
      type: "ASK_CONSULTATION",
      question,
      contextSummary: currentSummary,
      pageText: currentPageText
    });

    if (response?.error) {
      qaAnswer.textContent = `❌ ${response.error}`;
    } else if (response?.answer) {
      qaAnswer.innerHTML = `<strong>Q:</strong> ${escapeHtml(question)}<br/><br/><strong>A:</strong> ${renderMarkdown(response.answer)}`;
      qaInput.value = "";
    }
  } catch (err) {
    qaAnswer.textContent = `❌ ${err.message}`;
  } finally {
    qaSendBtn.disabled = false;
    qaSendBtn.textContent = "➤";
  }
}

/**
 * Handle Style Change
 */
async function handleStyleChange() {
  const newStyle = summaryStyleSelect.value;
  await chrome.storage.local.set({ summaryStyle: newStyle });
}

/**
 * Handle Copy All
 */
async function handleCopyAll() {
  if (!currentSummary) return;

  try {
    const plainText = currentSummary
      .replace(/###\s+/g, "")
      .replace(/##\s+/g, "")
      .replace(/#\s+/g, "")
      .replace(/\*\*/g, "");

    await navigator.clipboard.writeText(plainText);
    flashButtonSuccess(copySummaryBtn, copyBtnText, "Copied! ✓");
  } catch (err) {
    console.error("Failed to copy:", err);
  }
}

/**
 * Handle Copy Raw Markdown
 */
async function handleCopyMarkdown() {
  if (!currentSummary) return;

  try {
    const markdownWithHeader = `# ${currentTitle}\nSource: ${currentUrl}\nModel: ${currentModel}\n\n${currentSummary}`;
    await navigator.clipboard.writeText(markdownWithHeader);
    const originalText = copyMarkdownBtn.innerHTML;
    copyMarkdownBtn.innerHTML = `<span class="action-btn-icon">✓</span><span>Copied!</span>`;
    copyMarkdownBtn.classList.add("success");
    setTimeout(() => {
      copyMarkdownBtn.innerHTML = originalText;
      copyMarkdownBtn.classList.remove("success");
    }, 1500);
  } catch (err) {
    console.error("Failed to copy markdown:", err);
  }
}

/**
 * Handle Export to PDF
 */
function handleExportPdf() {
  if (!currentSummary) {
    alert("Please generate a summary first before exporting to PDF.");
    return;
  }

  exportSummaryToPDF({
    title: currentTitle || "Web Page Summary",
    url: currentUrl,
    provider: currentProvider,
    model: currentModel,
    style: summaryStyleSelect.value,
    content: currentSummary
  });
}

/**
 * Handle Raw Text Inspection
 */
async function handleExtractRawText() {
  showLoading(true, "Extracting raw text...");
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error("No active tab.");

    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const sel = window.getSelection?.()?.toString();
        if (sel && sel.trim().length > 0) return sel.trim();
        return document.body.innerText.substring(0, 10000);
      }
    });

    outputMetaBar.style.display = "flex";
    metaTitle.textContent = "Raw Page Text Preview";
    metaModel.textContent = "Extracted";
    outputContent.innerHTML = `<pre style="white-space:pre-wrap; font-size:11.5px; color:#8b949e;">${escapeHtml(result || 'No text extracted.')}</pre>`;
  } catch (e) {
    showError("Could not extract raw text.");
  } finally {
    showLoading(false);
  }
}

/**
 * Helpers
 */
function showLoading(isLoading, text = "Analyzing...") {
  if (isLoading) {
    // Clear out any old error so it never bleeds through the background
    outputContent.innerHTML = "";
    loadingOverlay.style.display = "flex";
    loadingStatusText.textContent = text;
    summarizeBtn.disabled = true;
    summarizeBtnText.textContent = "Summarizing...";
  } else {
    loadingOverlay.style.display = "none";
    summarizeBtn.disabled = false;
    summarizeBtnText.textContent = "Summarize";
  }
}

function showError(errorMessage) {
  outputMetaBar.style.display = "none";
  outputContent.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">❌</div>
      <h3 style="color:#f85149;">Analysis Failed</h3>
      <p style="color:#c9d1d9; max-width:340px; font-size:12px; line-height:1.4;">${escapeHtml(errorMessage)}</p>
      <button id="troubleshootBtn" class="btn-summarize" style="margin-top:12px; padding:6px 14px; font-size:12px;">⚙️ Check Settings & API Key</button>
    </div>
  `;
  document.getElementById("troubleshootBtn")?.addEventListener("click", openSettings);
}

function flashButtonSuccess(button, textEl, successText) {
  const original = textEl.textContent;
  textEl.textContent = successText;
  button.classList.add("success");
  setTimeout(() => {
    textEl.textContent = original;
    button.classList.remove("success");
  }, 1500);
}

function openSettings() {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open("../options/options.html");
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Lightweight safe markdown renderer for summaries
 */
function renderMarkdown(md) {
  if (!md) return "";

  const lines = md.split(/\r?\n/);
  const htmlParts = [];
  let inList = false;

  for (let line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      if (inList) {
        htmlParts.push("</ul>");
        inList = false;
      }
      continue;
    }

    // Headers
    if (trimmed.startsWith("### ")) {
      if (inList) { htmlParts.push("</ul>"); inList = false; }
      htmlParts.push(`<h3>${formatInline(trimmed.substring(4))}</h3>`);
      continue;
    }
    if (trimmed.startsWith("## ")) {
      if (inList) { htmlParts.push("</ul>"); inList = false; }
      htmlParts.push(`<h2>${formatInline(trimmed.substring(3))}</h2>`);
      continue;
    }
    if (trimmed.startsWith("# ")) {
      if (inList) { htmlParts.push("</ul>"); inList = false; }
      htmlParts.push(`<h1>${formatInline(trimmed.substring(2))}</h1>`);
      continue;
    }

    // Bullets
    if (/^[-*•]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      if (!inList) {
        htmlParts.push("<ul>");
        inList = true;
      }
      const itemText = trimmed.replace(/^[-*•]\s+/, "").replace(/^\d+\.\s+/, "");
      htmlParts.push(`<li>${formatInline(itemText)}</li>`);
      continue;
    }

    // Paragraph
    if (inList) {
      htmlParts.push("</ul>");
      inList = false;
    }
    htmlParts.push(`<p>${formatInline(trimmed)}</p>`);
  }

  if (inList) {
    htmlParts.push("</ul>");
  }

  return htmlParts.join("");
}

function formatInline(str) {
  let escaped = escapeHtml(str);
  // Bold **text**
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  // Code `text`
  escaped = escaped.replace(/`([^`]+)`/g, "<code>$1</code>");
  // Italic *text*
  escaped = escaped.replace(/\*(.*?)\*/g, "<em>$1</em>");
  return escaped;
}

// Start
document.addEventListener("DOMContentLoaded", initPopup);
