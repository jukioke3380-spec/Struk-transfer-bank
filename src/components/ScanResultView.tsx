import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  Share2,
  Download,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Save,
  FileText,
  FileSpreadsheet,
  FileCode,
  Tag,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { ScanResult, DocumentCategory, OCREngine, OCRLanguage } from '../types';
import { triggerHaptic, playSuccessChime } from '../utils/audioFeedback';

interface ScanResultViewProps {
  initialText: string;
  confidence: number;
  engine: OCREngine;
  language: OCRLanguage;
  thumbnailUrl?: string;
  onSaveToHistory: (scan: ScanResult) => void;
  onScanAnother: () => void;
  isSaved?: boolean;
}

export const ScanResultView: React.FC<ScanResultViewProps> = ({
  initialText,
  confidence,
  engine,
  language,
  thumbnailUrl,
  onSaveToHistory,
  onScanAnother,
  isSaved = false,
}) => {
  const [text, setText] = useState(initialText);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('dokumen');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(isSaved);
  const [showShareToast, setShowShareToast] = useState(false);

  // Text to Speech (TTS) states
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [isPausedTTS, setIsPausedTTS] = useState(false);
  const [ttsRate, setTtsRate] = useState<number>(1);

  // Auto detect title & category on mount
  useEffect(() => {
    const lines = initialText.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length > 0) {
      const firstLine = lines[0].replace(/[#*_-]/g, '').trim().slice(0, 35);
      setTitle(firstLine || 'Dokumen Pindai');
    } else {
      setTitle('Dokumen Pindai');
    }

    // Auto classify category
    const lower = initialText.toLowerCase();
    if (lower.includes('total') || lower.includes('struk') || lower.includes('tunai') || lower.includes('rp')) {
      setCategory('struk');
    } else if (lower.includes('nik') || lower.includes('nama') || lower.includes('penduduk')) {
      setCategory('ktp');
    } else if (lower.includes('bab ') || lower.includes('halaman') || lower.includes('penerbit')) {
      setCategory('buku');
    }

    playSuccessChime();
  }, [initialText]);

  // Clean TTS when unmounting
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charCount = text.length;
  const estimatedReadMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Copy to clipboard
  const handleCopy = async () => {
    triggerHaptic(20);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  // Text formatting utilities
  const formatRemoveBreaks = () => {
    triggerHaptic(10);
    // Replace single line breaks with space, but keep double line breaks (paragraphs)
    const cleaned = text
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.replace(/\n/g, ' ').replace(/\s{2,}/g, ' ').trim())
      .join('\n\n');
    setText(cleaned);
  };

  const formatUpperCase = () => {
    triggerHaptic(10);
    setText(text.toUpperCase());
  };

  const formatLowerCase = () => {
    triggerHaptic(10);
    setText(text.toLowerCase());
  };

  const formatTitleCase = () => {
    triggerHaptic(10);
    const titleCased = text
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    setText(titleCased);
  };

  // TTS playback
  const toggleTTS = () => {
    triggerHaptic(15);
    if (!('speechSynthesis' in window)) {
      alert('Browser Anda tidak mendukung Text-to-Speech');
      return;
    }

    if (isPlayingTTS) {
      if (isPausedTTS) {
        window.speechSynthesis.resume();
        setIsPausedTTS(false);
      } else {
        window.speechSynthesis.pause();
        setIsPausedTTS(true);
      }
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'eng' ? 'en-US' : 'id-ID';
    utterance.rate = ttsRate;

    utterance.onstart = () => {
      setIsPlayingTTS(true);
      setIsPausedTTS(false);
    };

    utterance.onend = () => {
      setIsPlayingTTS(false);
      setIsPausedTTS(false);
    };

    utterance.onerror = () => {
      setIsPlayingTTS(false);
      setIsPausedTTS(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopTTS = () => {
    triggerHaptic(10);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingTTS(false);
    setIsPausedTTS(false);
  };

  // Web Share API
  const handleShare = async () => {
    triggerHaptic(15);
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Hasil Pindai LensaTeks',
          text: text,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      handleCopy();
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2500);
    }
  };

  // File Download Helpers
  const downloadTXT = () => {
    triggerHaptic(15);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_') || 'scan'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    triggerHaptic(15);
    const data = {
      title,
      category,
      extractedText: text,
      confidence,
      engine,
      language,
      wordCount,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_') || 'scan'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintOrPDF = () => {
    triggerHaptic(15);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            h1 { font-size: 20px; border-bottom: 2px solid #0284c7; padding-bottom: 8px; margin-bottom: 20px; }
            .meta { font-size: 12px; color: #64748b; margin-bottom: 24px; }
            pre { white-space: pre-wrap; font-family: inherit; font-size: 14px; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="meta">Dipindai via LensaTeks OCR PWA | Tanggal: ${new Date().toLocaleDateString('id-ID')} | Kategori: ${category.toUpperCase()} | Akurasi: ${confidence}%</div>
          <pre>${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Save to IndexedDB
  const handleSave = () => {
    triggerHaptic(20);
    const item: ScanResult = {
      id: 'scan_' + Date.now(),
      title: title || 'Dokumen Tanpa Judul',
      text,
      confidence,
      wordCount,
      engine,
      language,
      category,
      thumbnailUrl,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    onSaveToHistory(item);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto pb-20 animate-in fade-in">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between mb-3 px-1">
        <button
          onClick={onScanAnother}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold active:scale-95 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Pindai Ulang</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Accuracy Score Pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
              confidence >= 85
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Akurasi {confidence}%</span>
          </div>

          {/* Engine Pill */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span className="capitalize">{engine === 'tesseract' ? 'Offline' : 'AI Gemini'}</span>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md space-y-4">
        {/* Title and Category Editor */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul Dokumen..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm font-semibold text-white focus:outline-none focus:border-cyan-500 transition"
          />

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                className="appearance-none bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 font-medium py-2 pl-3 pr-7 rounded-xl focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="dokumen">📄 Dokumen</option>
                <option value="struk">🧾 Struk Belanja</option>
                <option value="ktp">🪪 Kartu / KTP</option>
                <option value="buku">📖 Kutipan Buku</option>
                <option value="catatan">📝 Catatan</option>
                <option value="lainnya">📌 Lainnya</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <Tag className="w-3 h-3" />
              </div>
            </div>

            {/* Save to Offline History Button */}
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition active:scale-95 ${
                savedSuccess
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
              }`}
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tersimpan</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Thumbnail Preview strip (if exists) */}
        {thumbnailUrl && (
          <div className="flex items-center gap-3 p-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <img
              src={thumbnailUrl}
              alt="Thumbnail Dokumen"
              className="w-12 h-12 object-cover rounded-lg border border-slate-700 shrink-0"
            />
            <div className="text-xs text-slate-400">
              <span className="text-slate-200 font-medium">{wordCount} kata</span> •{' '}
              <span>{charCount} karakter</span> • <span>~{estimatedReadMinutes} mnt baca</span>
            </div>
          </div>
        )}

        {/* Quick Text Formatting Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-slate-400 text-[11px] mr-1">Format Cepat:</span>
          <button
            onClick={formatRemoveBreaks}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] transition"
            title="Gabungkan baris yang terputus"
          >
            Rapikan Baris
          </button>
          <button
            onClick={formatTitleCase}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] transition"
          >
            Judul (Aa)
          </button>
          <button
            onClick={formatUpperCase}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] transition"
          >
            HURUF BESAR
          </button>
          <button
            onClick={formatLowerCase}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] transition"
          >
            kecil
          </button>

          {/* TTS Player Widget */}
          <div className="flex items-center gap-1 ml-auto bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={toggleTTS}
              className={`p-1.5 rounded-md text-xs transition ${
                isPlayingTTS
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
              title={isPlayingTTS ? 'Jeda Suara' : 'Dengarkan Teks (TTS)'}
            >
              {isPlayingTTS && !isPausedTTS ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
            </button>
            {isPlayingTTS && (
              <button
                onClick={stopTTS}
                className="p-1.5 rounded-md text-slate-400 hover:text-white"
                title="Hentikan Suara"
              >
                <VolumeX className="w-3.5 h-3.5" />
              </button>
            )}
            <select
              value={ttsRate}
              onChange={(e) => setTtsRate(parseFloat(e.target.value))}
              className="bg-transparent text-[10px] text-slate-400 px-1 py-0.5 outline-none cursor-pointer"
            >
              <option value="0.8">0.8x</option>
              <option value="1">1.0x</option>
              <option value="1.2">1.2x</option>
              <option value="1.5">1.5x</option>
            </select>
          </div>
        </div>

        {/* Extracted Textarea */}
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            className="w-full bg-slate-950 font-mono text-xs sm:text-sm text-slate-100 leading-relaxed p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 transition resize-y selection:bg-cyan-500/30 selection:text-cyan-200"
            placeholder="Teks hasil ekstraksi..."
          />
        </div>

        {/* Action Buttons: Copy, Share, Exports */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
          {/* Primary Copy Button */}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition active:scale-95 ${
              copied
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Tersalin ke Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Salin Teks Lengkap</span>
              </>
            )}
          </button>

          {/* Secondary Actions */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
              title="Bagikan ke WhatsApp, Telegram, dll"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Bagikan</span>
            </button>

            <button
              onClick={downloadTXT}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
              title="Unduh file .txt"
            >
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              <span>TXT</span>
            </button>

            <button
              onClick={handlePrintOrPDF}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
              title="Cetak atau Simpan sebagai PDF"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>PDF / Cetak</span>
            </button>

            <button
              onClick={downloadJSON}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
              title="Unduh format JSON"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-400" />
              <span>JSON</span>
            </button>
          </div>
        </div>

        {showShareToast && (
          <div className="p-2 text-center rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs animate-in fade-in">
            Teks disalin ke papan klip! Anda dapat menempelkannya ke WhatsApp atau aplikasi lain.
          </div>
        )}
      </div>
    </div>
  );
};
