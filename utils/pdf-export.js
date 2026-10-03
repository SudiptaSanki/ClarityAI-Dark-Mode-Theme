/**
 * ClarityAI Pure JavaScript PDF Generator
 * Generates standards-compliant PDF 1.4 documents without any external dependencies or CDN calls.
 * Safe for Chrome Extension Manifest V3.
 */

export function exportSummaryToPDF({
  title = "ClarityAI Summary",
  url = "",
  provider = "",
  model = "",
  style = "",
  date = new Date().toLocaleString(),
  content = ""
}) {
  const doc = new SimplePDFDocument();

  // Primary brand colors
  const primaryColor = [26 / 255, 115 / 255, 232 / 255]; // #1a73e8
  const darkTextColor = [33 / 255, 37 / 255, 41 / 255]; // #212529
  const secondaryColor = [108 / 255, 117 / 255, 125 / 255]; // #6c757d
  const lightBgColor = [241 / 255, 245 / 255, 249 / 255]; // #f1f5f9
  const borderRuleColor = [226 / 255, 232 / 255, 240 / 255]; // #e2e8f0

  // 1. Header Banner
  doc.drawRect(0, 800, 595.28, 42, primaryColor, true);
  doc.drawText("CLARITY AI  •  EXECUTIVE INTELLIGENCE BRIEF", 40, 815, {
    font: "bold",
    size: 13,
    color: [1, 1, 1]
  });

  let y = 770;

  // 2. Document Title
  const cleanTitle = title.replace(/[\r\n\t]/g, " ").trim() || "Web Page Summary";
  const titleLines = doc.wrapText(cleanTitle, 18, 515, "bold");
  for (const line of titleLines) {
    if (y < 60) { doc.addPage(); y = 780; }
    doc.drawText(line, 40, y, { font: "bold", size: 16, color: darkTextColor });
    y -= 22;
  }

  y -= 4;

  // 3. Metadata Card Background
  const metaBoxHeight = 52;
  doc.drawRect(40, y - metaBoxHeight + 12, 515, metaBoxHeight, lightBgColor, true);
  doc.drawRect(40, y - metaBoxHeight + 12, 515, metaBoxHeight, borderRuleColor, false);

  // Metadata Details
  const displayModel = model || "AI Model";
  const displayProvider = provider ? provider.toUpperCase() : "AI";
  const displayStyle = style ? (style.charAt(0).toUpperCase() + style.slice(1)) : "Summary";

  doc.drawText(`Provider: ${displayProvider} (${displayModel})   |   Style: ${displayStyle}`, 52, y - 6, {
    font: "bold",
    size: 9,
    color: primaryColor
  });

  const shortUrl = url.length > 70 ? url.substring(0, 67) + "..." : url;
  doc.drawText(`Source: ${shortUrl || 'Active Browser Tab'}`, 52, y - 20, {
    font: "normal",
    size: 8,
    color: secondaryColor
  });

  doc.drawText(`Generated on: ${date}`, 52, y - 33, {
    font: "normal",
    size: 8,
    color: secondaryColor
  });

  y -= (metaBoxHeight + 20);

  // 4. Content Parsing & Rendering
  const lines = content.split(/\r?\n/);
  
  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      y -= 10;
      continue;
    }

    if (y < 65) {
      doc.addPage();
      y = 780;
    }

    // Markdown Headers (###, ##, #)
    if (trimmed.startsWith("### ")) {
      y -= 8;
      const headerText = trimmed.replace(/^###\s+/, "");
      doc.drawText(headerText, 40, y, { font: "bold", size: 12, color: primaryColor });
      y -= 16;
      continue;
    }

    if (trimmed.startsWith("## ")) {
      y -= 12;
      const headerText = trimmed.replace(/^##\s+/, "");
      doc.drawText(headerText, 40, y, { font: "bold", size: 14, color: darkTextColor });
      y -= 18;
      continue;
    }

    if (trimmed.startsWith("# ")) {
      y -= 14;
      const headerText = trimmed.replace(/^#\s+/, "");
      doc.drawText(headerText, 40, y, { font: "bold", size: 15, color: primaryColor });
      y -= 20;
      continue;
    }

    // Bullet points
    if (/^[-*•]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      const isNumbered = /^\d+\.\s+/.test(trimmed);
      let bulletPrefix = "•";
      let textWithoutBullet = trimmed.replace(/^[-*•]\s+/, "");
      
      if (isNumbered) {
        const match = trimmed.match(/^(\d+\.)\s+(.*)/);
        if (match) {
          bulletPrefix = match[1];
          textWithoutBullet = match[2];
        }
      }

      // Check if item has bold lead: e.g., "**Key Point:** details..."
      const boldLeadMatch = textWithoutBullet.match(/^\*\*([^*]+)\*\*[:\s-]*(.*)/);
      if (boldLeadMatch) {
        const lead = boldLeadMatch[1] + ":";
        const remainder = boldLeadMatch[2];
        
        doc.drawText(bulletPrefix, 45, y, { font: "bold", size: 10, color: primaryColor });
        doc.drawText(lead, 58, y, { font: "bold", size: 10, color: darkTextColor });
        
        const leadWidth = doc.getTextWidth(lead, 10, "bold");
        const remainingWidth = 515 - (18 + leadWidth);
        const wrappedRemainder = doc.wrapText(remainder, 10, 480, "normal");

        if (wrappedRemainder.length > 0) {
          doc.drawText(wrappedRemainder[0], 58 + leadWidth + 4, y, { font: "normal", size: 10, color: darkTextColor });
          y -= 14;
          for (let r = 1; r < wrappedRemainder.length; r++) {
            if (y < 65) { doc.addPage(); y = 780; }
            doc.drawText(wrappedRemainder[r], 58, y, { font: "normal", size: 10, color: darkTextColor });
            y -= 14;
          }
        } else {
          y -= 14;
        }
      } else {
        // Normal bullet
        const cleanText = textWithoutBullet.replace(/\*\*/g, "");
        const wrappedBullet = doc.wrapText(cleanText, 10, 480, "normal");
        
        doc.drawText(bulletPrefix, 45, y, { font: "bold", size: 10, color: primaryColor });
        for (let b = 0; b < wrappedBullet.length; b++) {
          if (y < 65) { doc.addPage(); y = 780; }
          const indent = b === 0 ? 58 : 58;
          doc.drawText(wrappedBullet[b], indent, y, { font: "normal", size: 10, color: darkTextColor });
          y -= 14;
        }
      }
      y -= 4; // slight spacing after bullet
      continue;
    }

    // Normal paragraph text
    const cleanParagraph = trimmed.replace(/\*\*/g, "");
    const wrappedParagraph = doc.wrapText(cleanParagraph, 10, 515, "normal");
    for (const pLine of wrappedParagraph) {
      if (y < 65) { doc.addPage(); y = 780; }
      doc.drawText(pLine, 40, y, { font: "normal", size: 10, color: darkTextColor });
      y -= 14;
    }
    y -= 4;
  }

  // 5. Add Running Footers
  doc.renderFooters("Generated by ClarityAI — Free Universal AI Extension", primaryColor);

  // 6. Download as File
  const pdfBytes = doc.build();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const downloadUrl = URL.createObjectURL(blob);
  
  const safeFilename = (title || "Summary")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .substring(0, 35);
  
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = `ClarityAI_${safeFilename}_${Date.now()}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
}

/**
 * Lightweight pure JavaScript PDF document generator
 */
class SimplePDFDocument {
  constructor() {
    this.pages = [[]];
    this.currentPageIndex = 0;
    this.pageWidth = 595.28;
    this.pageHeight = 841.89; // Standard A4
  }

  addPage() {
    this.pages.push([]);
    this.currentPageIndex++;
  }

  drawText(text, x, y, options = {}) {
    if (!text) return;
    const font = options.font === "bold" ? "/F2" : (options.font === "italic" ? "/F3" : "/F1");
    const size = options.size || 10;
    const color = options.color || [0, 0, 0];
    
    // Sanitize text for PDF literal string
    const escaped = text
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)")
      .replace(/[\x00-\x1F\x7F-\x9F]/g, " ");

    const cmd = `q ${color[0].toFixed(3)} ${color[1].toFixed(3)} ${color[2].toFixed(3)} rg BT ${font} ${size} Tf 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${escaped}) Tj ET Q\n`;
    this.pages[this.currentPageIndex].push(cmd);
  }

  drawRect(x, y, width, height, color, fill = true) {
    const r = color[0].toFixed(3);
    const g = color[1].toFixed(3);
    const b = color[2].toFixed(3);
    let cmd = `q `;
    if (fill) {
      cmd += `${r} ${g} ${b} rg ${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re f Q\n`;
    } else {
      cmd += `${r} ${g} ${b} RG 0.75 w ${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re S Q\n`;
    }
    this.pages[this.currentPageIndex].push(cmd);
  }

  drawLine(x1, y1, x2, y2, color, lineWidth = 0.5) {
    const r = color[0].toFixed(3);
    const g = color[1].toFixed(3);
    const b = color[2].toFixed(3);
    const cmd = `q ${r} ${g} ${b} RG ${lineWidth} w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S Q\n`;
    this.pages[this.currentPageIndex].push(cmd);
  }

  getTextWidth(text, size = 10, font = "normal") {
    // Approximate character widths for Helvetica
    const boldFactor = font === "bold" ? 1.08 : 1.0;
    let width = 0;
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (code < 128) {
        if ("ijl|.,:;'! ".includes(text[i])) width += 0.28;
        else if ("mwMW@".includes(text[i])) width += 0.85;
        else if (text[i] >= 'A' && text[i] <= 'Z') width += 0.67;
        else width += 0.52;
      } else {
        width += 0.6;
      }
    }
    return width * size * boldFactor;
  }

  wrapText(text, size, maxWidth, font = "normal") {
    const words = text.split(/\s+/);
    const lines = [];
    let currentLine = "";

    for (const word of words) {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      const width = this.getTextWidth(candidate, size, font);
      if (width <= maxWidth || !currentLine) {
        currentLine = candidate;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  }

  renderFooters(appBranding, brandColor) {
    const totalPages = this.pages.length;
    for (let p = 0; p < totalPages; p++) {
      const oldIndex = this.currentPageIndex;
      this.currentPageIndex = p;

      // Divider line
      this.drawLine(40, 35, 555, 35, [226 / 255, 232 / 255, 240 / 255], 0.75);

      // Branding
      this.drawText(appBranding, 40, 22, {
        font: "bold",
        size: 8,
        color: brandColor
      });

      // Page Number
      const pageStr = `Page ${p + 1} of ${totalPages}`;
      const pageNumWidth = this.getTextWidth(pageStr, 8, "normal");
      this.drawText(pageStr, 555 - pageNumWidth, 22, {
        font: "normal",
        size: 8,
        color: [148 / 255, 163 / 255, 184 / 255]
      });

      this.currentPageIndex = oldIndex;
    }
  }

  build() {
    const objects = [];
    const addObject = (content) => {
      objects.push(content);
      return objects.length;
    };

    // 1: Catalog
    const catalogId = addObject(`<< /Type /Catalog /Pages 2 0 R >>`);

    // 2: Pages root
    // Kids array will be filled after all page objects are registered
    const pagesObjIndex = 2;
    objects.push(""); // Placeholder for pages object

    // Font definitions: /F1 Helvetica, /F2 Helvetica-Bold, /F3 Helvetica-Oblique
    const fontNormalId = addObject(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`);
    const fontBoldId = addObject(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`);
    const fontItalicId = addObject(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>`);

    const pageObjIds = [];

    for (let i = 0; i < this.pages.length; i++) {
      const streamContent = this.pages[i].join("");
      const streamBytes = new TextEncoder().encode(streamContent);

      const contentObjId = addObject(
        `<< /Length ${streamBytes.length} >>\nstream\n${streamContent}\nendstream`
      );

      const pageObjId = addObject(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents ${contentObjId} 0 R /Resources << /Font << /F1 ${fontNormalId} 0 R /F2 ${fontBoldId} 0 R /F3 ${fontItalicId} 0 R >> >> >>`
      );
      pageObjIds.push(pageObjId);
    }

    // Now fill Pages root (object 2)
    const kidsStr = pageObjIds.map(id => `${id} 0 R`).join(" ");
    objects[pagesObjIndex - 1] = `<< /Type /Pages /Kids [${kidsStr}] /Count ${pageObjIds.length} >>`;

    // Build the final PDF binary text
    let output = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
    const xrefOffsets = [0];

    for (let i = 0; i < objects.length; i++) {
      const offset = new TextEncoder().encode(output).length;
      xrefOffsets.push(offset);
      output += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
    }

    const startXref = new TextEncoder().encode(output).length;
    output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i <= objects.length; i++) {
      const padded = String(xrefOffsets[i]).padStart(10, "0");
      output += `${padded} 00000 n \n`;
    }

    output += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

    return new TextEncoder().encode(output);
  }
}
