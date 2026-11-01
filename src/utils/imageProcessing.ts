import { ImageProcessingOptions } from '../types';

/**
 * Calculates optimal Otsu threshold for black-and-white text segmentation.
 * This dramatically improves OCR accuracy on photos taken in dim or uneven light.
 */
function calculateOtsuThreshold(histogram: number[], totalPixels: number): number {
  let sum = 0;
  for (let i = 0; i < 256; i++) {
    sum += i * histogram[i];
  }

  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let maxVariance = 0;
  let threshold = 128;

  for (let t = 0; t < 256; t++) {
    wB += histogram[t];
    if (wB === 0) continue;
    wF = totalPixels - wB;
    if (wF === 0) break;

    sumB += t * histogram[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;

    const varianceBetween = wB * wF * (mB - mF) * (mB - mF);
    if (varianceBetween > maxVariance) {
      maxVariance = varianceBetween;
      threshold = t;
    }
  }

  return threshold;
}

/**
 * Applies full image processing pipeline to an HTMLImageElement or ImageData and returns dataURL
 */
export async function processImageForOCR(
  sourceImage: HTMLImageElement | HTMLCanvasElement,
  options: ImageProcessingOptions
): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get 2D canvas context');

  // Handle rotation
  const isRotated90or270 = options.rotation === 90 || options.rotation === 270;
  canvas.width = isRotated90or270 ? sourceImage.height : sourceImage.width;
  canvas.height = isRotated90or270 ? sourceImage.width : sourceImage.height;

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((options.rotation * Math.PI) / 180);
  ctx.drawImage(
    sourceImage,
    -sourceImage.width / 2,
    -sourceImage.height / 2
  );
  ctx.restore();

  // If no pixel manipulations needed, return canvas as image
  if (
    !options.grayscale &&
    !options.binarize &&
    options.contrast === 0 &&
    options.brightness === 0 &&
    !options.invert &&
    !options.sharpness
  ) {
    return canvas.toDataURL('image/png');
  }

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const numPixels = canvas.width * canvas.height;

  // Build grayscale representation & histogram
  const histogram = new Array(256).fill(0);
  const grayArray = new Uint8ClampedArray(numPixels);

  const contrastFactor = (259 * (options.contrast + 255)) / (255 * (259 - options.contrast));
  const brightnessOffset = options.brightness;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Contrast & Brightness adjustment
    if (options.contrast !== 0) {
      r = Math.min(255, Math.max(0, contrastFactor * (r - 128) + 128));
      g = Math.min(255, Math.max(0, contrastFactor * (g - 128) + 128));
      b = Math.min(255, Math.max(0, contrastFactor * (b - 128) + 128));
    }

    if (options.brightness !== 0) {
      r = Math.min(255, Math.max(0, r + brightnessOffset));
      g = Math.min(255, Math.max(0, g + brightnessOffset));
      b = Math.min(255, Math.max(0, b + brightnessOffset));
    }

    // Standard Rec. 709 luminance
    const gray = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
    const pixelIndex = i / 4;
    grayArray[pixelIndex] = gray;
    histogram[gray]++;

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }

  // Determine threshold if binarization is active
  let targetThreshold = options.thresholdValue;
  if (options.binarize && options.thresholdValue === 0) {
    targetThreshold = calculateOtsuThreshold(histogram, numPixels);
  }

  // Apply Binarization or Grayscale/Invert
  for (let i = 0; i < data.length; i += 4) {
    const pixelIndex = i / 4;
    let gray = grayArray[pixelIndex];

    if (options.binarize) {
      // Clean black and white
      const bw = gray >= targetThreshold ? 255 : 0;
      data[i] = bw;
      data[i + 1] = bw;
      data[i + 2] = bw;
    } else if (options.grayscale) {
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }

    if (options.invert) {
      data[i] = 255 - data[i];
      data[i + 1] = 255 - data[i + 1];
      data[i + 2] = 255 - data[i + 2];
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Optional subtle unsharp mask/sharpen kernel
  if (options.sharpness) {
    applySharpenKernel(ctx, canvas.width, canvas.height);
  }

  return canvas.toDataURL('image/png');
}

function applySharpenKernel(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const src = imgData.data;
  const output = ctx.createImageData(width, height);
  const dst = output.data;

  // 3x3 Sharpen Kernel:
  //  0 -1  0
  // -1  5 -1
  //  0 -1  0
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const top = ((y - 1) * width + x) * 4;
      const bottom = ((y + 1) * width + x) * 4;
      const left = (y * width + (x - 1)) * 4;
      const right = (y * width + (x + 1)) * 4;

      for (let c = 0; c < 3; c++) {
        const val =
          5 * src[idx + c] -
          src[top + c] -
          src[bottom + c] -
          src[left + c] -
          src[right + c];
        dst[idx + c] = Math.min(255, Math.max(0, val));
      }
      dst[idx + 3] = 255;
    }
  }

  ctx.putImageData(output, 0, 0);
}

/**
 * Creates an HTMLImageElement from a URL or Base64 string
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image: ' + e));
    img.src = src;
  });
}
