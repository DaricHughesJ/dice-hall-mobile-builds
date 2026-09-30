import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

// Original procedural dice icon for this test build. No private assets.
const size = 1024;
const pixels = Buffer.alloc((size * 3 + 1) * size);
for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    let color = [16, 32, 24];
    const cx = Math.max(272, Math.min(752, x));
    const cy = Math.max(272, Math.min(752, y));
    if ((x - cx) ** 2 + (y - cy) ** 2 <= 64 ** 2) color = [226, 189, 105];
    if ([[368, 368], [656, 368], [512, 512], [368, 656], [656, 656]].some(([px, py]) => (x-px)**2+(y-py)**2 < 48**2)) color = [16, 32, 24];
    const offset = y * (size * 3 + 1) + 1 + x * 3;
    pixels.set(color, offset);
  }
}
function crc32(buffer) {
  let value = 0xffffffff;
  for (const byte of buffer) {
    value ^= byte;
    for (let i = 0; i < 8; i++) value = (value >>> 1) ^ ((value & 1) ? 0xedb88320 : 0);
  }
  return (value ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data]);
  const length = Buffer.alloc(4); length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}
const header = Buffer.alloc(13);
header.writeUInt32BE(size, 0); header.writeUInt32BE(size, 4); header[8] = 8; header[9] = 2;
writeFileSync('ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png', Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', header), chunk('IDAT', deflateSync(pixels)), chunk('IEND', Buffer.alloc(0))]));
