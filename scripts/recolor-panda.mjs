// Recolours the traveling-panda illustration to the app theme (green background
// → white, green backpack → China red) and writes the icon/splash assets.
// Run: node scripts/recolor-panda.mjs [--sample]
import fs from "node:fs";
import zlib from "node:zlib";
import path from "node:path";

const SRC = "/private/tmp/claude-501/-Users-kikiboro-Github-China-Trip/d8f8874d-cbe8-48a6-ba61-f05edfff23ff/scratchpad/panda-src.png";
const OUTDIR = path.join(process.cwd(), "mobile/assets");

const RED = [222, 41, 16];
const WHITE = [255, 255, 255];

// ---- PNG decode (8-bit RGB/RGBA) ----
function decodePNG(buf) {
  let pos = 8, width = 0, height = 0, colorType = 6;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") { width = data.readUInt32BE(0); height = data.readUInt32BE(4); colorType = data[9]; }
    else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    pos += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const ch = colorType === 6 ? 4 : colorType === 2 ? 3 : 1;
  const stride = width * ch;
  const out = Buffer.alloc(width * height * 4);
  let prev = Buffer.alloc(stride), p = 0;
  for (let y = 0; y < height; y++) {
    const f = raw[p++];
    const line = Buffer.from(raw.subarray(p, p + stride));
    p += stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? line[x - ch] : 0, b = prev[x], c = x >= ch ? prev[x - ch] : 0;
      let v = line[x];
      if (f === 1) v = (v + a) & 0xff;
      else if (f === 2) v = (v + b) & 0xff;
      else if (f === 3) v = (v + ((a + b) >> 1)) & 0xff;
      else if (f === 4) { const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c); const pr = pa <= pb && pa <= pc ? a : pb <= pc ? b : c; v = (v + pr) & 0xff; }
      line[x] = v;
    }
    prev = line;
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      if (ch === 4) { out[o] = line[x*4]; out[o+1] = line[x*4+1]; out[o+2] = line[x*4+2]; out[o+3] = line[x*4+3]; }
      else if (ch === 3) { out[o] = line[x*3]; out[o+1] = line[x*3+1]; out[o+2] = line[x*3+2]; out[o+3] = 255; }
      else { out[o] = out[o+1] = out[o+2] = line[x]; out[o+3] = 255; }
    }
  }
  return { width, height, data: out };
}

// ---- PNG encode (8-bit RGBA) ----
const crcTable = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(b) { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = crcTable[(c ^ b[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function encodePNG(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) { const row = y * (width * 4 + 1); raw[row] = 0; rgba.copy(raw, row + 1, y * width * 4, (y + 1) * width * 4); }
  const idat = zlib.deflateSync(raw, { level: 9 });
  const chunk = (t, d) => { const len = Buffer.alloc(4); len.writeUInt32BE(d.length, 0); const ty = Buffer.from(t, "ascii"); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([ty, d])), 0); return Buffer.concat([len, ty, d, crc]); };
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

const img = decodePNG(fs.readFileSync(SRC));
const at = (x, y) => { const o = (y * img.width + x) * 4; return [img.data[o], img.data[o+1], img.data[o+2]]; };

if (process.argv.includes("--sample")) {
  const pts = { bgCorner:[6,6], bgMid:[40,370], shadow:[370,660], backpackBody:[175,470], backpackLow:[190,520], strap:[300,405], roll:[215,300], pandaWhite:[370,300], pandaGrey:[330,250], mouth:[420,320] };
  for (const [k, [x, y]] of Object.entries(pts)) console.log(k.padEnd(14), at(x, y));
  process.exit(0);
}

// ---- recolour ----
// green background (incl. shadow) -> white/transparent; green backpack -> red (shaded)
function recolour(transparentBg) {
  const w = img.width, h = img.height;
  const out = Buffer.from(img.data); // copy
  for (let i = 0; i < w * h; i++) {
    const o = i * 4;
    const r = img.data[o], g = img.data[o + 1], b = img.data[o + 2];
    const green = g > r + 16 && g > b + 16;
    if (!green) continue;
    // backpack = vivid green (low-ish red, bright green); background = pastel (high red) or dark shadow
    const backpack = r < 120 && b < 110 && g >= 140 && g <= 195;
    if (backpack) {
      const f = Math.max(0.6, Math.min(1.15, g / 205));
      out[o] = Math.min(255, RED[0] * f);
      out[o + 1] = Math.min(255, RED[1] * f + 6);
      out[o + 2] = Math.min(255, RED[2] * f + 6);
      out[o + 3] = 255;
    } else {
      if (transparentBg) { out[o + 3] = 0; }
      else { out[o] = WHITE[0]; out[o + 1] = WHITE[1]; out[o + 2] = WHITE[2]; out[o + 3] = 255; }
    }
  }
  return { width: w, height: h, data: out };
}

// bilinear scale to size×size
function scale(src, size) {
  const { width: sw, height: sh, data } = src;
  const out = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    const sy = (y / size) * (sh - 1);
    const y0 = Math.floor(sy), y1 = Math.min(sh - 1, y0 + 1), fy = sy - y0;
    for (let x = 0; x < size; x++) {
      const sx = (x / size) * (sw - 1);
      const x0 = Math.floor(sx), x1 = Math.min(sw - 1, x0 + 1), fx = sx - x0;
      const o = (y * size + x) * 4;
      for (let c = 0; c < 4; c++) {
        const p00 = data[(y0 * sw + x0) * 4 + c], p10 = data[(y0 * sw + x1) * 4 + c];
        const p01 = data[(y1 * sw + x0) * 4 + c], p11 = data[(y1 * sw + x1) * 4 + c];
        const top = p00 + (p10 - p00) * fx, bot = p01 + (p11 - p01) * fx;
        out[o + c] = Math.round(top + (bot - top) * fy);
      }
    }
  }
  return out;
}

// flatten transparent onto a solid colour
function flatten(rgba, size, bg) {
  const out = Buffer.from(rgba);
  for (let i = 0; i < size * size; i++) {
    const o = i * 4, a = out[o + 3] / 255;
    out[o] = Math.round(out[o] * a + bg[0] * (1 - a));
    out[o + 1] = Math.round(out[o + 1] * a + bg[1] * (1 - a));
    out[o + 2] = Math.round(out[o + 2] * a + bg[2] * (1 - a));
    out[o + 3] = 255;
  }
  return out;
}

const white = recolour(false);
const transp = recolour(true);

fs.writeFileSync(path.join(OUTDIR, "icon.png"), encodePNG(1024, 1024, scale(white, 1024)));
fs.writeFileSync(path.join(OUTDIR, "adaptive-icon.png"), encodePNG(1024, 1024, scale(white, 1024)));
fs.writeFileSync(path.join(OUTDIR, "splash.png"), encodePNG(1024, 1024, scale(transp, 1024)));
fs.writeFileSync(path.join(OUTDIR, "favicon.png"), encodePNG(64, 64, flatten(scale(transp, 64), 64, WHITE)));
console.log("Wrote recoloured panda icon/adaptive/splash/favicon to", OUTDIR);
