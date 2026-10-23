import { recognize } from 'tesseract.js';

/**
 * Extracts text from an image file using Tesseract.js OCR engine
 * @param {File|Blob|string} imageSource File, Blob, or image URL
 * @param {function} onProgress Callback function receiving progress status object: { status: string, progress: number }
 * @returns {Promise<{success: boolean, text: string, confidence: number, error: string|null}>}
 */
export async function extractTextFromImage(imageSource, onProgress = () => {}) {
  try {
    onProgress({ status: 'Initializing OCR engine...', progress: 10 });

    const result = await recognize(
      imageSource,
      'eng',
      {
        logger: (m) => {
          if (m.status === 'loading tesseract core') {
            onProgress({ status: 'Loading OCR core...', progress: 20 });
          } else if (m.status === 'initializing tesseract') {
            onProgress({ status: 'Initializing language model...', progress: 35 });
          } else if (m.status === 'recognizing text') {
            const pct = Math.min(95, Math.round(35 + (m.progress || 0) * 60));
            onProgress({
              status: `Recognizing text (${Math.round((m.progress || 0) * 100)}%)...`,
              progress: pct,
            });
          }
        },
      }
    );

    const rawText = result.data.text || '';
    const cleanedText = rawText.trim();
    const confidence = result.data.confidence || 0;

    onProgress({ status: 'Text extraction complete', progress: 100 });

    return {
      success: true,
      text: cleanedText,
      confidence,
      error: null,
    };
  } catch (error) {
    console.error('Tesseract OCR error:', error);
    onProgress({ status: 'Extraction failed', progress: 0 });
    return {
      success: false,
      text: '',
      confidence: 0,
      error: error.message || 'Failed to extract text from the selected image.',
    };
  }
}
