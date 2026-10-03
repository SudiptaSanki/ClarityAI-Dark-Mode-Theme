import { AI_PROVIDERS, testConnection } from "../utils/ai-providers.js";

// DOM Elements
const providerCards = document.querySelectorAll(".provider-card");
const guidanceBox = document.getElementById("guidanceBox");
const guidanceTitle = document.getElementById("guidanceTitle");
const guidanceInstructions = document.getElementById("guidanceInstructions");
const guidanceLink = document.getElementById("guidanceLink");

const apiKeyInput = document.getElementById("apiKeyInput");
const apiKeyLabel = document.getElementById("apiKeyLabel");
const apiKeyRequired = document.getElementById("apiKeyRequired");
const toggleKeyVisibility = document.getElementById("toggleKeyVisibility");

const modelSelect = document.getElementById("modelSelect");
const customModelGroup = document.getElementById("customModelGroup");
const customModelInput = document.getElementById("customModelInput");

const endpointGroup = document.getElementById("endpointGroup");
const customEndpointInput = document.getElementById("customEndpointInput");

const summaryStyleSelect = document.getElementById("defaultSummaryStyle");
const temperatureSlider = document.getElementById("temperatureSlider");
const tempValueDisplay = document.getElementById("tempValue");

const testBtn = document.getElementById("testConnectionBtn");
const testSpinner = document.getElementById("testSpinner");
const testBtnText = document.getElementById("testBtnText");
const saveBtn = document.getElementById("saveBtn");
const statusMsg = document.getElementById("statusMessage");

// Internal state
let activeProvider = "gemini";
let storedApiKeys = {};
let storedModels = {};
let storedCustomModels = {};
let storedEndpoints = {};

/**
 * Initialize and load options from chrome.storage.local
 */
async function initOptions() {
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

  // Backward compatibility migration
  storedApiKeys = storage.apiKeys || {};
  if (storage.geminiApiKey && !storedApiKeys.gemini) {
    storedApiKeys.gemini = storage.geminiApiKey;
  }

  storedModels = storage.models || {
    gemini: "gemini-flash-latest",
    groq: "llama-3.3-70b-versatile",
    openrouter: "meta-llama/llama-3.3-70b-instruct:free",
    openai: "gpt-4o-mini",
    anthropic: "claude-3-5-haiku-latest",
    deepseek: "deepseek-chat",
    custom: "llama3"
  };

  if (storedModels.gemini === "gemini-2.5-flash" || storedModels.gemini === "gemini-1.5-flash") {
    storedModels.gemini = "gemini-flash-latest";
  }

  storedCustomModels = storage.customModel || {};
  storedEndpoints = storage.customEndpoints || {};

  activeProvider = storage.provider || (storedApiKeys.gemini ? "gemini" : "groq");

  if (storage.summaryStyle) {
    summaryStyleSelect.value = storage.summaryStyle;
  }

  if (typeof storage.temperature === "number") {
    temperatureSlider.value = storage.temperature;
    tempValueDisplay.textContent = storage.temperature.toFixed(2);
  }

  // Bind provider card events
  providerCards.forEach(card => {
    card.addEventListener("click", () => {
      const providerId = card.getAttribute("data-provider");
      if (providerId && providerId !== activeProvider) {
        // Save current input to memory before switching
        saveCurrentInputsToMemory();
        selectProvider(providerId);
      }
    });
  });

  // Select initial provider
  selectProvider(activeProvider);

  // Model selection change
  modelSelect.addEventListener("change", handleModelSelectChange);

  // Toggle API key visibility
  toggleKeyVisibility.addEventListener("click", () => {
    if (apiKeyInput.type === "password") {
      apiKeyInput.type = "text";
      toggleKeyVisibility.textContent = "🙈";
    } else {
      apiKeyInput.type = "password";
      toggleKeyVisibility.textContent = "👁️";
    }
  });

  // Slider change
  temperatureSlider.addEventListener("input", (e) => {
    tempValueDisplay.textContent = parseFloat(e.target.value).toFixed(2);
  });

  // Buttons
  testBtn.addEventListener("click", handleTestConnection);
  saveBtn.addEventListener("click", handleSaveSettings);
}

/**
 * Switch active provider and update UI
 */
function selectProvider(providerId) {
  activeProvider = providerId;
  const config = AI_PROVIDERS[providerId] || AI_PROVIDERS.gemini;

  // Highlight active provider card
  providerCards.forEach(card => {
    if (card.getAttribute("data-provider") === providerId) {
      card.classList.add("selected");
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    } else {
      card.classList.remove("selected");
    }
  });

  // Update Guidance Box
  guidanceTitle.textContent = `Get your ${config.name} API Key`;
  guidanceInstructions.textContent = config.keyInstructions;
  guidanceLink.href = config.keyUrl;
  guidanceLink.textContent = config.isFreeTier ? `Get Free Key at ${config.name} ↗` : `Get API Key at ${config.name} ↗`;

  // Update API Key field
  apiKeyInput.placeholder = config.keyPlaceholder || "Enter API Key...";
  apiKeyInput.value = storedApiKeys[providerId] || "";
  
  if (providerId === "custom") {
    apiKeyRequired.style.display = "none";
    apiKeyLabel.innerHTML = `API Key <span style="color:#8b949e; font-weight:normal;">(Optional for local Ollama/LM Studio)</span>`;
  } else {
    apiKeyRequired.style.display = "inline";
    apiKeyLabel.innerHTML = `${config.name} API Key <span class="required">*Required</span>`;
  }

  // Populate models dropdown
  populateModelsDropdown(config, providerId);

  // Endpoint handling
  if (providerId === "custom") {
    endpointGroup.style.display = "flex";
    customEndpointInput.value = storedEndpoints[providerId] || config.defaultEndpoint;
  } else {
    endpointGroup.style.display = "none";
  }
}

/**
 * Populates model select dropdown for current provider
 */
function populateModelsDropdown(config, providerId) {
  modelSelect.innerHTML = "";

  const savedModel = storedModels[providerId] || config.defaultModel;
  let modelFoundInPresets = false;

  config.models.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.id;
    opt.textContent = m.name;
    if (m.id === savedModel) {
      opt.selected = true;
      modelFoundInPresets = true;
    }
    modelSelect.appendChild(opt);
  });

  // Add "Custom Model..." option
  const customOpt = document.createElement("option");
  customOpt.value = "custom_model_choice";
  customOpt.textContent = "⚙️ Custom Model Name / Version...";
  modelSelect.appendChild(customOpt);

  if (!modelFoundInPresets && savedModel) {
    customOpt.selected = true;
    customModelGroup.style.display = "flex";
    customModelInput.value = savedModel;
  } else {
    customModelGroup.style.display = "none";
    customModelInput.value = storedCustomModels[providerId] || "";
  }
}

/**
 * Handle model select dropdown change
 */
function handleModelSelectChange() {
  if (modelSelect.value === "custom_model_choice") {
    customModelGroup.style.display = "flex";
    customModelInput.focus();
  } else {
    customModelGroup.style.display = "none";
    storedModels[activeProvider] = modelSelect.value;
  }
}

/**
 * Save inputs for current provider to memory
 */
function saveCurrentInputsToMemory() {
  const currentKey = apiKeyInput.value.trim();
  storedApiKeys[activeProvider] = currentKey;

  if (modelSelect.value === "custom_model_choice") {
    const customName = customModelInput.value.trim();
    if (customName) {
      storedModels[activeProvider] = customName;
      storedCustomModels[activeProvider] = customName;
    }
  } else {
    storedModels[activeProvider] = modelSelect.value;
  }

  if (activeProvider === "custom") {
    storedEndpoints.custom = customEndpointInput.value.trim();
  }
}

/**
 * Test Connection Handler
 */
async function handleTestConnection() {
  saveCurrentInputsToMemory();

  const config = AI_PROVIDERS[activeProvider] || AI_PROVIDERS.gemini;
  const apiKey = apiKeyInput.value.trim();
  const selectedModel = modelSelect.value === "custom_model_choice"
    ? customModelInput.value.trim()
    : modelSelect.value;
  const customEndpoint = activeProvider === "custom" ? customEndpointInput.value.trim() : "";

  if (!apiKey && activeProvider !== "custom") {
    showStatus(`❌ Please enter an API key for ${config.name} first.`, "error");
    apiKeyInput.focus();
    return;
  }

  if (!selectedModel) {
    showStatus("❌ Please specify a model name to test.", "error");
    return;
  }

  // Set loading state
  testBtn.disabled = true;
  testSpinner.style.display = "inline-block";
  testBtnText.textContent = "Connecting...";
  showStatus(`Testing connection to ${config.name} (${selectedModel})...`, "info");

  try {
    const result = await testConnection({
      provider: activeProvider,
      apiKey,
      model: selectedModel,
      customEndpoint
    });

    if (result.success) {
      showStatus(`✅ Connected Successfully to ${config.name}! (Response in ${result.latency}ms)`, "success");
    } else {
      showStatus(`❌ Connection Failed: ${result.error || 'Unknown error'}`, "error");
    }
  } catch (err) {
    showStatus(`❌ Connection Failed: ${err.message}`, "error");
  } finally {
    testBtn.disabled = false;
    testSpinner.style.display = "none";
    testBtnText.textContent = "⚡ Test Connection";
  }
}

/**
 * Save Settings Handler
 */
async function handleSaveSettings() {
  saveCurrentInputsToMemory();

  const activeKey = storedApiKeys[activeProvider];
  if (!activeKey && activeProvider !== "custom") {
    showStatus(`❌ Please enter an API key for ${AI_PROVIDERS[activeProvider]?.name || activeProvider}.`, "error");
    apiKeyInput.focus();
    return;
  }

  const payload = {
    provider: activeProvider,
    apiKeys: storedApiKeys,
    models: storedModels,
    customModel: storedCustomModels,
    customEndpoints: storedEndpoints,
    summaryStyle: summaryStyleSelect.value,
    temperature: parseFloat(temperatureSlider.value)
  };

  // Keep backward compatibility for geminiApiKey and model
  if (storedApiKeys.gemini) {
    payload.geminiApiKey = storedApiKeys.gemini;
  }
  if (storedModels[activeProvider]) {
    payload.model = storedModels[activeProvider];
  }

  await chrome.storage.local.set(payload);
  showStatus("✅ Settings saved successfully! Ready to summarize.", "success");
}

/**
 * Display toast status message
 */
function showStatus(text, type = "info") {
  statusMsg.textContent = text;
  statusMsg.className = `status-msg ${type}`;
  statusMsg.style.display = "block";

  if (type === "success") {
    setTimeout(() => {
      statusMsg.style.display = "none";
    }, 4000);
  }
}

// Start
document.addEventListener("DOMContentLoaded", initOptions);
