import React from 'react';
import { OCRProgress, OCREngine } from '../types';
import { Cpu, Sparkles, ShieldCheck } from 'lucide-react';

interface ScanProgressBarProps {
  progress: OCRProgress;
  engine: OCREngine;
}

export const ScanProgressBar: React.FC<ScanProgressBarProps> = ({ progress, engine }) => {
  const percent = Math.min(100, Math.max(0, Math.round(progress.progress * 100)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-center">
        {/* Animated Scanning Icon */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 overflow-hidden">
          {engine === 'tesseract' ? (
            <Cpu className="w-8 h-8 animate-pulse text-cyan-400" />
          ) : (
            <Sparkles className="w-8 h-8 animate-spin text-amber-300" />
          )}

          {/* Sweeping laser inside icon */}
          <div className="absolute inset-x-0 h-1 bg-cyan-400 shadow-[0_0_8px_#38bdf8] animate-scanner-beam" />
        </div>

        <h3 className="text-base font-bold text-white mb-1">
          {engine === 'tesseract' ? 'Memindai Dokumen (Offline)' : 'Memproses dengan AI Vision'}
        </h3>
        <p className="text-xs text-slate-400 min-h-[36px] flex items-center justify-center px-2">
          {progress.status || 'Mengekstraksi karakter teks...'}
        </p>

        {/* Progress Bar Container */}
        <div className="mt-4 mb-2">
          <div className="flex justify-between text-xs font-mono mb-1.5">
            <span className="text-slate-400">Progres</span>
            <span className="text-cyan-400 font-bold">{percent}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 rounded-full transition-all duration-200"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Offline Privacy Note */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Privasi aman: Ekstraksi lokal tanpa internet</span>
        </div>
      </div>
    </div>
  );
};
