import React from 'react';
import { FileText, History, ScanLine, Settings } from 'lucide-react';
import { triggerHaptic } from '../utils/audioFeedback';

export type MainNavTab = 'receipt' | 'history' | 'ocr_scanner' | 'settings';

interface BottomNavProps {
  activeTab: MainNavTab;
  onTabChange: (tab: MainNavTab) => void;
  receiptCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  receiptCount,
}) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800 px-3 py-2 safe-area-pb">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Nota Kirim Uang Tab */}
        <button
          onClick={() => {
            triggerHaptic(10);
            onTabChange('receipt');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
            activeTab === 'receipt'
              ? 'text-cyan-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Nota Transfer</span>
        </button>

        {/* Riwayat Tab */}
        <button
          onClick={() => {
            triggerHaptic(10);
            onTabChange('history');
          }}
          className={`relative flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
            activeTab === 'history'
              ? 'text-cyan-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Riwayat</span>
          {receiptCount > 0 && (
            <span className="absolute top-0 right-1 px-1.5 py-0.2 rounded-full bg-cyan-500 text-slate-950 text-[9px] font-black">
              {receiptCount > 99 ? '99+' : receiptCount}
            </span>
          )}
        </button>

        {/* OCR Scanner Tab */}
        <button
          onClick={() => {
            triggerHaptic(10);
            onTabChange('ocr_scanner');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
            activeTab === 'ocr_scanner'
              ? 'text-cyan-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ScanLine className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Scan Bukti</span>
        </button>

        {/* Settings & PWA Tab */}
        <button
          onClick={() => {
            triggerHaptic(10);
            onTabChange('settings');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
            activeTab === 'settings'
              ? 'text-cyan-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">PWA & Offline</span>
        </button>
      </div>
    </nav>
  );
};
