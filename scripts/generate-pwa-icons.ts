import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

/**
 * Generate a valid uncompressed/DEFLATE PNG buffer from raw RGBA pixels
 */
function createPng(width: number, height: number, getPixel: (x: number, y: number) => [number, number, number, number]): Buffer {
  const rowBytes = width * 4 + 1; // 1 byte for filter type 0
  const rawData = Buffer.alloc(rowBytes * height);

  for (let y = 0; y < height; y++) {
    const rowStart = y * rowBytes;
    rawData[rowStart] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y);
      const pxOffset = rowStart + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type 6: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type: string, data: Buffer): Buffer {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crcTarget = chunk.subarray(4, 8 + len);
  const crcVal = crc32(crcTarget);
  chunk.writeUInt32BE(crcVal, 8 + len);
  return chunk;
}

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = (c >>> 8) ^ table[(c ^ buf[i]) & 0xff];
  }
  return (c ^ 0xffffffff) >>> 0;
}

const table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  table[i] = c >>> 0;
}

// Salon Icon Generator
function generateSalonIcon(size: number): Buffer {
  return createPng(size, size, (x, y) => {
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.45;
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Background: Dark Slate #09090b
    if (dist > r) {
      return [9, 9, 11, 0]; // Transparent outer
    }

    // Outer Gold Ring (radius ~ 0.43 to 0.45)
    if (dist > r - (size * 0.03)) {
      return [245, 208, 97, 255]; // Amber Gold
    }

    // Inner U Shape & Gold Gradient
    const relX = (x - cx) / (size * 0.3);
    const relY = (y - cy) / (size * 0.3);

    // Center U logic
    const inU =
      relY >= -0.7 &&
      relY <= 0.6 &&
      Math.abs(relX) <= 0.7 &&
      !(Math.abs(relX) < 0.35 && relY < 0.2);

    if (inU) {
      return [251, 191, 36, 255]; // Gold Amber
    }

    return [18, 18, 22, 255]; // Dark background inside circle
  });
}

const outDir = path.join(process.cwd(), 'public', 'icons');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'icon-192x192.png'), generateSalonIcon(192));
fs.writeFileSync(path.join(outDir, 'icon-512x512.png'), generateSalonIcon(512));
fs.writeFileSync(path.join(outDir, 'icon-maskable-512x512.png'), generateSalonIcon(512));
console.log('✅ PWA Icons successfully generated in public/icons/');
