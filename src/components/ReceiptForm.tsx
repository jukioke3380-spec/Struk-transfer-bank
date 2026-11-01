import React, { useState } from 'react';
import { TransferReceipt } from '../types';
import {
  INDONESIAN_BANKS,
  RECEIPT_PRESETS,
  ATHAR_DIGITAL_RECEIPT,
  getIndonesianFormattedDate,
  generateRefNumber,
  formatAccountNumber,
} from '../utils/receiptPresets';
import {
  RotateCcw,
  Sparkles,
  Calendar,
  Hash,
  Building2,
  User,
  CreditCard,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Store,
  CheckCircle2,
  ScanLine,
} from 'lucide-react';
import { triggerHaptic } from '../utils/audioFeedback';

interface ReceiptFormProps {
  receipt: TransferReceipt;
  onChange: (updated: TransferReceipt) => void;
  onOpenOCRScanner?: () => void;
}

export const ReceiptForm: React.FC<ReceiptFormProps> = ({
  receipt,
  onChange,
  onOpenOCRScanner,
}) => {
  const [showOutletSettings, setShowOutletSettings] = useState(false);
  const [isMasked, setIsMasked] = useState(true);

  const updateField = <K extends keyof TransferReceipt>(
    field: K,
    value: TransferReceipt[K]
  ) => {
    onChange({
      ...receipt,
      [field]: value,
    });
  };

  const handleApplyPreset = (presetId: string) => {
    triggerHaptic(15);
    const preset = RECEIPT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    onChange({
      ...receipt,
      outletName: preset.outletName,
      outletSub1: preset.outletSub1,
      outletSub2: preset.outletSub2,
    });
  };

  const handleResetToAthar = () => {
    triggerHaptic(20);
    onChange({
      ...ATHAR_DIGITAL_RECEIPT,
      id: 'athar_' + Date.now(),
      createdAt: Date.now(),
    });
  };

  const handleSetCurrentTime = () => {
    triggerHaptic(10);
    updateField('transactionDate', getIndonesianFormattedDate(new Date()));
  };

  const handleRandomizeRef = () => {
    triggerHaptic(10);
    updateField('refNumber', generateRefNumber());
  };

  // Quick Amount presets
  const quickAmounts = [50000, 100000, 200000, 500000, 1000000, 2500000];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-cyan-400" />
            Pengaturan Nota Kirim Uang
          </h2>
          <p className="text-xs text-slate-400">
            Kustomisasi data pengirim, bank, penerima, dan nominal
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {onOpenOCRScanner && (
            <button
              onClick={onOpenOCRScanner}
              type="button"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-semibold shadow-sm active:scale-95 transition"
              title="Ekstrak data dari screenshot m-banking via OCR"
            >
              <ScanLine className="w-3.5 h-3.5" />
              <span>Scan Bukti M-Banking</span>
            </button>
          )}

          <button
            onClick={handleResetToAthar}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium active:scale-95 transition"
            title="Muat data persis seperti gambar yang diunggah"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Data Athar Digital</span>
          </button>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span>Pilih Profil Gerai / Agen:</span>
          <button
            onClick={() => setShowOutletSettings(!showOutletSettings)}
            type="button"
            className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <Store className="w-3 h-3" />
            <span>Kustomisasi Nama Loket</span>
            {showOutletSettings ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {RECEIPT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset.id)}
              className={`p-2 rounded-xl text-left text-xs font-medium border transition ${
                receipt.outletName === preset.outletName
                  ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 font-bold'
                  : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="truncate">{preset.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Expandable Outlet Customization */}
      {showOutletSettings && (
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3 animate-in fade-in">
          <div>
            <label className="text-xs font-medium text-slate-300">Nama Loket Utama</label>
            <input
              type="text"
              value={receipt.outletName}
              onChange={(e) => updateField('outletName', e.target.value.toUpperCase())}
              placeholder="Contoh: LOKET PPOB ATHAR DIGITAL PAYMENT"
              className="mt-1 w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300">Sub-Judul 1</label>
              <input
                type="text"
                value={receipt.outletSub1}
                onChange={(e) => updateField('outletSub1', e.target.value)}
                placeholder="Contoh: Gerai Transaksi Online & Multi Pembayaran"
                className="mt-1 w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300">Sub-Judul 2 (Layanan)</label>
              <input
                type="text"
                value={receipt.outletSub2}
                onChange={(e) => updateField('outletSub2', e.target.value)}
                placeholder="Contoh: Layanan Transfer Uang, Tarik Tunai & Pembayaran Tagihan"
                className="mt-1 w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Section 1: Pengirim */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          <span>Informasi Pengirim</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-300">Nama Pengirim</label>
            <input
              type="text"
              value={receipt.senderName}
              onChange={(e) => updateField('senderName', e.target.value.toUpperCase())}
              placeholder="Contoh: M. CHASIN ZAUHARI"
              className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white uppercase focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-300">Rekening Pengirim</label>
              <button
                type="button"
                onClick={() => {
                  const next = !isMasked;
                  setIsMasked(next);
                  updateField('senderAccount', formatAccountNumber(receipt.senderAccount, next));
                }}
                className="text-[10px] text-cyan-400 hover:underline"
              >
                {isMasked ? 'Buka Sensor' : 'Sensor (6305 **** 530)'}
              </button>
            </div>
            <input
              type="text"
              value={receipt.senderAccount}
              onChange={(e) => updateField('senderAccount', e.target.value)}
              placeholder="Contoh: 6305 **** **** 530"
              className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Tujuan Transfer */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5" />
          <span>Tujuan & Penerima</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-slate-300">Bank Tujuan</label>
            <select
              value={receipt.targetBank}
              onChange={(e) => updateField('targetBank', e.target.value)}
              className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {INDONESIAN_BANKS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-300">No. Rekening Tujuan</label>
            <input
              type="text"
              value={receipt.targetAccount}
              onChange={(e) =>
                updateField('targetAccount', formatAccountNumber(e.target.value, false))
              }
              placeholder="Contoh: 6304 0101 0460 531"
              className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300">Nama Penerima</label>
            <input
              type="text"
              value={receipt.recipientName}
              onChange={(e) => updateField('recipientName', e.target.value.toUpperCase())}
              placeholder="Contoh: CICIK NURJANAH"
              className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white uppercase focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Nominal Transfer & Biaya */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5" />
          <span>Nominal & Biaya Admin</span>
        </h3>

        <div>
          <label className="text-xs text-slate-300">Jumlah Transfer (Rp)</label>
          <div className="mt-1 relative">
            <input
              type="number"
              step="1000"
              value={receipt.transferAmount || ''}
              onChange={(e) =>
                updateField('transferAmount', Math.max(0, parseInt(e.target.value || '0', 10)))
              }
              placeholder="100000"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm font-bold text-cyan-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Quick Amount Chips */}
          <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 no-scrollbar">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  updateField('transferAmount', amt);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  receipt.transferAmount === amt
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                Rp {(amt / 1000).toLocaleString('id-ID')}rb
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-xs text-slate-300">Biaya Admin Bank (Rp)</label>
            <div className="flex gap-2 mt-1">
              <input
                type="number"
                step="500"
                value={receipt.adminBankFee}
                onChange={(e) =>
                  updateField('adminBankFee', Math.max(0, parseInt(e.target.value || '0', 10)))
                }
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={() => updateField('adminBankFee', 0)}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium border ${
                  receipt.adminBankFee === 0
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Rp 0
              </button>
              <button
                type="button"
                onClick={() => updateField('adminBankFee', 2500)}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium border ${
                  receipt.adminBankFee === 2500
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                2.500
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300">Biaya Admin Loket / Jasa Gerai (Rp)</label>
            <div className="flex gap-2 mt-1">
              <input
                type="number"
                step="500"
                value={receipt.adminOutletFee}
                onChange={(e) =>
                  updateField('adminOutletFee', Math.max(0, parseInt(e.target.value || '0', 10)))
                }
                placeholder="0"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={() => updateField('adminOutletFee', 3000)}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium border ${
                  receipt.adminOutletFee === 3000
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                3.000
              </button>
              <button
                type="button"
                onClick={() => updateField('adminOutletFee', 5000)}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium border ${
                  receipt.adminOutletFee === 5000
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                5.000
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Tanggal, No. Ref, dan Status */}
      <div className="space-y-3 pt-1">
        <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>Waktu, Referensi & Status</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Tanggal */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-300">Tanggal & Waktu</label>
              <button
                type="button"
                onClick={handleSetCurrentTime}
                className="text-[10px] text-cyan-400 hover:underline"
              >
                Waktu Sekarang
              </button>
            </div>
            <input
              type="text"
              value={receipt.transactionDate}
              onChange={(e) => updateField('transactionDate', e.target.value)}
              className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* No. Ref */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-300">No. Ref Transaksi</label>
              <button
                type="button"
                onClick={handleRandomizeRef}
                className="text-[10px] text-cyan-400 hover:underline"
              >
                Acak No. Ref
              </button>
            </div>
            <input
              type="text"
              value={receipt.refNumber}
              onChange={(e) => updateField('refNumber', e.target.value)}
              className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono tracking-widest"
            />
          </div>

          {/* Status Transaksi */}
          <div>
            <label className="text-xs text-slate-300">Status Transaksi</label>
            <select
              value={receipt.status}
              onChange={(e) => updateField('status', e.target.value as any)}
              className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="SUCCESS">✔ BERHASIL (Hijau)</option>
              <option value="PENDING">⏳ PROSES (Kuning)</option>
              <option value="FAILED">❌ GAGAL (Merah)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
