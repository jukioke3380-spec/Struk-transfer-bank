import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  RotateCw,
  Zap,
  ZapOff,
  Upload,
  FileText,
  Receipt,
  CreditCard,
  Maximize2,
  RefreshCw,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { playShutterSound, triggerHaptic } from '../utils/audioFeedback';
import { getSampleDocuments, SampleDocument } from '../utils/sampleDocuments';

interface CameraScannerProps {
  onImageCaptured: (imageDataUrl: string) => void;
  isProcessing: boolean;
}

type AspectRatioMode = 'free' | 'a4' | 'receipt' | 'idcard';

export const CameraScanner: React.FC<CameraScannerProps> = ({
  onImageCaptured,
  isProcessing,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [aspectMode, setAspectMode] = useState<AspectRatioMode>('free');
  const [isDragOver, setIsDragOver] = useState(false);
  const [showSamplesModal, setShowSamplesModal] = useState(false);

  const sampleDocs = getSampleDocuments();

  // Initialize camera
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    async function startCamera() {
      setCameraError(null);
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Kamera tidak didukung oleh browser ini.');
        }

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        currentStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        // Check if torch/flashlight is supported
        const track = mediaStream.getVideoTracks()[0];
        if (track) {
          const capabilities = (track.getCapabilities?.() as any) || {};
          setHasTorch(Boolean(capabilities.torch));
        }
      } catch (err: any) {
        console.warn('Camera access error:', err);
        setCameraError(
          err.name === 'NotAllowedError'
            ? 'Izin kamera ditolak. Berikan izin di browser atau gunakan tombol Unggah Foto.'
            : 'Tidak dapat membuka kamera. Silakan pilih foto dari galeri atau gunakan dokumen contoh.'
        );
      }
    }

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  // Toggle torch / flash
  const toggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (!track) return;

    try {
      const nextState = !torchEnabled;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextState }],
      });
      setTorchEnabled(nextState);
      triggerHaptic(15);
    } catch (e) {
      console.warn('Torch constraint error:', e);
    }
  };

  // Flip camera between front and rear
  const flipCamera = () => {
    triggerHaptic(15);
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture frame from video
  const capturePhoto = () => {
    if (!videoRef.current || isProcessing) return;

    triggerHaptic([20, 40]);
    playShutterSound();

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    onImageCaptured(dataUrl);
  };

  // Handle file upload from gallery
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        triggerHaptic(20);
        onImageCaptured(event.target.result);
      }
    };
    reader.readAsDataURL(file);
    // Reset file input
    e.target.value = '';
  };

  // Drag and drop handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          triggerHaptic(20);
          onImageCaptured(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Select sample document
  const handleSelectSample = (sample: SampleDocument) => {
    triggerHaptic(20);
    setShowSamplesModal(false);
    onImageCaptured(sample.dataUrl);
  };

  // Viewfinder aspect ratio styling
  const getAspectRatioClasses = () => {
    switch (aspectMode) {
      case 'a4':
        return 'w-[82%] max-w-[340px] aspect-[1/1.414]';
      case 'receipt':
        return 'w-[68%] max-w-[280px] aspect-[1/1.8]';
      case 'idcard':
        return 'w-[90%] max-w-[360px] aspect-[1.58/1]';
      default:
        return 'w-[92%] max-w-[380px] aspect-[4/3] sm:aspect-[16/10]';
    }
  };

  return (
    <div
      className="relative flex flex-col items-center justify-between min-h-[520px] h-[calc(100vh-140px)] max-h-[760px] w-full max-w-lg mx-auto bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Top Floating Controls */}
      <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between">
        {/* Aspect Ratio Guides */}
        <div className="flex items-center gap-1 bg-slate-950/75 backdrop-blur-md border border-slate-700/60 rounded-xl p-1 shadow-lg">
          <button
            onClick={() => {
              triggerHaptic(10);
              setAspectMode('free');
            }}
            className={`px-2 py-1 rounded-lg text-[11px] font-medium transition ${
              aspectMode === 'free'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Bebas
          </button>
          <button
            onClick={() => {
              triggerHaptic(10);
              setAspectMode('a4');
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition ${
              aspectMode === 'a4'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <FileText className="w-3 h-3" />
            <span>A4</span>
          </button>
          <button
            onClick={() => {
              triggerHaptic(10);
              setAspectMode('receipt');
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition ${
              aspectMode === 'receipt'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Receipt className="w-3 h-3" />
            <span>Struk</span>
          </button>
          <button
            onClick={() => {
              triggerHaptic(10);
              setAspectMode('idcard');
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition ${
              aspectMode === 'idcard'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <CreditCard className="w-3 h-3" />
            <span>KTP</span>
          </button>
        </div>

        {/* Camera Utilities: Torch, Flip */}
        <div className="flex items-center gap-1.5 bg-slate-950/75 backdrop-blur-md border border-slate-700/60 rounded-xl p-1 shadow-lg">
          {hasTorch && (
            <button
              onClick={toggleTorch}
              className={`p-2 rounded-lg transition ${
                torchEnabled
                  ? 'bg-amber-400 text-slate-950'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Lampu Kilat / Flashlight"
            >
              {torchEnabled ? <Zap className="w-4 h-4 fill-current" /> : <ZapOff className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={flipCamera}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Balik Kamera Depan / Belakang"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Viewport & Video Feed */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950">
        {cameraError ? (
          <div className="flex flex-col items-center justify-center p-6 text-center max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
              <Camera className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Akses Kamera Diperlukan</h3>
            <p className="text-xs text-slate-400 mb-4">{cameraError}</p>
            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition"
              >
                <Upload className="w-4 h-4" />
                <span>Pilih Foto dari Galeri</span>
              </button>
              <button
                onClick={() => setShowSamplesModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-semibold text-xs hover:bg-slate-800 transition"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Coba Dokumen Contoh (Langsung)</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Viewfinder Overlay with Glowing Corner Brackets */}
            <div className={`relative ${getAspectRatioClasses()} transition-all duration-300 pointer-events-none z-10`}>
              {/* Outer dimmed mask backdrop handled by inset shadow */}
              <div className="absolute inset-0 border-2 border-cyan-400/50 rounded-2xl shadow-[0_0_0_9999px_rgba(2,6,23,0.65)]">
                {/* 4 Corner Accents */}
                <span className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-cyan-400 rounded-tl-xl" />
                <span className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-cyan-400 rounded-tr-xl" />
                <span className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-cyan-400 rounded-bl-xl" />
                <span className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-cyan-400 rounded-br-xl" />

                {/* Animated Horizontal Laser Scan Beam */}
                <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-scanner-beam" />

                {/* Alignment Crosshair Center */}
                <div className="absolute inset-0 flex items-center justify-center opacity-25">
                  <div className="w-6 h-[1px] bg-cyan-300" />
                  <div className="h-6 w-[1px] bg-cyan-300 -ml-3" />
                </div>
              </div>

              {/* Viewfinder Label */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-cyan-400 border border-cyan-500/30 whitespace-nowrap">
                Posisikan teks di dalam bingkai
              </div>
            </div>
          </>
        )}

        {/* Drag & Drop Feedback */}
        {isDragOver && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-cyan-950/80 backdrop-blur-md border-2 border-dashed border-cyan-400 text-white">
            <Upload className="w-12 h-12 text-cyan-400 animate-bounce mb-2" />
            <p className="text-sm font-bold">Lepaskan file gambar di sini</p>
          </div>
        )}
      </div>

      {/* Bottom Bar: Gallery, Shutter Button, Sample Docs */}
      <div className="relative z-20 w-full bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent pt-6 pb-5 px-6">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          {/* Gallery / File Picker */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-1 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
            title="Pilih dari Galeri Foto"
          >
            <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center">
              <Upload className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-[10px] font-medium">Galeri</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Big Shutter Button */}
          <div className="relative flex items-center justify-center">
            <button
              onClick={capturePhoto}
              disabled={isProcessing}
              className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 via-sky-400 to-indigo-500 p-1 shadow-lg shadow-cyan-500/30 active:scale-90 transition-transform disabled:opacity-50"
              title="Ambil Foto & Pindai"
            >
              <div className="w-full h-full rounded-full border-4 border-slate-950 bg-white group-hover:bg-slate-100 flex items-center justify-center transition">
                <Camera className="w-7 h-7 text-slate-950" />
              </div>
            </button>
          </div>

          {/* Sample Documents Button */}
          <button
            onClick={() => {
              triggerHaptic(10);
              setShowSamplesModal(true);
            }}
            className="flex flex-col items-center gap-1 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
            title="Coba Contoh Dokumen"
          >
            <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <span className="text-[10px] font-medium">Contoh</span>
          </button>
        </div>
      </div>

      {/* Sample Documents Modal */}
      {showSamplesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Pilih Dokumen Contoh
              </h3>
              <button
                onClick={() => setShowSamplesModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg bg-slate-800"
              >
                Batal
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-2 mb-4">
              Uji akurasi ekstraksi teks OCR tanpa perlu mencetak kertas:
            </p>

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {sampleDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => handleSelectSample(doc)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/60 transition cursor-pointer group"
                >
                  <img
                    src={doc.dataUrl}
                    alt={doc.name}
                    className="w-14 h-14 object-cover rounded-lg border border-slate-700 bg-white shrink-0 group-hover:scale-105 transition"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition truncate">
                        {doc.name}
                      </h4>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {doc.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                      {doc.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
