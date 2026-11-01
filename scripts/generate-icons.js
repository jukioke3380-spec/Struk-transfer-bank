import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Create SVG Icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#0369a1" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <linearGradient id="paperGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#f8fafc" />
    </linearGradient>
    <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.35" />
    </filter>
  </defs>

  <!-- App Rounded Base -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />

  <!-- Subtle glow rings -->
  <circle cx="256" cy="256" r="210" fill="none" stroke="#38bdf8" stroke-width="2" opacity="0.2" />

  <!-- White Paper Receipt Floating -->
  <g filter="url(#shadow)">
    <rect x="136" y="96" width="240" height="320" rx="20" fill="url(#paperGrad)" />
    <!-- Receipt serrated top/bottom cuts or header bar -->
    <rect x="136" y="96" width="240" height="28" rx="14" fill="#0284c7" />
    
    <!-- Header lines in receipt -->
    <rect x="180" y="140" width="152" height="12" rx="6" fill="#0f172a" />
    <rect x="200" y="162" width="112" height="8" rx="4" fill="#64748b" />
    <line x1="160" y1="184" x2="352" y2="184" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="6,4" />

    <!-- Details lines -->
    <rect x="160" y="200" width="80" height="8" rx="4" fill="#94a3b8" />
    <rect x="272" y="200" width="80" height="8" rx="4" fill="#0f172a" />
    <rect x="160" y="222" width="70" height="8" rx="4" fill="#94a3b8" />
    <rect x="262" y="222" width="90" height="8" rx="4" fill="#0f172a" />
    
    <!-- Highlighted Total Box (Blue) like the receipt! -->
    <rect x="156" y="250" width="200" height="54" rx="10" fill="#f0f9ff" stroke="#0284c7" stroke-width="3" />
    <rect x="170" y="266" width="56" height="8" rx="4" fill="#0284c7" />
    <rect x="170" y="280" width="40" height="6" rx="3" fill="#64748b" />
    <rect x="270" y="268" width="72" height="18" rx="4" fill="#0284c7" />

    <!-- Checkmark Green Success Badge -->
    <g transform="translate(256, 332)">
      <circle cx="0" cy="0" r="14" fill="#10b981" />
      <path d="M -6 -1 L -2 4 L 7 -5" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    </g>

    <!-- Mini Barcode -->
    <g transform="translate(180, 362)">
      <rect x="0" y="0" width="3" height="24" fill="#0f172a" />
      <rect x="6" y="0" width="5" height="24" fill="#0f172a" />
      <rect x="14" y="0" width="2" height="24" fill="#0f172a" />
      <rect x="18" y="0" width="6" height="24" fill="#0f172a" />
      <rect x="28" y="0" width="3" height="24" fill="#0f172a" />
      <rect x="34" y="0" width="4" height="24" fill="#0f172a" />
      <rect x="42" y="0" width="7" height="24" fill="#0f172a" />
      <rect x="52" y="0" width="2" height="24" fill="#0f172a" />
      <rect x="58" y="0" width="5" height="24" fill="#0f172a" />
      <rect x="66" y="0" width="3" height="24" fill="#0f172a" />
      <rect x="72" y="0" width="6" height="24" fill="#0f172a" />
      <rect x="82" y="0" width="4" height="24" fill="#0f172a" />
      <rect x="90" y="0" width="2" height="24" fill="#0f172a" />
      <rect x="96" y="0" width="5" height="24" fill="#0f172a" />
      <rect x="104" y="0" width="4" height="24" fill="#0f172a" />
      <rect x="112" y="0" width="3" height="24" fill="#0f172a" />
      <rect x="118" y="0" width="6" height="24" fill="#0f172a" />
      <rect x="128" y="0" width="4" height="24" fill="#0f172a" />
      <rect x="136" y="0" width="3" height="24" fill="#0f172a" />
      <rect x="142" y="0" width="6" height="24" fill="#0f172a" />
      <rect x="150" y="0" width="2" height="24" fill="#0f172a" />
    </g>
  </g>

  <!-- Glowing Send/Transfer badge -->
  <g transform="translate(382, 126)">
    <circle cx="0" cy="0" r="32" fill="#10b981" filter="url(#shadow)" />
    <path d="M -12 6 L 10 -12 M 10 -12 L 1 -12 M 10 -12 L 10 -3" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
  </g>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function createPngBuffer(width, height, isMaskable = false) {
  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8);
  ihdrData.writeUInt8(6, 9);
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  const cx = width / 2;
  const cy = height / 2;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0;

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Base gradient: Deep Slate to Sky Blue
      const t = (x + y) / (width + height);
      let r = Math.round(15 + t * 2);
      let g = Math.round(23 + t * 105);
      let b = Math.round(42 + t * 155);
      let a = 255;

      if (!isMaskable) {
        // Rounded app icon border
        const cornerR = width * 0.22;
        const pad = width * 0.04;
        const left = pad + cornerR;
        const right = width - pad - cornerR;
        const top = pad + cornerR;
        const bottom = height - pad - cornerR;

        let inBox = false;
        if (x >= pad && x <= width - pad && y >= top && y <= bottom) inBox = true;
        if (y >= pad && y <= height - pad && x >= left && x <= right) inBox = true;
        if (x < left && y < top && Math.hypot(x - left, y - top) <= cornerR) inBox = true;
        if (x > right && y < top && Math.hypot(x - right, y - top) <= cornerR) inBox = true;
        if (x < left && y > bottom && Math.hypot(x - left, y - bottom) <= cornerR) inBox = true;
        if (x > right && y > bottom && Math.hypot(x - right, y - bottom) <= cornerR) inBox = true;

        if (!inBox) {
          a = 0;
          r = 0;
          g = 0;
          b = 0;
        }
      }

      if (a > 0) {
        // Draw white receipt rectangle in center
        const rw = width * (isMaskable ? 0.44 : 0.48);
        const rh = height * (isMaskable ? 0.62 : 0.66);
        const rx = cx - rw / 2;
        const ry = cy - rh / 2;

        if (x >= rx && x <= rx + rw && y >= ry && y <= ry + rh) {
          // White paper base
          r = 255;
          g = 255;
          b = 255;

          // Receipt top header banner (cyan/blue)
          if (y <= ry + rh * 0.12) {
            r = 2;
            g = 132;
            b = 199;
          }

          // Blue total box inside receipt
          const bx = rx + rw * 0.1;
          const bw = rw * 0.8;
          const by = ry + rh * 0.52;
          const bh = rh * 0.22;

          if (x >= bx && x <= bx + bw && y >= by && y <= by + bh) {
            // Blue highlight border
            const isBorder =
              x <= bx + 3 || x >= bx + bw - 3 || y <= by + 3 || y >= by + bh - 3;
            if (isBorder) {
              r = 2;
              g = 132;
              b = 199;
            } else {
              // Light sky blue background
              r = 240;
              g = 249;
              b = 255;
            }
          }

          // Barcode stripes near bottom
          const barY = ry + rh * 0.82;
          const barH = rh * 0.1;
          if (y >= barY && y <= barY + barH && x >= rx + rw * 0.15 && x <= rx + rw * 0.85) {
            const stripe = Math.floor((x - rx) / 4) % 2 === 0;
            if (stripe) {
              r = 15;
              g = 23;
              b = 42;
            }
          }
        }

        // Green Success Badge in top right corner
        const badgeX = cx + rw * 0.4;
        const badgeY = cy - rh * 0.4;
        const badgeR = width * 0.1;
        if (Math.hypot(x - badgeX, y - badgeY) <= badgeR) {
          r = 16;
          g = 185;
          b = 129; // emerald green
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

const icon192 = createPngBuffer(192, 192, false);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), icon192);

const icon512 = createPngBuffer(512, 512, false);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), icon512);

const iconMaskable = createPngBuffer(512, 512, true);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), iconMaskable);

const appleIcon = createPngBuffer(180, 180, false);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);

fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPngBuffer(64, 64, false));

console.log('Icons updated successfully for NotaKirim PWA!');
