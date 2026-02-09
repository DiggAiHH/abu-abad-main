import Tesseract from 'tesseract.js';

/**
 * Extrahiert Text aus einem Bild mittels Tesseract.js (clientseitige OCR).
 * Unterstützt Deutsch und Englisch. Funktioniert in allen modernen Browsern.
 *
 * @param file - Die Bild-Datei (File-Objekt)
 * @returns Der extrahierte Text
 */
export async function extractTextFromImageFile(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Die Datei ist kein unterstütztes Bildformat.');
  }

  try {
    const { data } = await Tesseract.recognize(file, 'deu+eng', {
      logger: () => {}, // Stille Logs
    });

    const text = (data.text || '')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[\t ]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return text;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
    throw new Error(`OCR-Texterkennung fehlgeschlagen: ${message}`);
  }
}
