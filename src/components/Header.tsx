import React from 'react';
import { Receipt, Wifi, WifiOff, Printer, Smartphone } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { triggerHaptic } from '../utils/audioFeedback';

interface HeaderProps {
  isOnline: boolean;
  receiptTheme: 'exact' | 'thermal';
  onThemeChange: (theme: 'exact' | 'thermal') => void;
}

export const Header: React.FC<HeaderProps> = ({
  isOnline,
  receiptTheme,
  onThemeChange,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md px-3.5 py-2.5 transition-colors">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-sky-400 p-0.5 shadow-md shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Receipt className="w-5 h-5 text-cyan-400" />
            </div>
            {/* Live laser scan dot */}
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isOnline ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isOnline ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white">
                Nota Kirim Uang
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                PPOB PRO
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              {isOnline ? (
                <span className="flex items-center gap-1 text-emerald-400">
                  <Wifi className="w-3 h-3" />
                  <span className="hidden sm:inline">Online</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-400 font-medium">
                  <WifiOff className="w-3 h-3" />
                  <span>Offline (PWA Siap)</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Controls: Theme Mode (Digital / Thermal), PWA Install */}
        <div className="flex items-center gap-2">
          {/* Theme Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => {
                triggerHaptic(10);
                onThemeChange('exact');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-semibold ${
                receiptTheme === 'exact'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Tampilan digital persis gambar Athar Digital Payment"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Digital</span>
            </button>
            <button
              onClick={() => {
                triggerHaptic(10);
                onThemeChange('thermal');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-semibold ${
                receiptTheme === 'thermal'
                  ? 'bg-slate-100 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Mode cetak kertas struk thermal Bluetooth 58mm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Thermal 58mm</span>
            </button>
          </div>

          {/* PWA Install Button */}
          <PWAInstallButton variant="header" />
        </div>
      </div>
    </header>
  );
};
