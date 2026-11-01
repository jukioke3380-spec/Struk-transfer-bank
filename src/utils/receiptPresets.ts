import { TransferReceipt } from '../types';

export function getIndonesianFormattedDate(date: Date = new Date()): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const d = date.getDate();
  const m = months[date.getMonth()];
  const y = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${d} ${m} ${y} ${hours}:${minutes}:${seconds} WIB`;
}

export function generateRefNumber(): string {
  // Generate 12-digit reference number starting with current year/random digits (e.g. 242152912341)
  const prefix = String(new Date().getFullYear()).slice(2);
  const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000).toString();
  return `${prefix}${randomDigits}`.slice(0, 12);
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace('IDR', 'Rp');
}

export function formatAccountNumber(acc: string, mask: boolean = false): string {
  const digits = acc.replace(/[^0-9*]/g, '');
  if (!digits) return acc;

  if (mask && digits.length >= 8) {
    const first4 = digits.slice(0, 4);
    const last3 = digits.slice(-3);
    return `${first4} **** **** ${last3}`;
  }

  // Group in 4s: "6304 0101 0460 531"
  return digits.replace(/(\w{4})/g, '$1 ').trim();
}

// Exactly matches the uploaded receipt
export const ATHAR_DIGITAL_RECEIPT: TransferReceipt = {
  id: 'athar_sample_1',
  outletName: 'LOKET PPOB ATHAR DIGITAL PAYMENT',
  outletSub1: 'Gerai Transaksi Online & Multi Pembayaran',
  outletSub2: 'Layanan Transfer Uang, Tarik Tunai & Pembayaran Tagihan',
  receiptTitle: 'STRUK BUKTI TRANSFER BANK',
  transactionDate: '31 Oktober 2026 08:33:59 WIB',
  refNumber: '242152912341',
  senderName: 'M. CHASIN ZAUHARI',
  senderAccount: '6305 **** **** 530',
  targetBank: 'BANK BRI',
  targetAccount: '6304 0101 0460 531',
  recipientName: 'CICIK NURJANAH',
  transferAmount: 100000,
  adminBankFee: 0,
  adminOutletFee: 0,
  includeOutletFeeInTotal: false,
  status: 'SUCCESS',
  footerNote1: 'Terima kasih atas transaksi Anda',
  footerNote2: 'Struk ini merupakan bukti transaksi yang sah',
  theme: 'exact',
  createdAt: Date.now(),
};

export const INDONESIAN_BANKS = [
  'BANK BRI',
  'BANK BCA',
  'BANK MANDIRI',
  'BANK BNI',
  'BANK BSI (SYARIAH)',
  'BANK CIMB NIAGA',
  'BANK PERMATA',
  'BANK DANAMON',
  'BANK BTN',
  'BANK MEGA',
  'SEABANK',
  'BANK JAGO',
  'BANK ALADIN',
  'BANK NEO COMMERCE',
  'DANA (E-WALLET)',
  'OVO (E-WALLET)',
  'GOPAY (E-WALLET)',
  'SHOPEEPAY (E-WALLET)',
];

export const RECEIPT_PRESETS = [
  {
    id: 'athar',
    name: 'Athar Digital Payment (Persis Gambar)',
    outletName: 'LOKET PPOB ATHAR DIGITAL PAYMENT',
    outletSub1: 'Gerai Transaksi Online & Multi Pembayaran',
    outletSub2: 'Layanan Transfer Uang, Tarik Tunai & Pembayaran Tagihan',
  },
  {
    id: 'brilink',
    name: 'Agen BRILink Resmi',
    outletName: 'GERAI AGEN BRILINK RESMI',
    outletSub1: 'Melayani Transfer Bank, Tarik Tunai & Pembayaran Tagihan',
    outletSub2: 'Layanan Keuangan Tanpa Kantor - Bank Rakyat Indonesia',
  },
  {
    id: 'mandiri',
    name: 'Mandiri Agen',
    outletName: 'MANDIRI AGEN MITRA USAHA',
    outletSub1: 'Layanan Transaksi Perbankan & Pembayaran Online',
    outletSub2: 'Kirim Uang Cepat, Aman & Real Time 24 Jam',
  },
  {
    id: 'agen46',
    name: 'BNI Agen46',
    outletName: 'LOKET BNI AGEN46 NUSANTARA',
    outletSub1: 'Melayani Setor Tunai, Tarik Tunai & Transfer Antar Bank',
    outletSub2: 'Mitra Resmi PT Bank Negara Indonesia (Persero) Tbk',
  },
  {
    id: 'custom',
    name: 'Loket PPOB Mandiri (Kustom)',
    outletName: 'LOKET PEMBAYARAN & TRANSFER KILAT',
    outletSub1: 'Gerai Kirim Uang & Pembayaran Multi Tagihan',
    outletSub2: 'Buka Setiap Hari 07:00 - 22:00 WIB',
  },
];
