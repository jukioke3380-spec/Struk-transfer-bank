import React, { useState } from 'react';
import {
  Search,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Download,
  Calendar,
  Sparkles,
  Inbox,
  Filter,
  FileText,
} from 'lucide-react';
import { ScanResult, DocumentCategory } from '../types';
import { triggerHaptic } from '../utils/audioFeedback';
import { exportScansAsJSON } from '../utils/db';

interface HistoryViewProps {
  scans: ScanResult[];
  onSelectScan: (scan: ScanResult) => void;
  onDeleteScan: (id: string) => void;
  onClearAll: () => void;
  onNewScan: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  scans,
  onSelectScan,
  onDeleteScan,
  onClearAll,
  onNewScan,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredScans = scans.filter((scan) => {
    const matchesCategory =
      selectedCategory === 'all' || scan.category === selectedCategory;
    const matchesSearch =
      scan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.text.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopyText = (scan: ScanResult, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(15);
    navigator.clipboard.writeText(scan.text);
    setCopiedId(scan.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(20);
    if (confirm('Hapus dokumen ini dari riwayat lokal?')) {
      onDeleteScan(id);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto pb-24 animate-in fade-in space-y-4">
      {/* Header and Backup Buttons */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-lg font-bold text-white">Riwayat Pindai Offline</h2>
          <p className="text-xs text-slate-400">
            Tersimpan secara lokal di memori HP ({scans.length} dokumen)
          </p>
        </div>

        {scans.length > 0 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                triggerHaptic(15);
                exportScansAsJSON(scans);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition"
              title="Ekspor cadangan file JSON"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Backup</span>
            </button>
            <button
              onClick={() => {
                triggerHaptic(20);
                if (confirm('Yakin ingin menghapus seluruh riwayat pindai?')) {
                  onClearAll();
                }
              }}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-rose-400 hover:bg-rose-500/10 text-xs transition"
              title="Hapus Semua Riwayat"
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
          placeholder="Cari kata kunci dalam dokumen tersimpan..."
          className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition shadow-inner"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        {[
          { key: 'all', label: 'Semua' },
          { key: 'dokumen', label: '📄 Dokumen' },
          { key: 'struk', label: '🧾 Struk' },
          { key: 'ktp', label: '🪪 KTP/ID' },
          { key: 'buku', label: '📖 Buku' },
          { key: 'catatan', label: '📝 Catatan' },
        ].map((cat) => (
          <button
            key={cat.key}
            onClick={() => {
              triggerHaptic(10);
              setSelectedCategory(cat.key as any);
            }}
            className={`px-3 py-1 rounded-lg whitespace-nowrap text-xs font-medium transition ${
              selectedCategory === cat.key
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Scans List */}
      {filteredScans.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-900/50 border border-slate-800/80 rounded-2xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">
            {scans.length === 0 ? 'Belum Ada Dokumen' : 'Tidak Ditemukan'}
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mb-4">
            {scans.length === 0
              ? 'Pindai teks dari kamera atau unggah foto untuk mengekstrak dan menyimpan teks secara offline.'
              : 'Tidak ada dokumen yang sesuai dengan pencarian atau filter kategori yang dipilih.'}
          </p>
          <button
            onClick={() => {
              triggerHaptic(15);
              onNewScan();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 transition active:scale-95"
          >
            <FileText className="w-4 h-4" />
            <span>Pindai Dokumen Baru</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredScans.map((scan) => {
            const dateStr = new Date(scan.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
            const timeStr = new Date(scan.createdAt).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={scan.id}
                onClick={() => {
                  triggerHaptic(10);
                  onSelectScan(scan);
                }}
                className="group relative flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-cyan-500/40 hover:bg-slate-850 transition cursor-pointer shadow-lg"
              >
                {/* Thumbnail */}
                {scan.thumbnailUrl ? (
                  <img
                    src={scan.thumbnailUrl}
                    alt={scan.title}
                    className="w-16 h-16 object-cover rounded-xl border border-slate-700/80 bg-slate-950 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0">
                    <FileText className="w-7 h-7" />
                  </div>
                )}

                {/* Content details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition truncate">
                      {scan.title}
                    </h4>
                    <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {scan.confidence}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 font-mono leading-relaxed">
                    {scan.text}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {dateStr} • {timeStr}
                    </span>
                    <span>{scan.wordCount} kata</span>
                    <span className="capitalize px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      {scan.category}
                    </span>
                  </div>
                </div>

                {/* Quick Action buttons */}
                <div className="flex flex-col gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleCopyText(scan, e)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    title="Salin Teks"
                  >
                    {copiedId === scan.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={(e) => handleDelete(scan.id, e)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
