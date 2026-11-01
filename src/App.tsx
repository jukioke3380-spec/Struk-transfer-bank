/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ReceiptPreview } from './components/ReceiptPreview';
import { ReceiptForm } from './components/ReceiptForm';
import { ReceiptActions } from './components/ReceiptActions';
import { ReceiptHistoryView } from './components/ReceiptHistoryView';
import { CameraScanner } from './components/CameraScanner';
import { ImageEditorModal } from './components/ImageEditorModal';
import { ScanProgressBar } from './components/ScanProgressBar';
import { OfflineModelManager } from './components/OfflineModelManager';
import { BottomNav, MainNavTab } from './components/BottomNav';
import { PWAInstallBanner } from './components/PWAInstallButton';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { TransferReceipt, OCRProgress } from './types';
import { ATHAR_DIGITAL_RECEIPT, generateRefNumber, getIndonesianFormattedDate } from './utils/receiptPresets';
import { getAllReceipts, saveReceipt, deleteReceipt, clearAllReceipts } from './utils/db';
import { performOCR } from './services/ocrService';
import { parseMBankingText } from './utils/mBankingParser';
import { triggerHaptic } from './utils/audioFeedback';
import { Eye, Edit3, Sparkles, CheckCircle2, WifiOff } from 'lucide-react';

export default function App() {
  const isOnline = useOnlineStatus();
  const receiptContainerRef = useRef<HTMLDivElement>(null);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<MainNavTab>('receipt');

  // Mobile sub-tab for Receipt view: 'form' or 'preview'
  const [mobileReceiptView, setMobileReceiptView] = useState<'form' | 'preview'>('form');

  // Receipt data initialized with the uploaded Athar Digital Payment format
  const [receipt, setReceipt] = useState<TransferReceipt>(() => ({
    ...ATHAR_DIGITAL_RECEIPT,
    id: 'receipt_' + Date.now(),
    transactionDate: getIndonesianFormattedDate(new Date()),
    createdAt: Date.now(),
  }));

  const [receiptTheme, setReceiptTheme] = useState<'exact' | 'thermal'>('exact');

  // Receipts saved in IndexedDB
  const [receiptHistory, setReceiptHistory] = useState<TransferReceipt[]>([]);

  // OCR Processing States (for scanning m-banking screenshots)
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<OCRProgress | null>(null);
  const [autoFillSuccessToast, setAutoFillSuccessToast] = useState(false);

  // Load history on mount
  useEffect(() => {
    async function loadData() {
      try {
        const stored = await getAllReceipts();
        setReceiptHistory(stored);
      } catch (err) {
        console.error('Failed to load receipts from IndexedDB:', err);
      }
    }
    loadData();
  }, []);

  // Save receipt to history
  const handleSaveReceipt = async (item: TransferReceipt) => {
    await saveReceipt(item);
    setReceiptHistory((prev) => {
      const exists = prev.some((r) => r.id === item.id);
      if (exists) {
        return prev.map((r) => (r.id === item.id ? item : r));
      }
      return [item, ...prev];
    });
  };

  // Delete from history
  const handleDeleteReceipt = async (id: string) => {
    await deleteReceipt(id);
    setReceiptHistory((prev) => prev.filter((r) => r.id !== id));
  };

  // Clear all
  const handleClearAllReceipts = async () => {
    await clearAllReceipts();
    setReceiptHistory([]);
  };

  // Select receipt from history to view / edit
  const handleSelectFromHistory = (item: TransferReceipt) => {
    setReceipt(item);
    setActiveTab('receipt');
    setMobileReceiptView('preview');
  };

  // New receipt
  const handleNewReceipt = () => {
    setReceipt({
      ...ATHAR_DIGITAL_RECEIPT,
      id: 'receipt_' + Date.now(),
      refNumber: generateRefNumber(),
      transactionDate: getIndonesianFormattedDate(new Date()),
      recipientName: '',
      targetAccount: '',
      transferAmount: 0,
      createdAt: Date.now(),
    });
    setActiveTab('receipt');
    setMobileReceiptView('form');
  };

  // OCR Scanning: Image captured
  const handleImageCaptured = (dataUrl: string) => {
    setCapturedImage(dataUrl);
  };

  // OCR Processing
  const handleStartOCR = async (processedDataUrl: string) => {
    setCapturedImage(null);
    setIsProcessingOCR(true);

    try {
      const ocrResult = await performOCR({
        imageDataUrl: processedDataUrl,
        engine: 'tesseract',
        language: 'ind+eng',
        isOnline,
        onProgress: (p) => setOcrProgress(p),
      });

      // Parse text into receipt fields
      const updates = parseMBankingText(ocrResult.text, receipt);

      setReceipt((prev) => ({
        ...prev,
        ...updates,
      }));

      // Switch to receipt tab and preview
      setActiveTab('receipt');
      setMobileReceiptView('preview');
      setAutoFillSuccessToast(true);
      setTimeout(() => setAutoFillSuccessToast(false), 4000);
    } catch (err) {
      console.error('OCR Error:', err);
      alert('Gagal mengekstrak teks otomatis. Silakan input data secara manual.');
    } finally {
      setIsProcessingOCR(false);
      setOcrProgress(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Header */}
      <Header
        isOnline={isOnline}
        receiptTheme={receiptTheme}
        onThemeChange={(theme) => {
          setReceiptTheme(theme);
          setReceipt((prev) => ({ ...prev, theme }));
        }}
      />

      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-1.5 text-center text-xs font-semibold text-amber-300 flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5 text-amber-400" />
          <span>Mode Offline — Aplikasi dapat digunakan dan nota tetap bisa dibuat & dicetak tanpa internet.</span>
        </div>
      )}

      {/* Auto-fill Toast */}
      {autoFillSuccessToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs shadow-2xl animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Data struk berhasil diisi otomatis dari hasil scan!</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-5">
        {/* PWA Install Banner */}
        <PWAInstallBanner />

        {/* TAB 1: NOTA TRANSFER (BUILDER & LIVE PREVIEW) */}
        {activeTab === 'receipt' && (
          <div className="space-y-4">
            {/* Mobile View Toggle Buttons (Edit Form vs Lihat Struk) */}
            <div className="flex sm:hidden items-center justify-center p-1 bg-slate-900 border border-slate-800 rounded-xl max-w-xs mx-auto">
              <button
                onClick={() => {
                  triggerHaptic(10);
                  setMobileReceiptView('form');
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  mobileReceiptView === 'form'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Nota</span>
              </button>
              <button
                onClick={() => {
                  triggerHaptic(10);
                  setMobileReceiptView('preview');
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  mobileReceiptView === 'preview'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Lihat Struk</span>
              </button>
            </div>

            {/* Desktop Side-by-Side / Mobile Tabbed Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Column: Form Editor */}
              <div
                id="receipt-form-column"
                className={`lg:col-span-6 space-y-4 ${
                  mobileReceiptView === 'form' ? 'block' : 'hidden lg:block'
                }`}
              >
                <ReceiptForm
                  receipt={receipt}
                  onChange={setReceipt}
                  onOpenOCRScanner={() => {
                    triggerHaptic(15);
                    setActiveTab('ocr_scanner');
                  }}
                />

                <ReceiptActions
                  receipt={receipt}
                  onSaveToHistory={handleSaveReceipt}
                />
              </div>

              {/* Right Column: Live Struk Preview matching user image */}
              <div
                className={`lg:col-span-6 space-y-4 ${
                  mobileReceiptView === 'preview' ? 'block' : 'hidden lg:block'
                }`}
              >
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Hasil Nota Kirim Uang:
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      Ukuran Asli 1:1
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    Otomatis diperbarui secara real-time
                  </span>
                </div>

                {/* Struk Card Container */}
                <div className="bg-slate-900/60 p-3 sm:p-5 rounded-2xl border border-slate-800 flex justify-center items-center overflow-x-auto shadow-inner">
                  <ReceiptPreview
                    receipt={{ ...receipt, theme: receiptTheme }}
                    containerRef={receiptContainerRef}
                  />
                </div>

                {/* Quick Action below preview on mobile */}
                <div className="block lg:hidden">
                  <ReceiptActions
                    receipt={receipt}
                    onSaveToHistory={handleSaveReceipt}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RIWAYAT TRANSAKSI */}
        {activeTab === 'history' && (
          <ReceiptHistoryView
            receipts={receiptHistory}
            onSelectReceipt={handleSelectFromHistory}
            onDeleteReceipt={handleDeleteReceipt}
            onClearAll={handleClearAllReceipts}
            onNewReceipt={handleNewReceipt}
          />
        )}

        {/* TAB 3: SCAN SCREENSHOT / BUKTI TRANSFER (OCR) */}
        {activeTab === 'ocr_scanner' && (
          <div className="max-w-md mx-auto space-y-3">
            <div className="text-center px-2">
              <h2 className="text-base font-bold text-white flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Scan Bukti Transfer / M-Banking
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Arahkan kamera atau upload tangkapan layar BRImo / BCA / Livin' untuk mengisi form otomatis
              </p>
            </div>

            <CameraScanner
              onImageCaptured={handleImageCaptured}
              isProcessing={isProcessingOCR}
            />
          </div>
        )}

        {/* TAB 4: SETTINGS & OFFLINE PWA */}
        {activeTab === 'settings' && (
          <OfflineModelManager isOnline={isOnline} />
        )}
      </main>

      {/* Image Preprocessing Modal (Before OCR) */}
      {capturedImage && (
        <ImageEditorModal
          rawImageDataUrl={capturedImage}
          onConfirm={handleStartOCR}
          onCancel={() => setCapturedImage(null)}
        />
      )}

      {/* OCR Progress Modal */}
      {isProcessingOCR && ocrProgress && (
        <ScanProgressBar progress={ocrProgress} engine="tesseract" />
      )}

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          triggerHaptic(10);
          setActiveTab(tab);
        }}
        receiptCount={receiptHistory.length}
      />
    </div>
  );
}
