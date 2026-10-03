/**
 * ClarityAI Smart Content Extractor
 * Extracts readable article/page content while stripping navigation, footers, ads, and boilerplate.
 */

export function extractPageContent() {
  const pageTitle = document.title || "Untitled Page";
  const pageUrl = window.location.href || "";

  // 1. Check if user selected text manually
  const selectedText = window.getSelection?.()?.toString()?.trim();
  if (selectedText && selectedText.length > 20) {
    return {
      title: pageTitle,
      url: pageUrl,
      text: selectedText,
      isSelection: true,
      wordCount: countWords(selectedText)
    };
  }

  // 2. Identify prime article or main container if available
  const selectorsToTry = [
    "article",
    "main",
    "[role='main']",
    ".post-content",
    ".article-content",
    ".entry-content",
    "#content"
  ];

  let rootContainer = null;
  for (const selector of selectorsToTry) {
    const el = document.querySelector(selector);
    if (el && el.innerText && el.innerText.trim().length > 300) {
      rootContainer = el;
      break;
    }
  }

  const containerToScan = rootContainer || document.body;

  // 3. TreeWalker filtering out non-content and noisy elements
  const excludedTags = new Set([
    "SCRIPT", "STYLE", "NOSCRIPT", "NAV", "HEADER", "FOOTER",
    "ASIDE", "DIALOG", "IFRAME", "SVG", "CANVAS", "FORM", "BUTTON"
  ]);

  const walker = document.createTreeWalker(
    containerToScan,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        let parent = node.parentElement;
        while (parent && parent !== containerToScan) {
          if (excludedTags.has(parent.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          // Filter common noise classes or attributes
          const classOrId = (parent.className || "") + " " + (parent.id || "");
          if (/advertisement|ad-container|cookie|banner|sidebar|newsletter|social-share/i.test(classOrId)) {
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
  let totalChars = 0;
  const maxChars = 80000; // ample context for modern models

  while ((node = walker.nextNode())) {
    const text = node.nodeValue?.replace(/\s+/g, " ")?.trim();
    if (text && text.length > 2) {
      parts.push(text);
      totalChars += text.length + 1;
      if (totalChars > maxChars) break;
    }
  }

  const fullText = parts.join("\n\n").trim();
  return {
    title: pageTitle,
    url: pageUrl,
    text: fullText,
    isSelection: false,
    wordCount: countWords(fullText)
  };
}

function countWords(str) {
  if (!str) return 0;
  const matches = str.match(/\b\S+\b/g);
  return matches ? matches.length : 0;
}
