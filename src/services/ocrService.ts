import { createWorker, Worker } from 'tesseract.js';
import { OCRLanguage, OCREngine, OCRProgress, ScanResult, DocumentCategory } from '../types';

let cachedWorker: Worker | null = null;
let currentWorkerLang: string | null = null;

export async function getTesseractWorker(
  lang: OCRLanguage,
  onProgress?: (progress: OCRProgress) => void
): Promise<Worker> {
  const langKey = lang === 'ind+eng' ? 'ind+eng' : lang;

  if (cachedWorker && currentWorkerLang === langKey) {
    return cachedWorker;
  }

  if (cachedWorker) {
    try {
      await cachedWorker.terminate();
    } catch {
      // Ignore
    }
    cachedWorker = null;
  }

  onProgress?.({
    status: 'Inisialisasi Web Worker OCR Offline...',
    progress: 0.1,
    stage: 'loading_engine',
  });

  const worker = await createWorker(langKey, 1, {
    logger: (m) => {
      let stage: OCRProgress['stage'] = 'recognizing';
      let statusText = m.status;

      if (m.status.includes('loading') || m.status.includes('downloading')) {
        stage = 'loading_engine';
        statusText = `Mengunduh/Memuat kamus bahasa (${Math.round((m.progress || 0) * 100)}%)...`;
      } else if (m.status.includes('init')) {
        stage = 'loading_engine';
        statusText = 'Menyiapkan modul OCR lokal...';
      } else if (m.status.includes('recogniz')) {
        stage = 'recognizing';
        statusText = `Mengekstraksi teks dokumen (${Math.round((m.progress || 0) * 100)}%)...`;
      }

      onProgress?.({
        status: statusText,
        progress: m.progress || 0,
        stage,
      });
    },
  });

  cachedWorker = worker;
  currentWorkerLang = langKey;

  return worker;
}

export async function preheatLanguageModel(
  lang: OCRLanguage,
  onProgress?: (progress: OCRProgress) => void
): Promise<boolean> {
  try {
    await getTesseractWorker(lang, onProgress);
    onProgress?.({
      status: `Model offline (${lang.toUpperCase()}) siap di memori HP!`,
      progress: 1,
      stage: 'completed',
    });
    return true;
  } catch (err) {
    console.error('Failed to preheat language model:', err);
    onProgress?.({
      status: 'Gagal mengunduh kamus offline. Periksa koneksi internet untuk download pertama kali.',
      progress: 0,
      stage: 'error',
    });
    return false;
  }
}

export interface PerformOCROptions {
  imageDataUrl: string;
  engine: OCREngine;
  language: OCRLanguage;
  category?: DocumentCategory;
  onProgress?: (progress: OCRProgress) => void;
  isOnline: boolean;
}

export async function performOCR(options: PerformOCROptions): Promise<{
  text: string;
  confidence: number;
  engineUsed: OCREngine;
  wordCount: number;
}> {
  const { imageDataUrl, engine, language, onProgress, isOnline } = options;

  // If Gemini requested and online
  if (engine === 'gemini' && isOnline) {
    try {
      onProgress?.({
        status: 'Menghubungkan ke Gemini 2.5 Flash Vision OCR...',
        progress: 0.3,
        stage: 'recognizing',
      });

      const response = await fetch('/api/gemini-ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageDataUrl,
          mode: options.category === 'struk' ? 'receipt' : options.category === 'ktp' ? 'idcard' : 'standard',
          language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      onProgress?.({
        status: 'Ekstraksi teks selesai!',
        progress: 1,
        stage: 'completed',
      });

      return {
        text: cleanExtractedText(data.text || ''),
        confidence: 98.5,
        engineUsed: 'gemini',
        wordCount: data.wordCount || countWords(data.text || ''),
      };
    } catch (geminiError: any) {
      console.warn('Gemini OCR unavailable, falling back to Offline Tesseract:', geminiError);
      onProgress?.({
        status: 'Koneksi AI dialihkan ke Mesin OCR Offline lokal...',
        progress: 0.2,
        stage: 'loading_engine',
      });
      // Fallback seamlessly to Tesseract
    }
  }

  // Offline Tesseract.js Worker execution
  const worker = await getTesseractWorker(language, onProgress);

  onProgress?.({
    status: 'Menganalisis glif dan karakter gambar...',
    progress: 0.5,
    stage: 'recognizing',
  });

  const result = await worker.recognize(imageDataUrl);

  const rawText = result.data.text || '';
  const cleanedText = cleanExtractedText(rawText);
  const confidence = Math.round(result.data.confidence || 0);

  onProgress?.({
    status: 'Pemindaian selesai!',
    progress: 1,
    stage: 'completed',
  });

  return {
    text: cleanedText,
    confidence,
    engineUsed: 'tesseract',
    wordCount: countWords(cleanedText),
  };
}

export function cleanExtractedText(text: string): string {
  if (!text) return '';

  return text
    // Replace carriage returns
    .replace(/\r\n/g, '\n')
    // Fix broken word hyphenation at line breaks (e.g. "membe-\nrikan" -> "memberikan")
    .replace(/(\w+)-\n(\w+)/g, '$1$2')
    // Remove isolated single garbage characters often found in noisy scans
    .replace(/\n[|~_—]\n/g, '\n')
    // Remove 3 or more consecutive blank lines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function autoDetectCategory(text: string): DocumentCategory {
  const lower = text.toLowerCase();

  if (
    lower.includes('total') ||
    lower.includes('subtotal') ||
    lower.includes('tunai') ||
    lower.includes('kembali') ||
    lower.includes('harga') ||
    lower.includes('struk') ||
    lower.includes('kasir') ||
    lower.includes('rp')
  ) {
    return 'struk';
  }

  if (
    lower.includes('nik') ||
    lower.includes('kartu tanda penduduk') ||
    lower.includes('golongan darah') ||
    lower.includes('agama') ||
    lower.includes('status perkawinan') ||
    lower.includes('berlaku hingga') ||
    lower.includes('nomor induk')
  ) {
    return 'ktp';
  }

  if (
    lower.includes('bab ') ||
    lower.includes('halaman') ||
    lower.includes('daftar pustaka') ||
    lower.includes('penerbit') ||
    lower.includes('isbn')
  ) {
    return 'buku';
  }

  if (
    lower.includes('catatan') ||
    lower.includes('todo') ||
    lower.includes('ringkasan') ||
    lower.includes('agenda')
  ) {
    return 'catatan';
  }

  return 'dokumen';
}

export function generateTitleFromText(text: string, category: DocumentCategory): string {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 2);

  if (lines.length > 0) {
    const firstLine = lines[0].replace(/[#*_-]/g, '').trim();
    if (firstLine.length > 3) {
      return firstLine.slice(0, 38);
    }
  }

  const categoryNames: Record<DocumentCategory, string> = {
    dokumen: 'Dokumen Baru',
    struk: 'Struk Belanja',
    ktp: 'Kartu Identitas',
    buku: 'Kutipan Buku',
    catatan: 'Catatan Singkat',
    lainnya: 'Hasil Pindai',
  };

  const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  return `${categoryNames[category] || 'Pindai'} (${timeStr})`;
}
