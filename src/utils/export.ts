/**
 * Export utilities for notes
 * Handles PDF export, Markdown conversion, and printing
 */

import { Note } from "../models/Note";

/**
 * Convert HTML content to Markdown
 */
export function htmlToMarkdown(html: string): string {
  // Create a temporary element to parse HTML
  const temp = document.createElement("div");
  temp.innerHTML = html;

  let markdown = "";
  
  function processNode(node: Node): string {
    let result = "";
    
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || "";
    }
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const children = Array.from(element.childNodes);
      const childText = children.map(processNode).join("");
      
      switch (element.tagName.toLowerCase()) {
        case "h1":
          return `# ${childText}\n\n`;
        case "h2":
          return `## ${childText}\n\n`;
        case "h3":
          return `### ${childText}\n\n`;
        case "h4":
          return `#### ${childText}\n\n`;
        case "h5":
          return `##### ${childText}\n\n`;
        case "h6":
          return `###### ${childText}\n\n`;
        case "p":
          return `${childText}\n\n`;
        case "strong":
        case "b":
          return `**${childText}**`;
        case "em":
        case "i":
          return `*${childText}*`;
        case "code":
          return `\`${childText}\``;
        case "pre":
          return `\`\`\`\n${childText}\n\`\`\`\n\n`;
        case "a":
          const href = element.getAttribute("href") || "";
          return `[${childText}](${href})`;
        case "ul":
          return children.map(processNode).join("") + "\n";
        case "ol":
          return children.map((child, index) => {
            const text = processNode(child);
            if (text.trim()) {
              return text.replace(/^[-*]\s/, `${index + 1}. `);
            }
            return text;
          }).join("") + "\n";
        case "li":
          return `- ${childText}\n`;
        case "blockquote":
          return `> ${childText}\n\n`;
        case "hr":
          return "---\n\n";
        case "br":
          return "\n";
        case "div":
        case "span":
          return childText;
        default:
          return childText;
      }
    }
    
    return result;
  }
  
  markdown = Array.from(temp.childNodes).map(processNode).join("");
  
  // Clean up extra newlines
  markdown = markdown.replace(/\n{3,}/g, "\n\n").trim();
  
  return markdown;
}

/**
 * Download note as Markdown file
 */
export function downloadAsMarkdown(note: Note): void {
  const markdown = `# ${note.title}\n\n${htmlToMarkdown(note.content)}`;
  
  const blob = new Blob([markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${note.title || "Untitled"}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download note as PDF
 */
export function downloadAsPDF(note: Note): void {
  // Create a new window with the note content
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow pop-ups to export as PDF");
    return;
  }
  
  // Build HTML for PDF with proper styling
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${note.title}</title>
        <style>
          @page {
            margin: 2cm;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          
          h1 {
            font-size: 2em;
            margin-bottom: 0.5em;
            border-bottom: 2px solid #0066FF;
            padding-bottom: 0.3em;
          }
          
          h2 {
            font-size: 1.5em;
            margin-top: 1em;
            margin-bottom: 0.5em;
          }
          
          h3 {
            font-size: 1.25em;
            margin-top: 1em;
            margin-bottom: 0.5em;
          }
          
          p {
            margin-bottom: 1em;
          }
          
          code {
            background: #f5f5f5;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 0.9em;
          }
          
          pre {
            background: #f5f5f5;
            padding: 1em;
            border-radius: 5px;
            overflow-x: auto;
            margin-bottom: 1em;
          }
          
          pre code {
            background: transparent;
            padding: 0;
          }
          
          blockquote {
            border-left: 3px solid #0066FF;
            padding-left: 1em;
            margin-left: 0;
            color: #666;
            font-style: italic;
          }
          
          a {
            color: #0066FF;
            text-decoration: underline;
          }
          
          ul, ol {
            margin-bottom: 1em;
            padding-left: 2em;
          }
          
          li {
            margin-bottom: 0.5em;
          }
          
          .metadata {
            color: #666;
            font-size: 0.9em;
            margin-bottom: 2em;
            padding-bottom: 1em;
            border-bottom: 1px solid #ddd;
          }
        </style>
      </head>
      <body>
        <h1>${note.title || "Untitled"}</h1>
        <div class="metadata">
          <div>Created: ${new Date(note.createdAt).toLocaleDateString()}</div>
          <div>Updated: ${new Date(note.updatedAt).toLocaleDateString()}</div>
        </div>
        <div class="content">
          ${note.content}
        </div>
      </body>
    </html>
  `;
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load, then trigger print dialog
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}

/**
 * Print note
 */
export function printNote(note: Note): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow pop-ups to print");
    return;
  }
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${note.title}</title>
        <style>
          @media print {
            @page {
              margin: 2cm;
            }
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          
          h1 {
            font-size: 2em;
            margin-bottom: 0.5em;
            border-bottom: 2px solid #0066FF;
            padding-bottom: 0.3em;
          }
          
          h2 {
            font-size: 1.5em;
            margin-top: 1em;
            margin-bottom: 0.5em;
            page-break-after: avoid;
          }
          
          h3 {
            font-size: 1.25em;
            margin-top: 1em;
            margin-bottom: 0.5em;
            page-break-after: avoid;
          }
          
          p {
            margin-bottom: 1em;
            orphans: 3;
            widows: 3;
          }
          
          code {
            background: #f5f5f5;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 0.9em;
          }
          
          pre {
            background: #f5f5f5;
            padding: 1em;
            border-radius: 5px;
            overflow-x: auto;
            margin-bottom: 1em;
            page-break-inside: avoid;
          }
          
          pre code {
            background: transparent;
            padding: 0;
          }
          
          blockquote {
            border-left: 3px solid #0066FF;
            padding-left: 1em;
            margin-left: 0;
            color: #666;
            font-style: italic;
            page-break-inside: avoid;
          }
          
          a {
            color: #0066FF;
            text-decoration: underline;
          }
          
          ul, ol {
            margin-bottom: 1em;
            padding-left: 2em;
          }
          
          li {
            margin-bottom: 0.5em;
          }
          
          .metadata {
            color: #666;
            font-size: 0.9em;
            margin-bottom: 2em;
            padding-bottom: 1em;
            border-bottom: 1px solid #ddd;
          }
        </style>
      </head>
      <body>
        <h1>${note.title || "Untitled"}</h1>
        <div class="metadata">
          <div>Created: ${new Date(note.createdAt).toLocaleDateString()}</div>
          <div>Updated: ${new Date(note.updatedAt).toLocaleDateString()}</div>
        </div>
        <div class="content">
          ${note.content}
        </div>
      </body>
    </html>
  `;
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    // Close window after printing
    printWindow.onafterprint = () => {
      printWindow.close();
    };
  };
}
