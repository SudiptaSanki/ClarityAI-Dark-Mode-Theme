# ClarityAI — Universal AI Summarizer & Executive Consultant (Dark Mode)

![SmartSummarizer Logo](SmartSummarizer%20Logo%20with%20Paper%20and%20Digital%20Interface.png)

A modern, lightweight, privacy-focused Chrome Extension that delivers instant AI summarization, deep consultative analysis, interactive Q&A, and **one-click PDF export** for any web page or article.

> **🚀 Universal AI Freedom:** No more hardcoded models or vendor lock-in! ClarityAI works with **any AI provider, any model version, and any API key** (free, paid, or private local LLMs). Zero coding required—everything is managed right from a sleek, intuitive dark-mode interface.

---

## 🌟 What Makes ClarityAI Different?

- **🔓 100% Free & Universal:** Choose from completely free providers like **Groq** (blazing fast Llama 3.3 70B & DeepSeek R1), **Google Gemini** (Gemini 2.5 Flash), or **OpenRouter** (200+ models with `:free` tiers), or connect paid flagships like **OpenAI (GPT-4o)**, **Anthropic Claude (3.5/3.7 Sonnet)**, or private **local Ollama / LM Studio** servers.
- **⚙️ Never Bound to a Single Version:** Enter or select *any* model name or version identifier directly in the UI. When new models launch, simply type the model string in Settings—no manual code editing ever!
- **📄 One-Click PDF Export:** Export your generated intelligence briefs into beautifully styled, professional PDF documents complete with metadata, headers, source links, and clear typography.
- **📋 Complete One-Click Copy:** Copy plain text or raw formatted Markdown for your notes, Notion, Obsidian, or team chats with instant visual confirmation.
- **💡 4 Tailored Consultation Styles:**
  - **⚡ Executive Brief (TL;DR):** 3–4 punchy sentences capturing core substance and conclusion.
  - **📌 Key Takeaways (Bullets):** 5–8 high-impact points with bold headlines.
  - **📊 Deep Dive Consultation:** 4-part strategic analysis (Overview, Core Arguments, Critical Implications, and Strategic Recommendations).
  - **✅ Actionable Steps & Checklist:** Concrete tasks, implementation points, and next steps.
- **💬 Interactive Follow-Up Q&A:** Ask questions about the page content directly in the popup for instant interactive consultation.
- **💾 Local Caching:** Automatically persists your previous summary and metadata locally so closing the popup never wastes API tokens or loses your work.
- **🔒 100% Client-Side Privacy:** Your API keys and page data remain securely stored inside your browser. No middleman servers.

---

## 🔑 Supported Providers & Free API Key Guide

ClarityAI includes built-in presets and step-by-step guidance for all major providers:

| Provider | Pricing / Tier | Recommended Models | Where to Get Your Key |
| :--- | :--- | :--- | :--- |
| **Groq** | **100% Free & Ultra-Fast** | `llama-3.3-70b-versatile`<br/>`deepseek-r1-distill-llama-70b` | [Groq Console](https://console.groq.com/keys) |
| **Google Gemini** | **Free Tier Available** | `gemini-2.5-flash`<br/>`gemini-2.5-pro` | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| **OpenRouter** | **Free & Paid (200+ Models)** | `meta-llama/llama-3.3-70b-instruct:free`<br/>`deepseek/deepseek-r1:free` | [OpenRouter Keys](https://openrouter.ai/keys) |
| **OpenAI** | Paid API | `gpt-4o-mini`, `gpt-4o`, `o3-mini` | [OpenAI Platform](https://platform.openai.com/api-keys) |
| **Anthropic Claude** | Paid API | `claude-3-5-haiku`, `claude-3-7-sonnet` | [Anthropic Console](https://console.anthropic.com/settings/keys) |
| **DeepSeek** | Ultra Low Cost API | `deepseek-chat` (V3), `deepseek-reasoner` (R1) | [DeepSeek Platform](https://platform.deepseek.com/api_keys) |
| **Custom / Local** | **100% Free & Private** | `llama3`, `mistral`, `deepseek-r1`, `qwen2.5` | [Ollama](https://ollama.com) / LM Studio |

> **Tip for Free Use:** If you don't want to spend money on API credits, grab a free key from **[Groq](https://console.groq.com/keys)** or **[Google AI Studio](https://aistudio.google.com/app/apikey)** in under 60 seconds!

---

## 🛠️ Installation & Setup

### 1. Install the Extension in Chrome / Edge / Brave

1. Download or clone this repository:
   ```bash
   git clone https://github.com/SudiptaSanki/ClarityAI-extension-Dark-Mode-Theme.git
   ```
2. Open your Chromium browser and navigate to:
   ```
   chrome://extensions/
   ```
3. Enable **Developer mode** (toggle located in top-right corner).
4. Click **Load unpacked** and select the extension directory.

### 2. Configure Your Provider & API Key

1. Click the **ClarityAI** icon in your browser toolbar (pin it for quick access).
2. Click the **Settings (⚙️)** icon or the provider pill at the top of the popup.
3. Select your desired AI provider (e.g., *Groq*, *Google Gemini*, or *OpenRouter*).
4. Paste your API key into the key field.
5. Select a preset model or choose **⚙️ Custom Model Version...** to specify any custom model identifier.
6. Click **⚡ Test Connection** to verify that your key and model are authenticated.
7. Click **💾 Save Settings**.

---

## 🚀 How to Use

- **Popup Summarization:** Click the extension icon on any article or webpage, pick your consultation style, and click **✨ Summarize**.
- **Context Menu:** Right-click anywhere on a webpage and click **Summarize with ClarityAI**.
- **Selected Text Only:** Highlight any specific passage on a page, right-click, and summarize just that excerpt.
- **Exporting Intelligence:**
  - Click **📄 Export PDF** to download a formatted, multi-page executive PDF brief.
  - Click **📋 Copy All** to copy the formatted summary text to your clipboard.
  - Click **📝 Markdown** to copy with full headers and bullet formatting.
- **Interactive Consultation:** Type a question in the bottom box (e.g., *"What are the key statistical figures mentioned?"*) and receive an immediate AI response grounded in the page's content.

---

## 🧪 Testing the Extension

A complete test page is included in the extension:
1. Open `test-page.html` in your browser.
2. Open the ClarityAI popup and click **✨ Summarize** to test content extraction, AI processing, and formatting.
3. Test exporting to PDF and copying the results.

---

## 🔒 Privacy & Security

- **No Remote Tracking:** All settings and API keys are stored locally on your device via Chrome's secure storage API (`chrome.storage.local`).
- **Direct Communication:** Summarization requests are sent directly from your browser to the chosen AI provider's official endpoint.
- **Local PDF Rendering:** PDF creation happens entirely client-side using native JavaScript without any third-party external CDN scripts or remote data transmission.

---

## 🤝 Contributing

Contributions, feedback, and suggestions are welcome! Feel free to open issues or submit pull requests.
