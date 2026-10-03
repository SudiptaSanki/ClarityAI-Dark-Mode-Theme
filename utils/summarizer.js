/**
 * ClarityAI Advanced Consultation & Summarization Logic
 * Formulates structured prompts for executive briefing, deep-dive consultation,
 * key insights, actionable takeaways, and interactive Q&A.
 */

export const CONSULTATION_MODES = {
  short: {
    id: "short",
    label: "Executive Brief (TL;DR)",
    description: "Concise 3-4 sentence overview of the core message and conclusion.",
    systemPrompt: `You are ClarityAI, an elite executive intelligence assistant. Your role is to deliver crystal-clear, high-signal executive briefings. Eliminate fluff, avoid preamble, and synthesize the essential truth directly.`
  },
  bullets: {
    id: "bullets",
    label: "Key Takeaways (Bullets)",
    description: "5-8 structured points highlighting crucial findings and evidence.",
    systemPrompt: `You are ClarityAI, a precision research analyst. Extract the most vital findings, arguments, and data points into crisp, high-impact bullet points with bold headline lead-ins.`
  },
  detailed: {
    id: "detailed",
    label: "Deep Dive Consultation",
    description: "Thorough multi-dimensional strategic breakdown with analysis and implications.",
    systemPrompt: `You are ClarityAI, a senior strategic consultant. Provide a comprehensive, structured consultative analysis of the source material. Organize your response into clear sections: 
1. Executive Summary & Core Thesis
2. Key Pillars & Evidence
3. Strategic Implications & Risks
4. Recommendations & Takeaways`
  },
  actionable: {
    id: "actionable",
    label: "Actionable Steps & Checklist",
    description: "Prioritized list of actionable tasks, decisions, and practical next steps.",
    systemPrompt: `You are ClarityAI, an operational advisor. Extract and formulate clear, actionable steps, decisions, and practical takeaways from the material.`
  }
};

/**
 * Builds the customized prompt for consultation / summarization
 */
export function buildConsultationPrompt({
  title = "",
  url = "",
  text = "",
  style = "short",
  customFocus = ""
}) {
  const modeConfig = CONSULTATION_MODES[style] || CONSULTATION_MODES.short;
  
  // Truncate to safe context size while respecting sentence boundaries
  const maxChars = 32000;
  let cleanText = text;
  if (cleanText.length > maxChars) {
    const cutPoint = cleanText.lastIndexOf(".", maxChars);
    cleanText = cutPoint > maxChars * 0.8 ? cleanText.substring(0, cutPoint + 1) : cleanText.substring(0, maxChars);
  }

  let prompt = "";
  if (title) prompt += `Document Title: "${title}"\n`;
  if (url) prompt += `Source URL: ${url}\n\n`;

  prompt += `Content to Analyze:\n"""\n${cleanText}\n"""\n\n`;

  prompt += `Instructions:\n`;
  switch (style) {
    case "bullets":
      prompt += `- Provide 5 to 8 structured bullet points.\n- Format each item as: "**[Short Bold Headline]:** [Clear explanation with specific facts or numbers]."\n`;
      break;
    case "detailed":
      prompt += `- Provide a structured deep-dive consultation.\n- Include Markdown headings (###) for: Executive Overview, Key Findings & Arguments, Critical Evaluation & Risks, and Strategic Recommendations.\n- Highlight notable quotes, data points, or logic.\n`;
      break;
    case "actionable":
      prompt += `- Extract a numbered checklist of concrete actions, decisions, or implementation steps.\n- Specify who should act and what the immediate priority is.\n`;
      break;
    case "short":
    default:
      prompt += `- Provide a concise 3 to 4 sentence executive summary.\n- Capture the core problem/topic, the primary argument/solution, and the ultimate outcome or takeaway.\n`;
      break;
  }

  if (customFocus && customFocus.trim()) {
    prompt += `- Special User Focus: Pay special attention to: "${customFocus.trim()}".\n`;
  }

  prompt += `- Maintain an objective, articulate, and professional tone.\n- Do not include introductory phrases like "Sure, here is the summary" or "In this article". Start directly with the substance.`;

  return {
    systemPrompt: modeConfig.systemPrompt,
    userPrompt: prompt
  };
}

/**
 * Formulates a follow-up consultation prompt
 */
export function buildFollowUpPrompt({
  contextSummary = "",
  pageText = "",
  question = ""
}) {
  const truncatedContent = pageText.length > 20000 ? pageText.substring(0, 20000) : pageText;
  
  const systemPrompt = `You are ClarityAI, an interactive expert consultant. The user is asking a specific question regarding a web page they just reviewed. Answer clearly, accurately, and citing specific points from the content where applicable.`;
  
  const userPrompt = `Page Content Reference:\n"""\n${truncatedContent}\n"""\n\nExisting Summary Overview:\n${contextSummary}\n\nUser Question:\n"${question}"\n\nPlease provide a clear, direct, and well-reasoned answer to the user's question based on the content above.`;

  return { systemPrompt, userPrompt };
}
