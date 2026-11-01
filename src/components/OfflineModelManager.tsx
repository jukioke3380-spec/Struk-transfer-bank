import React, { useState } from 'react';
import {
  DownloadCloud,
  CheckCircle2,
  HardDrive,
  Cpu,
  RefreshCw,
  Info,
  ShieldCheck,
  Smartphone,
  Zap,
} from 'lucide-react';
import { OCRLanguage, OCRProgress } from '../types';
import { preheatLanguageModel } from '../services/ocrService';
import { triggerHaptic } from '../utils/audioFeedback';
import { PWAInstallButton } from './PWAInstallButton';

interface OfflineModelManagerProps {
  isOnline: boolean;
}

export const OfflineModelManager: React.FC<OfflineModelManagerProps> = ({ isOnline }) => {
  const [downloadingLang, setDownloadingLang] = useState<OCRLanguage | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<OCRProgress | null>(null);
  const [cachedLanguages, setCachedLanguages] = useState<Record<string, boolean>>({
    ind: false,
    eng: false,
  });

  const handlePreload = async (lang: OCRLanguage) => {
    triggerHaptic(20);
    setDownloadingLang(lang);

    const success = await preheatLanguageModel(lang, (prog) => {
      setDownloadProgress(prog);
    });

    if (success) {
      setCachedLanguages((prev) => ({ ...prev, [lang]: true }));
    }
    setDownloadingLang(null);
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto pb-24 animate-in fade-in space-y-4">
      {/* Title */}
      <div className="px-1">
        <h2 className="text-lg font-bold text-white">Mode Offline & Pengaturan PWA</h2>
        <p className="text-xs text-slate-400">
          Kelola kamus bahasa OCR offline, Service Worker, dan instalasi HP
        </p>
      </div>

      {/* PWA Install Promo */}
      <PWAInstallButton variant="card" />

      {/* Service Worker Status Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Service Worker Cache</h4>
              <p className="text-xs text-slate-400">Aset UI & mesin Web Worker tersimpan lokal</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Aktif
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed">
          Semua kode aplikasi, ikon, dan format nota di-cache oleh Service Worker browser. Anda dapat membuka aplikasi, membuat nota, dan mencetak bukti transfer secara offline saat ponsel dalam mode pesawat atau tanpa sinyal internet.
        </div>
      </div>

      {/* Offline Language Dictionary Manager */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Kamus OCR Tesseract (Offline)</h4>
              <p className="text-xs text-slate-400">Unduh sekali untuk ekstraksi tanpa kuota</p>
            </div>
          </div>
        </div>

        {downloadingLang && downloadProgress && (
          <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-cyan-300 font-medium">{downloadProgress.status}</span>
              <span className="text-cyan-400 font-bold font-mono">
                {Math.round(downloadProgress.progress * 100)}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-200"
                style={{ width: `${Math.round(downloadProgress.progress * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Language Options */}
        <div className="space-y-2 pt-1">
          {/* Bahasa Indonesia */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-xl">🇮🇩</span>
              <div>
                <h5 className="text-xs font-bold text-white">Bahasa Indonesia (ind)</h5>
                <p className="text-[11px] text-slate-400">Dioptimalkan untuk dokumen, struk & surat RI</p>
              </div>
            </div>

            {cachedLanguages.ind ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Tersimpan</span>
              </span>
            ) : (
              <button
                onClick={() => handlePreload('ind')}
                disabled={downloadingLang !== null || !isOnline}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition disabled:opacity-40"
              >
                {downloadingLang === 'ind' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <DownloadCloud className="w-3.5 h-3.5" />
                )}
                <span>Unduh ({downloadingLang === 'ind' ? 'Proses...' : 'Siapkan'})</span>
              </button>
            )}
          </div>

          {/* Bahasa Inggris */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-xl">🇬🇧</span>
              <div>
                <h5 className="text-xs font-bold text-white">English (eng)</h5>
                <p className="text-[11px] text-slate-400">Standar internasional teks latin</p>
              </div>
            </div>

            {cachedLanguages.eng ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Tersimpan</span>
              </span>
            ) : (
              <button
                onClick={() => handlePreload('eng')}
                disabled={downloadingLang !== null || !isOnline}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition disabled:opacity-40"
              >
                {downloadingLang === 'eng' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <DownloadCloud className="w-3.5 h-3.5" />
                )}
                <span>Unduh ({downloadingLang === 'eng' ? 'Proses...' : 'Siapkan'})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Accuracy Tips */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <h4 className="text-sm font-bold text-white">Tips Ekstraksi Teks 99% Akurat</h4>
        </div>
        <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside leading-relaxed">
          <li>
            <strong>Pencahayaan:</strong> Hindari bayangan tangan atau cahaya silang. Aktifkan lampu kilat kamera di ruangan gelap.
          </li>
          <li>
            <strong>Sudut Kamera:</strong> Pegang ponsel tegak lurus sejajar dengan bidang kertas.
          </li>
          <li>
            <strong>Binarisasi Otomatis:</strong> Selalu gunakan filter binarisasi (B&W Otsu) di editor sebelum memindai; filter ini memisahkan tinta dari noda/bayangan kertas.
          </li>
          <li>
            <strong>Rotasi:</strong> Pastikan teks tidak terbalik (gunakan tombol Putar 90° jika gambar miring).
          </li>
        </ul>
      </div>
    </div>
  );
};
