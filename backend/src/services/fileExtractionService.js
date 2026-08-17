import { extractText as unpdfExtractText, getDocumentProxy } from "unpdf";
import mammoth from "mammoth";

export async function extractTextFromPDF(buffer) {
  try {
    const uint8Array = new Uint8Array(buffer);
    const pdfDoc = await getDocumentProxy(uint8Array);
    const result = await unpdfExtractText(pdfDoc, { mergePages: true });
    if (typeof result === "string") return result;
    if (result && result.text) return result.text;
    if (Array.isArray(result)) return result.join("\n");
    return "";
  } catch (error) {
    console.warn("[FileExtraction] unpdf error, trying fallback:", error.message);
    try {
      const pdfParse = await import("pdf-parse");
      const parse = typeof pdfParse.default === "function" ? pdfParse.default : pdfParse;
      const data = await parse(buffer);
      return data.text || "";
    } catch (fallbackError) {
      console.error("[FileExtraction] Failed to extract text from PDF:", fallbackError.message);
      return "";
    }
  }
}

export async function extractTextFromDOCX(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  } catch (error) {
    console.error("[FileExtraction] Error extracting text from DOCX:", error.message);
    return "";
  }
}

export async function extractText(fileBuffer, filename) {
  const lowerName = (filename || "").toLowerCase();
  if (lowerName.endsWith(".pdf")) {
    return await extractTextFromPDF(fileBuffer);
  } else if (lowerName.endsWith(".docx")) {
    return await extractTextFromDOCX(fileBuffer);
  }
  return "";
}

export default {
  extractText,
  extractTextFromPDF,
  extractTextFromDOCX,
};
