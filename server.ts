import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// Gemini AI Vision OCR endpoint (Online High-Accuracy Mode)
app.post('/api/gemini-ocr', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        error: 'GEMINI_API_KEY tidak dikonfigurasi di server. Silakan gunakan Mesin Offline Tesseract.',
      });
    }

    const { imageBase64, mimeType = 'image/jpeg', mode = 'standard', language = 'ind' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Data gambar base64 tidak ditemukan' });
    }

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const ai = new GoogleGenAI({ apiKey });

    let systemInstruction = `You are a high-precision OCR (Optical Character Recognition) engine specializing in Indonesian and multilingual document scanning.
Extract all visible text from the image accurately, preserving paragraph breaks, lists, and formatting. Do not make up text. Do not add conversational replies, markdown code blocks, or greetings unless requested.`;

    let prompt = `Ekstrak seluruh teks yang terbaca dari gambar ini secara persis dan lengkap. Pertahankan tata letak dan baris paragraf aslinya.`;

    if (mode === 'receipt') {
      prompt = `Ekstrak dan analisis struk/kwitansi ini ke dalam format terstruktur:
Teks Lengkap:
[Semua teks asli]

---
Ringkasan Struk:
- Toko / Merchant: 
- Tanggal & Waktu:
- Nomor Struk / Transaksi:
- Item & Harga:
- Total Belanja:
- Metode Pembayaran:`;
    } else if (mode === 'idcard') {
      prompt = `Ekstrak teks kartu identitas / ID Card / KTP ini secara lengkap dan kategorikan field-field pentingnya (NIK/Nomor ID, Nama, Alamat, Tanggal Lahir, dll).`;
    } else if (mode === 'translate') {
      prompt = `Ekstrak teks dari gambar ini dan terjemahkan ke ${language === 'ind' ? 'Bahasa Indonesia' : 'English'}.
Sajikan dalam format:
[TEKS ASLI]
...

[TERJEMAHAN]
...`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: cleanBase64,
                mimeType,
              },
            },
          ],
        },
      ],
      config: {
        systemInstruction,
        temperature: 0.1,
      },
    });

    const extractedText = response.text || '';

    return res.json({
      success: true,
      text: extractedText,
      engine: 'gemini-2.5-flash',
      wordCount: extractedText.trim().split(/\s+/).filter(Boolean).length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Gemini OCR Error:', error);
    return res.status(500).json({
      error: error.message || 'Gagal memproses gambar dengan Gemini AI',
    });
  }
});

// Vite middleware in dev, static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`LensaTeks OCR PWA Server running on port ${port} [isDev: ${isDev}]`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
