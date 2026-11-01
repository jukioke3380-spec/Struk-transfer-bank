export type OCREngine = 'tesseract' | 'gemini';

export type OCRLanguage = 'ind' | 'eng' | 'ind+eng';

export type DocumentCategory = 'dokumen' | 'struk' | 'ktp' | 'buku' | 'catatan' | 'lainnya';

export interface ScanResult {
  id: string;
  title: string;
  text: string;
  confidence: number;
  wordCount: number;
  engine: OCREngine;
  language: OCRLanguage;
  category: DocumentCategory;
  thumbnailUrl?: string;
  createdAt: number;
  updatedAt: number;
  notes?: string;
  isFavorite?: boolean;
}

export interface ImageProcessingOptions {
  grayscale: boolean;
  contrast: number;
  brightness: number;
  binarize: boolean;
  thresholdValue: number;
  invert: boolean;
  sharpness: boolean;
  rotation: number;
}

export interface OCRProgress {
  status: string;
  progress: number;
  stage: 'idle' | 'preprocessing' | 'loading_engine' | 'recognizing' | 'completed' | 'error';
}

export interface TransferReceipt {
  id: string;
  outletName: string;
  outletSub1: string;
  outletSub2: string;
  receiptTitle: string;
  transactionDate: string;
  refNumber: string;
  senderName: string;
  senderAccount: string;
  targetBank: string;
  targetAccount: string;
  recipientName: string;
  transferAmount: number;
  adminBankFee: number;
  adminOutletFee: number;
  includeOutletFeeInTotal: boolean;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  footerNote1: string;
  footerNote2: string;
  theme?: 'exact' | 'thermal' | 'modern';
  createdAt: number;
}
