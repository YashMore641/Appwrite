import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Initialize PDF.js worker using Vite asset URL
try {
  if (pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
  }
} catch (e) {
  console.warn('PDF.js worker setup warning:', e);
}

/**
 * Extracts selectable text from a PDF file using PDF.js
 * @param {File|Blob|ArrayBuffer} pdfSource 
 * @param {function} onProgress Callback receiving { status: string, progress: number, totalPages: number, currentPage: number }
 * @returns {Promise<{success: boolean, text: string, isScanned: boolean, totalPages: number, error: string|null}>}
 */
export async function extractTextFromPDF(pdfSource, onProgress = () => {}) {
  try {
    onProgress({ status: 'Loading PDF document...', progress: 10, totalPages: 0, currentPage: 0 });

    let arrayBuffer;
    if (pdfSource instanceof ArrayBuffer) {
      arrayBuffer = pdfSource;
    } else if (pdfSource instanceof Blob || pdfSource instanceof File) {
      arrayBuffer = await pdfSource.arrayBuffer();
    } else {
      throw new Error('Unsupported PDF source type.');
    }

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });

    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;

    if (numPages === 0) {
      return {
        success: true,
        text: '',
        isScanned: false,
        totalPages: 0,
        error: 'PDF has no pages.',
      };
    }

    const pageTexts = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const pct = Math.round(15 + (pageNum / numPages) * 80);
      onProgress({
        status: `Reading page ${pageNum} of ${numPages}...`,
        progress: pct,
        totalPages: numPages,
        currentPage: pageNum,
      });

      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageStrings = textContent.items
        .map((item) => (item.str !== undefined ? item.str : ''))
        .filter((str) => str.trim().length > 0);

      if (pageStrings.length > 0) {
        pageTexts.push(`--- Page ${pageNum} ---\n` + pageStrings.join(' '));
      }
    }

    const fullText = pageTexts.join('\n\n').trim();
    // If very little text is found across all pages, document is likely a scanned image
    const isScanned = fullText.length < 20;

    onProgress({
      status: isScanned ? 'Scanned document detected' : 'Extraction complete',
      progress: 100,
      totalPages: numPages,
      currentPage: numPages,
    });

    return {
      success: true,
      text: fullText,
      isScanned,
      totalPages: numPages,
      error: null,
    };
  } catch (error) {
    console.error('PDF extraction error:', error);
    onProgress({ status: 'Extraction failed', progress: 0, totalPages: 0, currentPage: 0 });

    return {
      success: false,
      text: '',
      isScanned: false,
      totalPages: 0,
      error: error.message || 'Failed to extract text from this PDF file.',
    };
  }
}
