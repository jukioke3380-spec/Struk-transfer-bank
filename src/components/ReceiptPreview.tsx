import React from 'react';
import { TransferReceipt } from '../types';
import { formatRupiah } from '../utils/receiptPresets';
import { generateBarcodeLines } from '../utils/barcode';
import { Check } from 'lucide-react';

interface ReceiptPreviewProps {
  receipt: TransferReceipt;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  isPrintMode?: boolean;
}

export const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({
  receipt,
  containerRef,
  isPrintMode = false,
}) => {
  const totalAmount =
    receipt.transferAmount +
    receipt.adminBankFee +
    (receipt.includeOutletFeeInTotal ? receipt.adminOutletFee : 0);

  const barcodeBars = generateBarcodeLines(receipt.refNumber);

  const isThermal = receipt.theme === 'thermal';

  return (
    <div
      ref={containerRef}
      id="receipt-print-area"
      className={`relative mx-auto text-slate-900 transition-all select-none ${
        isThermal
          ? 'w-full max-w-[340px] font-mono bg-white p-5 border border-dashed border-gray-400 text-black'
          : 'w-full max-w-[480px] bg-white rounded-2xl shadow-2xl p-7 sm:p-9 border border-slate-200/80 font-sans'
      }`}
      style={{
        boxSizing: 'border-box',
        letterSpacing: isThermal ? '-0.5px' : 'normal',
      }}
    >
      {/* 1. Header Loket & Gerai */}
      <div className="text-center">
        <h1
          className={`font-black tracking-tight uppercase leading-snug ${
            isThermal ? 'text-[14px] text-black font-mono' : 'text-[17px] text-[#0f172a]'
          }`}
        >
          {receipt.outletName || 'LOKET PPOB ATHAR DIGITAL PAYMENT'}
        </h1>

        {receipt.outletSub1 && (
          <p
            className={`font-bold mt-0.5 ${
              isThermal ? 'text-[11px] text-black' : 'text-[12px] text-[#334155]'
            }`}
          >
            {receipt.outletSub1}
          </p>
        )}

        {receipt.outletSub2 && (
          <p
            className={`mt-0.5 ${
              isThermal ? 'text-[10px] text-gray-700' : 'text-[11px] text-[#64748b]'
            }`}
          >
            {receipt.outletSub2}
          </p>
        )}

        {/* Struk Bukti Title */}
        <h2
          className={`font-extrabold uppercase mt-3 tracking-wide ${
            isThermal ? 'text-[12px] text-black border-y border-dashed py-1' : 'text-[13px] text-[#0f172a]'
          }`}
        >
          {receipt.receiptTitle || 'STRUK BUKTI TRANSFER BANK'}
        </h2>

        {/* Date & Time */}
        <p
          className={`mt-1 font-medium ${
            isThermal ? 'text-[10px] text-black' : 'text-[11.5px] text-[#334155]'
          }`}
        >
          {receipt.transactionDate}
        </p>

        {/* Ref Number */}
        <div
          className={`mt-1 font-mono tracking-widest ${
            isThermal ? 'text-[10px] text-black' : 'text-[11.5px] text-[#334155]'
          }`}
        >
          <span>No. Ref:&nbsp;&nbsp;</span>
          <span className="font-semibold">{receipt.refNumber}</span>
        </div>
      </div>

      {/* Dashed Separator 1 */}
      <div
        className={`my-3.5 border-t ${
          isThermal ? 'border-dashed border-black' : 'border-dashed border-[#cbd5e1]'
        }`}
      />

      {/* 2. Transaction Participants Info */}
      <div className="space-y-2.5 text-[12px]">
        {/* Nama Pengirim */}
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[#475569] shrink-0">Nama Pengirim</span>
          <span className="font-bold text-[#0f172a] text-right uppercase">
            {receipt.senderName}
          </span>
        </div>

        {/* Rek. Pengirim */}
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[#475569] shrink-0">Rek. Pengirim</span>
          <span className="font-mono text-[#0f172a] text-right tracking-wider">
            {receipt.senderAccount}
          </span>
        </div>

        {/* Bank Tujuan */}
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[#475569] shrink-0">Bank Tujuan</span>
          <span className="font-bold text-[#0f172a] text-right uppercase">
            {receipt.targetBank}
          </span>
        </div>

        {/* No. Rekening */}
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[#475569] shrink-0">No. Rekening</span>
          <span className="font-mono text-[#0f172a] text-right tracking-widest">
            {receipt.targetAccount}
          </span>
        </div>

        {/* Nama Penerima */}
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[#475569] shrink-0">Nama Penerima</span>
          <span className="font-bold text-[#0f172a] text-right uppercase">
            {receipt.recipientName}
          </span>
        </div>
      </div>

      {/* Dashed Separator 2 */}
      <div
        className={`my-3.5 border-t ${
          isThermal ? 'border-dashed border-black' : 'border-dashed border-[#cbd5e1]'
        }`}
      />

      {/* 3. Amounts Breakdown */}
      <div className="space-y-2 text-[12.5px]">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[#475569]">Jumlah Transfer</span>
          <span className="font-bold text-[#0f172a]">
            {formatRupiah(receipt.transferAmount)}
          </span>
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[#475569]">Biaya Admin Bank</span>
          <span className="font-bold text-[#0f172a]">
            {formatRupiah(receipt.adminBankFee)}
          </span>
        </div>

        {receipt.adminOutletFee > 0 && !receipt.includeOutletFeeInTotal && (
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[#475569]">Biaya Layanan Gerai</span>
            <span className="font-bold text-[#0f172a]">
              {formatRupiah(receipt.adminOutletFee)}
            </span>
          </div>
        )}
      </div>

      {/* 4. Total Amount Highlight Box */}
      {isThermal ? (
        <div className="my-3 border-y border-dashed border-black py-2">
          <div className="flex items-baseline justify-between font-bold text-[14px]">
            <span>TOTAL BAYAR:</span>
            <span>{formatRupiah(totalAmount)}</span>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border-2 border-[#0284c7] bg-[#f0f9ff]/50 px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between shadow-sm">
          <div>
            <div className="font-extrabold text-[12px] text-[#0369a1] tracking-wide uppercase">
              TOTAL BAYAR
            </div>
            <div className="text-[10px] text-[#64748b] mt-0.5 font-normal">
              Transfer + Admin Bank
              {receipt.includeOutletFeeInTotal && receipt.adminOutletFee > 0 ? ' + Loket' : ''}
            </div>
          </div>
          <div className="font-extrabold text-[21px] sm:text-[23px] text-[#0284c7] tracking-tight">
            {formatRupiah(totalAmount)}
          </div>
        </div>
      )}

      {/* 5. Status Transaksi */}
      <div className="mt-4 text-center">
        {receipt.status === 'SUCCESS' && (
          <div className="flex items-center justify-center gap-1 text-[12px] font-bold text-[#059669] tracking-wider uppercase">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>TRANSAKSI BERHASIL</span>
          </div>
        )}
        {receipt.status === 'PENDING' && (
          <div className="text-[12px] font-bold text-[#d97706] tracking-wider uppercase">
            ⏳ TRANSAKSI DIPROSES
          </div>
        )}
        {receipt.status === 'FAILED' && (
          <div className="text-[12px] font-bold text-[#dc2626] tracking-wider uppercase">
            ❌ TRANSAKSI GAGAL
          </div>
        )}
      </div>

      {/* 6. Barcode Section */}
      <div className="mt-4 flex flex-col items-center justify-center">
        <svg
          className="h-10 w-full max-w-[240px]"
          viewBox="0 0 240 40"
          preserveAspectRatio="none"
        >
          {(() => {
            let curX = 10;
            return barcodeBars.map((bar, i) => {
              const x = curX;
              curX += bar.width + bar.gap;
              return (
                <rect
                  key={i}
                  x={x}
                  y="0"
                  width={bar.width}
                  height="40"
                  fill="#0f172a"
                />
              );
            });
          })()}
        </svg>
        <div className="font-mono text-[9.5px] text-[#475569] tracking-widest mt-1">
          *{receipt.refNumber}*
        </div>
      </div>

      {/* 7. Footer Notes */}
      <div className="mt-3.5 text-center text-[10.5px] text-[#64748b] leading-tight space-y-0.5">
        <p>{receipt.footerNote1 || 'Terima kasih atas transaksi Anda'}</p>
        <p>{receipt.footerNote2 || 'Struk ini merupakan bukti transaksi yang sah'}</p>
      </div>
    </div>
  );
};
