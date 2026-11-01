import React, { useState, useEffect } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Download,
  Smartphone,
  X,
  CheckCircle,
  Share2,
  PlusSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { triggerHaptic } from '../utils/audioFeedback';

export const PWAInstallButton: React.FC<{
  variant?: 'header' | 'banner' | 'card' | 'floating';
}> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    setIsAndroid(/android/.test(ua));
  }, []);

  // If already installed as standalone app, show subtle badge or hide
  if (isInstalled) {
    if (variant === 'card') {
      return (
        <div className="flex items-center gap-2 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>Aplikasi NotaKirim telah terpasang di HP Anda. Siap dipakai offline!</span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    triggerHaptic(20);
    if (isInstallable) {
      const outcome = await install();
      if (!outcome) {
        // If dismissed or failed, show guidance modal
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  // Header Button Variant
  if (variant === 'header') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/25 active:scale-95 transition-all"
          title="Instal aplikasi NotaKirim di HP"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Instal di HP</span>
        </button>

        {showModal && (
          <InstallGuidanceModal
            isIOS={isIOS}
            isAndroid={isAndroid}
            onClose={() => setShowModal(false)}
            onDirectInstall={isInstallable ? install : undefined}
          />
        )}
      </>
    );
  }

  // Floating Action Variant
  if (variant === 'floating') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className="fixed bottom-20 right-4 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-extrabold text-xs shadow-2xl shadow-cyan-500/40 border border-cyan-300/40 animate-bounce active:scale-95 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Pasang di HP</span>
        </button>

        {showModal && (
          <InstallGuidanceModal
            isIOS={isIOS}
            isAndroid={isAndroid}
            onClose={() => setShowModal(false)}
            onDirectInstall={isInstallable ? install : undefined}
          />
        )}
      </>
    );
  }

  // Card Variant
  return (
    <>
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 p-4 shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">Pasang di Layar Utama HP</h4>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PWA Siap
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Dapatkan ikon aplikasi independen di menu HP Anda. Bisa dibuka tanpa mengetik URL, tanpa browser bar, dan berjalan cepat secara offline.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-md shadow-cyan-500/25 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Instal Aplikasi Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <InstallGuidanceModal
          isIOS={isIOS}
          isAndroid={isAndroid}
          onClose={() => setShowModal(false)}
          onDirectInstall={isInstallable ? install : undefined}
        />
      )}
    </>
  );
};

// Prominent Top Install Banner for Mobile Users
export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    setIsAndroid(/android/.test(ua));
  }, []);

  if (isInstalled || dismissed) return null;

  const handleInstallClick = async () => {
    triggerHaptic(20);
    if (isInstallable) {
      const outcome = await install();
      if (!outcome) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-cyan-950 border border-cyan-500/40 p-3 sm:p-4 shadow-xl mb-4">
        {/* Glow accent */}
        <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shrink-0 shadow-md shadow-cyan-500/25">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                  Instal NotaKirim di HP Anda
                </h4>
                <span className="hidden xs:inline-block text-[9px] font-bold px-1 rounded bg-cyan-500/20 text-cyan-300">
                  Offline Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Cetak & bagikan nota langsung dari layar ponsel tanpa browser bar.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/25 active:scale-95 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instal</span>
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded-lg text-slate-500 hover:text-white transition"
              title="Tutup banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <InstallGuidanceModal
          isIOS={isIOS}
          isAndroid={isAndroid}
          onClose={() => setShowModal(false)}
          onDirectInstall={isInstallable ? install : undefined}
        />
      )}
    </>
  );
};

// Interactive Step-by-Step Install Guidance Modal
const InstallGuidanceModal: React.FC<{
  isIOS: boolean;
  isAndroid: boolean;
  onClose: () => void;
  onDirectInstall?: () => Promise<boolean>;
}> = ({ isIOS, isAndroid, onClose, onDirectInstall }) => {
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>(
    isIOS ? 'ios' : 'android'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl text-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Panduan Instalasi di HP</h3>
              <p className="text-[11px] text-slate-400">Pasang sebagai aplikasi mandiri</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Selector Switch */}
        <div className="flex items-center gap-2 mt-4 p-1 bg-slate-950 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'android'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🤖 Android (Chrome/Samsung)
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'ios'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🍎 iPhone / iPad (Safari)
          </button>
        </div>

        {/* Content for Android */}
        {activeTab === 'android' && (
          <div className="mt-4 space-y-3 text-xs">
            {onDirectInstall && (
              <button
                onClick={async () => {
                  triggerHaptic(20);
                  const res = await onDirectInstall();
                  if (res) onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Tekan Disini Untuk Instal Langsung</span>
              </button>
            )}

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <p className="font-semibold text-white">Cara Pasang via Google Chrome Android:</p>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  1
                </span>
                <p className="text-slate-300">
                  Ketuk ikon <strong>tiga titik menu (⋮)</strong> di pojok kanan atas browser Chrome.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  2
                </span>
                <p className="text-slate-300">
                  Pilih menu <strong>"Instal aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  3
                </span>
                <p className="text-slate-300">
                  Ketuk <strong>Instal</strong>. Ikon <strong>NotaKirim</strong> akan langsung muncul di beranda HP Anda!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content for iOS (Safari) */}
        {activeTab === 'ios' && (
          <div className="mt-4 space-y-3 text-xs leading-relaxed">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <p className="font-semibold text-white">Cara Pasang di iPhone / iPad (Safari):</p>
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0">
                  <Share2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-white font-medium">1. Buka di Safari & Ketuk Tombol Share</p>
                  <p className="text-slate-400 text-[11px]">
                    Ikon kotak panah ke atas di bilah bawah layar Safari.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0">
                  <PlusSquare className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-white font-medium">2. Gulir ke Bawah & Pilih "Tambah ke Layar Utama"</p>
                  <p className="text-slate-400 text-[11px]">
                    (Bahasa Inggris: <em>Add to Home Screen</em>).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-white font-medium">3. Ketuk "Tambah" di Pojok Kanan Atas</p>
                  <p className="text-slate-400 text-[11px]">
                    Aplikasi akan terpasang di layar iPhone tanpa batasan kuota.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Benefits footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Gratis & Bebas Kuota</span>
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
