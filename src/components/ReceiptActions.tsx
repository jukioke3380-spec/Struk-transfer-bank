import React, { useState } from 'react';
import { TransferReceipt } from '../types';
import { formatRupiah } from '../utils/receiptPresets';
import { triggerHaptic } from '../utils/audioFeedback';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';
import {
  Download,
  Share2,
  Printer,
  Copy,
  Check,
  MessageCircle,
  Save,
  CheckCircle2,
  FileText,
} from 'lucide-react';

interface ReceiptActionsProps {
  receipt: TransferReceipt;
  onSaveToHistory: (receipt: TransferReceipt) => void;
  isSaved?: boolean;
}

export const ReceiptActions: React.FC<ReceiptActionsProps> = ({
  receipt,
  onSaveToHistory,
  isSaved = false,
}) => {
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(isSaved);
  const [customerPhone, setCustomerPhone] = useState('');
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  const totalAmount =
    receipt.transferAmount +
    receipt.adminBankFee +
    (receipt.includeOutletFeeInTotal ? receipt.adminOutletFee : 0);

  // Generate clean WhatsApp message
  const getWhatsAppMessage = () => {
    return `*${receipt.outletName}*
${receipt.outletSub1}
----------------------------------------
*${receipt.receiptTitle}*
Tanggal: ${receipt.transactionDate}
No. Ref: ${receipt.refNumber}
----------------------------------------
Nama Pengirim : ${receipt.senderName}
Rek. Pengirim : ${receipt.senderAccount}
Bank Tujuan   : ${receipt.targetBank}
No. Rekening  : ${receipt.targetAccount}
Nama Penerima : ${receipt.recipientName}
----------------------------------------
Jumlah Transfer : ${formatRupiah(receipt.transferAmount)}
Biaya Admin Bank: ${formatRupiah(receipt.adminBankFee)}${
      receipt.adminOutletFee > 0
        ? `\nBiaya Admin Gerai: ${formatRupiah(receipt.adminOutletFee)}`
        : ''
    }
*TOTAL BAYAR    : ${formatRupiah(totalAmount)}*

STATUS: *✔ TRANSAKSI BERHASIL*
----------------------------------------
${receipt.footerNote1}
${receipt.footerNote2}`;
  };

  // Download high-resolution PNG image
  const handleDownloadImage = async () => {
    triggerHaptic(20);
    const element = document.getElementById('receipt-print-area');
    if (!element) return;

    setIsDownloadingImage(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 3, // High DPI for crisp printing & sharing
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      const filename = `struk_${receipt.outletName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${receipt.refNumber}.png`;
      a.href = dataUrl;
      a.download = filename;
      a.click();

      // Trigger celebration confetti
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (err) {
      console.error('Failed to download receipt image:', err);
      alert('Gagal membuat gambar struk. Coba gunakan fitur Cetak Struk.');
    } finally {
      setIsDownloadingImage(false);
    }
  };

  // Direct Print
  const handlePrint = () => {
    triggerHaptic(15);
    window.print();
  };

  // Copy text to clipboard
  const handleCopyText = async () => {
    triggerHaptic(15);
    const text = getWhatsAppMessage();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2200);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2200);
    }
  };

  // Open WhatsApp
  const handleSendWhatsApp = () => {
    triggerHaptic(15);
    const text = encodeURIComponent(getWhatsAppMessage());
    let cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }

    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${text}`
      : `https://wa.me/?text=${text}`;

    window.open(url, '_blank');
    setShowWhatsAppModal(false);
  };

  // Save to History
  const handleSave = () => {
    triggerHaptic(20);
    onSaveToHistory(receipt);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <>
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Opsi Cetak & Bagikan Struk
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Download Image Button */}
          <button
            onClick={handleDownloadImage}
            disabled={isDownloadingImage}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition disabled:opacity-50"
            title="Unduh gambar PNG resolusi tinggi siap kirim"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloadingImage ? 'Membuat...' : 'Download Gambar'}</span>
          </button>

          {/* Send via WhatsApp */}
          <button
            onClick={() => setShowWhatsAppModal(true)}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 active:scale-95 transition"
            title="Kirim bukti transfer ke WhatsApp pelanggan"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Kirim WhatsApp</span>
          </button>

          {/* Print Struk */}
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 active:scale-95 transition"
            title="Cetak langsung ke printer kasir / thermal"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Cetak Thermal</span>
          </button>

          {/* Copy Text */}
          <button
            onClick={handleCopyText}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 active:scale-95 transition"
            title="Salin format teks ringkasan nota"
          >
            {copiedText ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-sky-400" />
                <span>Salin Teks</span>
              </>
            )}
          </button>
        </div>

        {/* Save to History Button */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Simpan data transaksi ke riwayat loket:
          </span>
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
              savedSuccess
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Tersimpan di Riwayat</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-cyan-400" />
                <span>Simpan Transaksi</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-400" />
                Kirim Bukti Transfer ke WhatsApp
              </h3>
              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg bg-slate-800"
              >
                Batal
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-slate-300">
                  Nomor WhatsApp Pelanggan (Opsional)
                </label>
                <div className="mt-1 flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus-within:border-emerald-500">
                  <span className="text-slate-500 mr-1.5">+62</span>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="81234567890 (kosongkan untuk pilih kontak)"
                    className="flex-1 bg-transparent text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 font-mono max-h-36 overflow-y-auto leading-relaxed">
                {getWhatsAppMessage()}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleSendWhatsApp}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Buka WhatsApp Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
