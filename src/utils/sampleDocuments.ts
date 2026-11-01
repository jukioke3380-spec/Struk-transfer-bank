export interface SampleDocument {
  id: string;
  name: string;
  category: 'struk' | 'dokumen' | 'ktp' | 'buku';
  description: string;
  dataUrl: string;
}

// Generate crisp realistic document images using HTML5 Canvas so they are 100% self-contained and offline
export function generateSampleReceipt(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 800;
  const ctx = canvas.getContext('2d')!;

  // Paper background
  ctx.fillStyle = '#faf8f5';
  ctx.fillRect(0, 0, 600, 800);

  // Subtle thermal paper texture/shadow
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, 580, 780);

  // Header
  ctx.fillStyle = '#0f172a';
  ctx.textAlign = 'center';
  ctx.font = 'bold 28px "Courier New", monospace';
  ctx.fillText('TOKO MAJU JAYA ABADI', 300, 70);

  ctx.font = '16px "Courier New", monospace';
  ctx.fillText('Jl. Merdeka No. 45, Jakarta Selatan', 300, 105);
  ctx.fillText('Telp: (021) 555-0199 | NPWP: 01.234.567.8-012', 300, 130);

  ctx.fillText('------------------------------------------------', 300, 160);

  ctx.textAlign = 'left';
  ctx.font = '16px "Courier New", monospace';
  ctx.fillText('No. Transaksi : TRX-20261031-8842', 40, 190);
  ctx.fillText('Tanggal       : 31/10/2026  14:25:10', 40, 215);
  ctx.fillText('Kasir         : Budi Santoso (K-04)', 40, 240);
  ctx.fillText('Pelanggan     : Member Umum', 40, 265);

  ctx.textAlign = 'center';
  ctx.fillText('================================================', 300, 295);

  // Items
  const items = [
    { name: 'Kopi Kapal Api Special 165g', qty: '2 PCS', price: 'Rp 28.000' },
    { name: 'Susu UHT Full Cream 1000ml', qty: '1 PCS', price: 'Rp 19.500' },
    { name: 'Roti Gandum Serbaguna', qty: '1 PCS', price: 'Rp 16.000' },
    { name: 'Air Mineral Pegunungan 600ml', qty: '3 PCS', price: 'Rp 12.000' },
    { name: 'Minyak Goreng Pouch 2L', qty: '1 PCS', price: 'Rp 34.500' },
    { name: 'Biskuit Cokelat Marie', qty: '2 PCS', price: 'Rp 18.000' },
  ];

  let y = 335;
  for (const item of items) {
    ctx.textAlign = 'left';
    ctx.fillText(item.name, 40, y);
    ctx.textAlign = 'right';
    ctx.fillText(`${item.qty}  ${item.price}`, 560, y);
    y += 35;
  }

  ctx.textAlign = 'center';
  ctx.fillText('------------------------------------------------', 300, y + 10);

  y += 45;
  ctx.textAlign = 'left';
  ctx.font = '16px "Courier New", monospace';
  ctx.fillText('Subtotal (10 Items)', 40, y);
  ctx.textAlign = 'right';
  ctx.fillText('Rp 128.000', 560, y);

  y += 30;
  ctx.textAlign = 'left';
  ctx.fillText('PPN (11%)', 40, y);
  ctx.textAlign = 'right';
  ctx.fillText('Rp 14.080', 560, y);

  y += 35;
  ctx.font = 'bold 22px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('TOTAL PEMBAYARAN', 40, y);
  ctx.textAlign = 'right';
  ctx.fillText('Rp 142.080', 560, y);

  y += 35;
  ctx.font = '16px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('Bayar (QRIS Mandiri)', 40, y);
  ctx.textAlign = 'right';
  ctx.fillText('Rp 142.080', 560, y);

  y += 30;
  ctx.fillText('Kembalian', 40, y);
  ctx.textAlign = 'right';
  ctx.fillText('Rp 0', 560, y);

  y += 50;
  ctx.textAlign = 'center';
  ctx.font = 'italic 16px "Courier New", monospace';
  ctx.fillText('Terima Kasih Telah Berbelanja', 300, y);
  ctx.fillText('Barang yang sudah dibeli tidak dapat ditukar', 300, y + 25);
  ctx.font = '14px "Courier New", monospace';
  ctx.fillText('Simpan struk ini sebagai bukti transaksi resmi', 300, y + 50);

  return canvas.toDataURL('image/png');
}

export function generateSampleLetter(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 650;
  canvas.height = 850;
  const ctx = canvas.getContext('2d')!;

  // White letter paper
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 650, 850);

  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, 590, 790);

  ctx.fillStyle = '#0f172a';
  ctx.textAlign = 'center';
  ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
  ctx.fillText('PT NUSANTARA DIGITAL SOLUSINDO', 325, 75);

  ctx.font = '13px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('Gedung Cyber One Lt. 12, Jl. H.R. Rasuna Said, Jakarta', 325, 100);
  ctx.fillText('Email: sekretariat@nusantaradigital.id | www.nusantaradigital.id', 325, 120);

  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(50, 135);
  ctx.lineTo(600, 135);
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.textAlign = 'left';
  ctx.font = '14px "Segoe UI", Arial, sans-serif';
  ctx.fillText('Nomor   : 142/NDS-DIR/X/2026', 50, 170);
  ctx.fillText('Lampiran: 1 (Satu) Berkas Proposal', 50, 195);
  ctx.fillText('Perihal : Surat Pemberitahuan Kerjasama Teknis', 50, 220);

  ctx.fillText('Kepada Yth.', 50, 260);
  ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
  ctx.fillText('Bapak / Ibu Pimpinan Divisi Teknologi', 50, 280);
  ctx.font = '14px "Segoe UI", Arial, sans-serif';
  ctx.fillText('Di Tempat', 50, 300);

  ctx.fillText('Dengan hormat,', 50, 340);

  const paragraphs = [
    'Sehubungan dengan rencana integrasi sistem digital berbasis kecerdasan buatan',
    'dan teknologi Progressive Web App (PWA) untuk pemindaian dokumen offline,',
    'bersama surat ini kami menyampaikan komitmen resmi untuk mendukung seluruh',
    'proses implementasi secara terencana dan profesional.',
    '',
    'Fitur unggulan yang disepakati meliputi ekstraksi teks berkecepatan tinggi,',
    'penyimpanan lokal terenkripsi, serta kapabilitas kerja tanpa jaringan internet',
    'menggunakan teknologi Service Worker modern.',
    '',
    'Demikian surat pemberitahuan ini kami sampaikan. Atas perhatian dan kerjasama',
    'yang baik, kami ucapkan terima kasih yang sebesar-besarnya.',
  ];

  let py = 370;
  for (const line of paragraphs) {
    if (line === '') {
      py += 15;
    } else {
      ctx.fillText(line, 50, py);
      py += 24;
    }
  }

  // Signature
  py += 40;
  ctx.fillText('Jakarta, 31 Oktober 2026', 420, py);
  ctx.fillText('Hormat kami,', 420, py + 25);
  ctx.fillText('PT Nusantara Digital Solusindo', 420, py + 50);

  ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
  ctx.fillText('Ahmad Rizki Pratama, M.Kom', 420, py + 120);
  ctx.font = '13px "Segoe UI", Arial, sans-serif';
  ctx.fillText('Direktur Utama', 420, py + 140);

  return canvas.toDataURL('image/png');
}

export function generateSampleIDCard(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 400;
  const ctx = canvas.getContext('2d')!;

  // Card background
  const grad = ctx.createLinearGradient(0, 0, 640, 400);
  grad.addColorStop(0, '#e0f2fe');
  grad.addColorStop(1, '#bae6fd');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 640, 400);

  // Border
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, 620, 380);

  ctx.fillStyle = '#0369a1';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('REPUBLIK INDONESIA', 320, 40);
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('KARTU TANDA PENDUDUK / ID CARD', 320, 68);

  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(30, 80);
  ctx.lineTo(610, 80);
  ctx.stroke();

  // NIK
  ctx.textAlign = 'left';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 20px "Courier New", monospace';
  ctx.fillText('NIK : 3171052408950003', 40, 115);

  ctx.font = 'bold 14px sans-serif';
  const fields = [
    { label: 'Nama', val: 'DIMAS PRASETYA NUGRAHA' },
    { label: 'Tempat/Tgl Lahir', val: 'JAKARTA, 24-08-1995' },
    { label: 'Jenis Kelamin', val: 'LAKI-LAKI' },
    { label: 'Golongan Darah', val: 'O' },
    { label: 'Alamat', val: 'JL. MELATI NO. 18 RT 004 / RW 002' },
    { label: 'Kelurahan/Desa', val: 'KRAMAT JATI' },
    { label: 'Kecamatan', val: 'KRAMAT JATI' },
    { label: 'Agama', val: 'ISLAM' },
    { label: 'Status Perkawinan', val: 'BELUM KAWIN' },
    { label: 'Pekerjaan', val: 'KARYAWAN SWASTA' },
    { label: 'Kewarganegaraan', val: 'WNI' },
    { label: 'Berlaku Hingga', val: 'SEUMUR HIDUP' },
  ];

  let fy = 145;
  for (const f of fields) {
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText(f.label, 40, fy);
    ctx.fillText(':', 180, fy);
    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(f.val, 195, fy);
    fy += 20;
  }

  // Photo placeholder box
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(490, 110, 115, 145);
  ctx.fillStyle = '#ffffff';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PAS FOTO', 547, 180);
  ctx.fillText('3 x 4', 547, 200);

  return canvas.toDataURL('image/png');
}

export function getSampleDocuments(): SampleDocument[] {
  return [
    {
      id: 'sample-receipt',
      name: 'Struk Belanja Kasir',
      category: 'struk',
      description: 'Struk belanja minimarket dengan rincian harga, kuantitas, dan total transaksi.',
      dataUrl: generateSampleReceipt(),
    },
    {
      id: 'sample-letter',
      name: 'Surat Resmi Bisnis',
      category: 'dokumen',
      description: 'Dokumen surat perjanjian resmi kop surat PT Nusantara Digital.',
      dataUrl: generateSampleLetter(),
    },
    {
      id: 'sample-idcard',
      name: 'Kartu Identitas KTP',
      category: 'ktp',
      description: 'Contoh kartu identitas dengan nomor NIK, nama lengkap, dan data domisili.',
      dataUrl: generateSampleIDCard(),
    },
  ];
}
