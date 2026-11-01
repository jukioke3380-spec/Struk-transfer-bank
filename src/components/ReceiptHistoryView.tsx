import React, { useState } from 'react';
import { TransferReceipt } from '../types';
import { formatRupiah } from '../utils/receiptPresets';
import { exportReceiptsAsJSON } from '../utils/db';
import { triggerHaptic } from '../utils/audioFeedback';
import {
  Search,
  Trash2,
  Calendar,
  Building2,
  Download,
  CreditCard,
  Plus,
  TrendingUp,
  Inbox,
  CheckCircle2,
} from 'lucide-react';

interface ReceiptHistoryViewProps {
  receipts: TransferReceipt[];
  onSelectReceipt: (receipt: TransferReceipt) => void;
  onDeleteReceipt: (id: string) => void;
  onClearAll: () => void;
  onNewReceipt: () => void;
}

export const ReceiptHistoryView: React.FC<ReceiptHistoryViewProps> = ({
  receipts,
  onSelectReceipt,
  onDeleteReceipt,
  onClearAll,
  onNewReceipt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = receipts.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      r.recipientName.toLowerCase().includes(q) ||
      r.senderName.toLowerCase().includes(q) ||
      r.targetBank.toLowerCase().includes(q) ||
      r.targetAccount.toLowerCase().includes(q) ||
      r.refNumber.toLowerCase().includes(q)
    );
  });

  // Calculate daily statistics
  const totalVolume = receipts.reduce((acc, r) => acc + r.transferAmount, 0);

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto pb-24 animate-in fade-in space-y-4">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/70 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Volume Transaksi
            </span>
            <div className="text-xl sm:text-2xl font-black text-cyan-400 mt-0.5">
              {formatRupiah(totalVolume)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Dari total {receipts.length} struk yang pernah dibuat
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Buat Nota Baru</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Siapkan bukti transfer bank & PPOB dalam hitungan detik
            </p>
            <button
              onClick={() => {
                triggerHaptic(15);
                onNewReceipt();
              }}
              className="mt-2.5 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition active:scale-95 shadow-md shadow-cyan-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Input Nota Baru</span>
            </button>
          </div>
          <div className="p-3 rounded-2xl bg-slate-800 text-slate-300">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-base font-bold text-white">Daftar Transaksi Kirim Uang</h2>
          <p className="text-xs text-slate-400">
            Tersimpan secara lokal di browser HP Anda
          </p>
        </div>

        {receipts.length > 0 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                triggerHaptic(15);
                exportReceiptsAsJSON(receipts);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition"
              title="Unduh rekap data transaksi sebagai file JSON"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Export Rekap</span>
            </button>
            <button
              onClick={() => {
                triggerHaptic(20);
                if (confirm('Hapus semua riwayat struk kirim uang?')) {
                  onClearAll();
                }
              }}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-rose-400 hover:bg-rose-500/10 text-xs transition"
              title="Hapus Semua"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari nama penerima, nomor rekening, bank, atau no ref..."
          className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition shadow-inner"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
      </div>

      {/* Receipts List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-900/50 border border-slate-800/80 rounded-2xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">
            {receipts.length === 0 ? 'Belum Ada Transaksi' : 'Tidak Ditemukan'}
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mb-4">
            {receipts.length === 0
              ? 'Mulai buat nota kirim uang untuk pelanggan Anda. Struk dapat dicetak dan dikirim via WhatsApp.'
              : 'Tidak ada transaksi yang cocok dengan kata kunci pencarian.'}
          </p>
          <button
            onClick={() => {
              triggerHaptic(15);
              onNewReceipt();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Nota Sekarang</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((r) => (
            <div
              key={r.id}
              onClick={() => {
                triggerHaptic(10);
                onSelectReceipt(r);
              }}
              className="group relative flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-850 transition cursor-pointer shadow-lg"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white group-hover:text-cyan-400 transition truncate">
                      {r.recipientName}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                      {r.targetBank}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    {r.targetAccount} • Ref: {r.refNumber}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>{r.transactionDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-sm font-black text-cyan-400">
                    {formatRupiah(r.transferAmount + r.adminBankFee)}
                  </div>
                  <div className="text-[10px] text-emerald-400 flex items-center justify-end gap-1 font-semibold mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>BERHASIL</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic(15);
                    if (confirm('Hapus nota ini dari riwayat?')) {
                      onDeleteReceipt(r.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
