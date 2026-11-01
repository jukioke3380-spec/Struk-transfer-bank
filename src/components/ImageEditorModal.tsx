import React, { useState, useEffect } from 'react';
import {
  RotateCw,
  Sun,
  Contrast,
  Sliders,
  Sparkles,
  Check,
  X,
  Eye,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { ImageProcessingOptions } from '../types';
import { processImageForOCR, loadImage } from '../utils/imageProcessing';
import { triggerHaptic } from '../utils/audioFeedback';

interface ImageEditorModalProps {
  rawImageDataUrl: string;
  onConfirm: (processedImageDataUrl: string) => void;
  onCancel: () => void;
}

const DEFAULT_OPTIONS: ImageProcessingOptions = {
  grayscale: false,
  contrast: 20,
  brightness: 5,
  binarize: true, // Auto-binarize on by default for max text clarity!
  thresholdValue: 0, // 0 = Auto Otsu threshold
  invert: false,
  sharpness: true,
  rotation: 0,
};

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
  rawImageDataUrl,
  onConfirm,
  onCancel,
}) => {
  const [options, setOptions] = useState<ImageProcessingOptions>(DEFAULT_OPTIONS);
  const [previewUrl, setPreviewUrl] = useState<string>(rawImageDataUrl);
  const [isProcessingPreview, setIsProcessingPreview] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  // Re-process preview whenever options change
  useEffect(() => {
    let isCancelled = false;

    async function updatePreview() {
      setIsProcessingPreview(true);
      try {
        const img = await loadImage(rawImageDataUrl);
        const processed = await processImageForOCR(img, options);
        if (!isCancelled) {
          setPreviewUrl(processed);
        }
      } catch (err) {
        console.error('Failed to update preview:', err);
      } finally {
        if (!isCancelled) {
          setIsProcessingPreview(false);
        }
      }
    }

    const timer = setTimeout(updatePreview, 60);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [rawImageDataUrl, options]);

  const handleRotate = () => {
    triggerHaptic(15);
    setOptions((prev) => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360,
    }));
  };

  const toggleBinarize = () => {
    triggerHaptic(15);
    setOptions((prev) => ({
      ...prev,
      binarize: !prev.binarize,
    }));
  };

  const toggleInvert = () => {
    triggerHaptic(15);
    setOptions((prev) => ({
      ...prev,
      invert: !prev.invert,
    }));
  };

  const toggleSharpen = () => {
    triggerHaptic(15);
    setOptions((prev) => ({
      ...prev,
      sharpness: !prev.sharpness,
    }));
  };

  const handleReset = () => {
    triggerHaptic(15);
    setOptions({
      ...DEFAULT_OPTIONS,
      binarize: false,
      contrast: 0,
      brightness: 0,
      sharpness: false,
      rotation: 0,
    });
  };

  const handleStartOCR = () => {
    triggerHaptic(25);
    onConfirm(previewUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 animate-in fade-in">
      <div className="flex flex-col w-full max-w-xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Pra-Pemrosesan Gambar (Akurasi Tinggi)</h3>
              <p className="text-[11px] text-slate-400">Optimalkan kontras dokumen sebelum OCR</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Preview Canvas */}
        <div className="relative flex-1 min-h-[260px] max-h-[420px] bg-slate-950 flex items-center justify-center p-3 overflow-hidden">
          <img
            src={showOriginal ? rawImageDataUrl : previewUrl}
            alt="Preview"
            className="max-h-full max-w-full object-contain rounded-lg border border-slate-800 shadow-md transition-all duration-150"
          />

          {isProcessingPreview && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-[1px]">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-xs text-cyan-300">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Memproses filter...</span>
              </div>
            </div>
          )}

          {/* Quick Comparison Toggle Button */}
          <button
            onMouseDown={() => setShowOriginal(true)}
            onMouseUp={() => setShowOriginal(false)}
            onTouchStart={() => setShowOriginal(true)}
            onTouchEnd={() => setShowOriginal(false)}
            className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/85 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold backdrop-blur-md shadow-lg select-none active:scale-95 transition"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tahan: Asli</span>
          </button>
        </div>

        {/* Toolbar Controls */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 space-y-3.5">
          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={toggleBinarize}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                options.binarize
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Binarisasi Otomatis (Teks Tajam)</span>
            </button>

            <button
              onClick={handleRotate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 transition"
              title="Putar 90 Derajat"
            >
              <RotateCw className="w-3.5 h-3.5 text-sky-400" />
              <span>Putar 90° ({options.rotation}°)</span>
            </button>

            <button
              onClick={toggleInvert}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                options.invert
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
              }`}
              title="Balikkan warna gelap & terang"
            >
              <Contrast className="w-3.5 h-3.5" />
              <span>Invert Warna</span>
            </button>

            <button
              onClick={toggleSharpen}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                options.sharpness
                  ? 'bg-indigo-500 text-white font-bold'
                  : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Pertajam Font</span>
            </button>

            <button
              onClick={handleReset}
              className="text-[11px] text-slate-400 hover:text-white ml-auto underline"
            >
              Reset Normal
            </button>
          </div>

          {/* Sliders: Contrast & Brightness */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span className="flex items-center gap-1">
                  <Contrast className="w-3 h-3 text-cyan-400" />
                  Kontras
                </span>
                <span className="font-mono">{options.contrast > 0 ? `+${options.contrast}` : options.contrast}</span>
              </div>
              <input
                type="range"
                min="-60"
                max="80"
                value={options.contrast}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, contrast: parseInt(e.target.value, 10) }))
                }
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span className="flex items-center gap-1">
                  <Sun className="w-3 h-3 text-amber-400" />
                  Kecerahan
                </span>
                <span className="font-mono">{options.brightness > 0 ? `+${options.brightness}` : options.brightness}</span>
              </div>
              <input
                type="range"
                min="-60"
                max="60"
                value={options.brightness}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, brightness: parseInt(e.target.value, 10) }))
                }
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition"
            >
              Ambil Ulang
            </button>
            <button
              onClick={handleStartOCR}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 active:scale-98 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Mulai Ekstraksi Teks (OCR)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
