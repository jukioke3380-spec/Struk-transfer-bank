import { TransferReceipt } from '../types';
import { ATHAR_DIGITAL_RECEIPT, generateRefNumber, getIndonesianFormattedDate } from './receiptPresets';

/**
 * Parses raw OCR text from mobile banking screenshots or transfer proofs
 * into structured TransferReceipt data fields.
 */
export function parseMBankingText(text: string, existing: TransferReceipt): Partial<TransferReceipt> {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const lower = text.toLowerCase();
  const updates: Partial<TransferReceipt> = {};

  // 1. Detect Nominal / Jumlah Transfer
  // Look for Rp 100.000 or 100.000 or Jumlah Rp ...
  const amountRegex = /(?:rp|idr|jumlah|nominal|transfer|total)?\s*[:.]?\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/gi;
  const amountsFound: number[] = [];
  let m: RegExpExecArray | null;

  for (const line of lines) {
    if (
      line.toLowerCase().includes('rp') ||
      line.toLowerCase().includes('nominal') ||
      line.toLowerCase().includes('jumlah') ||
      line.toLowerCase().includes('total')
    ) {
      const match = line.match(/(\d{1,3}(?:[.,]\d{3})+)/);
      if (match) {
        const rawNum = parseInt(match[1].replace(/[.,]/g, ''), 10);
        if (rawNum >= 1000 && rawNum < 1000000000) {
          amountsFound.push(rawNum);
        }
      }
    }
  }

  if (amountsFound.length > 0) {
    updates.transferAmount = amountsFound[0];
  }

  // 2. Detect Bank Tujuan
  const bankPatterns: Record<string, string> = {
    bri: 'BANK BRI',
    bca: 'BANK BCA',
    mandiri: 'BANK MANDIRI',
    bni: 'BANK BNI',
    bsi: 'BANK BSI (SYARIAH)',
    cimb: 'BANK CIMB NIAGA',
    permata: 'BANK PERMATA',
    danamon: 'BANK DANAMON',
    seabank: 'SEABANK',
    jago: 'BANK JAGO',
    dana: 'DANA (E-WALLET)',
    ovo: 'OVO (E-WALLET)',
    gopay: 'GOPAY (E-WALLET)',
    shopee: 'SHOPEEPAY (E-WALLET)',
  };

  for (const [key, bankName] of Object.entries(bankPatterns)) {
    if (lower.includes(key)) {
      updates.targetBank = bankName;
      break;
    }
  }

  // 3. Detect Nomor Rekening
  const accMatch = text.match(/\b(\d{4}\s*\d{4}\s*\d{4}\s*\d{1,4}|\d{10,16})\b/);
  if (accMatch) {
    updates.targetAccount = accMatch[1].replace(/\s+/g, ' ');
  }

  // 4. Detect Reference Number
  const refMatch = text.match(/(?:ref|no\.?\s*ref|transaksi|id)\s*[:#]?\s*([A-Za-z0-9]{8,18})/i);
  if (refMatch) {
    updates.refNumber = refMatch[1];
  } else {
    updates.refNumber = generateRefNumber();
  }

  // 5. Look for Name indicators
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    if (l.includes('penerima') || l.includes('ke rekening') || l.includes('tujuan')) {
      const nextLine = lines[i + 1];
      if (nextLine && !nextLine.includes(':') && nextLine.length > 3) {
        updates.recipientName = nextLine.toUpperCase();
      }
    }
    if (l.includes('pengirim') || l.includes('dari rekening')) {
      const nextLine = lines[i + 1];
      if (nextLine && !nextLine.includes(':') && nextLine.length > 3) {
        updates.senderName = nextLine.toUpperCase();
      }
    }
  }

  updates.transactionDate = getIndonesianFormattedDate(new Date());

  return updates;
}
