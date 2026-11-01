/**
 * Generates clean barcode lines matching Code 128 / Code 39 visual pattern
 */
export function generateBarcodeLines(code: string): { width: number; gap: number }[] {
  // Deterministic pattern generator based on code characters
  const cleanCode = code.replace(/[^0-9A-Za-z]/g, '') || '242152912341';
  const lines: { width: number; gap: number }[] = [];

  // Start pattern
  lines.push({ width: 3, gap: 2 });
  lines.push({ width: 1, gap: 2 });
  lines.push({ width: 4, gap: 3 });

  for (let i = 0; i < cleanCode.length; i++) {
    const num = parseInt(cleanCode[i], 36) || 5;
    const w1 = (num % 3) + 1.5;
    const g1 = ((num * 2) % 3) + 1.5;
    const w2 = ((num + 1) % 4) + 1;
    const g2 = ((num + 2) % 3) + 2;

    lines.push({ width: w1, gap: g1 });
    lines.push({ width: w2, gap: g2 });
  }

  // Stop pattern
  lines.push({ width: 3, gap: 2 });
  lines.push({ width: 1, gap: 1.5 });
  lines.push({ width: 4, gap: 2 });

  return lines;
}
