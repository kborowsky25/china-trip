// Generates the app assets — a cute panda — as valid PNGs with a tiny
// dependency-free encoder. icon: red field + white panda. adaptive: transparent
// + white panda (Android composites the red bg). splash: a red disc badge with
// the panda so it reads on the white splash background.
// Run: node scripts/make-assets.mjs
import fs from "node:fs";
import zlib from "node:zlib";
import path from "node:path";

const OUT = path.join(process.cwd(), "mobile/assets");
fs.mkdirSync(OUT, { recursive: true });

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function png(width, height, draw) {
  const bpp = 4;
  const raw = Buffer.alloc((width * bpp + 1) * height);
  for (let y = 0; y < height; y++) {
    const row = y * (width * bpp + 1);
    raw[row] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = draw(x, y);
      const o = row + 1 + x * bpp;
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = a;
    }
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
    const t = Buffer.from(type, "ascii");
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
    return Buffer.concat([len, t, data, crc]);
  };
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

const RED = [222, 41, 16];
const WHITE = [253, 253, 251];
const BLACK = [23, 24, 28];
const PINK = [246, 176, 192];

// mode: "iconRed" | "transparent" | "badge"  — cute full-body sitting panda
function panda(S, mode) {
  const inC = (x, y, cx, cy, r) => (x - cx * S) ** 2 + (y - cy * S) ** 2 <= (r * S) ** 2;
  const inE = (x, y, cx, cy, rx, ry) =>
    ((x - cx * S) ** 2) / ((rx * S) ** 2) + ((y - cy * S) ** 2) / ((ry * S) ** 2) <= 1;

  return (x, y) => {
    // features on the head (top layer)
    if (inE(x, y, 0.5, 0.43, 0.04, 0.03)) return [...BLACK, 255]; // nose
    if (inC(x, y, 0.42, 0.354, 0.022)) return [...BLACK, 255]; // pupils
    if (inC(x, y, 0.59, 0.354, 0.022)) return [...BLACK, 255];
    if (inC(x, y, 0.415, 0.345, 0.037)) return [...WHITE, 255]; // eyes
    if (inC(x, y, 0.585, 0.345, 0.037)) return [...WHITE, 255];
    if (inE(x, y, 0.33, 0.44, 0.042, 0.03)) return [...PINK, 255]; // cheeks
    if (inE(x, y, 0.67, 0.44, 0.042, 0.03)) return [...PINK, 255];
    if (inE(x, y, 0.4, 0.33, 0.075, 0.1)) return [...BLACK, 255]; // eye patches
    if (inE(x, y, 0.6, 0.33, 0.075, 0.1)) return [...BLACK, 255];
    // head (white) over ear/body overlap
    if (inC(x, y, 0.5, 0.34, 0.25)) return [...WHITE, 255];
    // body (white) over arm/leg overlap
    if (inE(x, y, 0.5, 0.7, 0.28, 0.25)) return [...WHITE, 255];
    // ears
    if (inC(x, y, 0.31, 0.16, 0.095)) return [...BLACK, 255];
    if (inC(x, y, 0.69, 0.16, 0.095)) return [...BLACK, 255];
    // arms + legs
    if (inE(x, y, 0.23, 0.64, 0.085, 0.17)) return [...BLACK, 255];
    if (inE(x, y, 0.77, 0.64, 0.085, 0.17)) return [...BLACK, 255];
    if (inE(x, y, 0.37, 0.92, 0.11, 0.08)) return [...BLACK, 255];
    if (inE(x, y, 0.63, 0.92, 0.11, 0.08)) return [...BLACK, 255];
    // background
    if (mode === "iconRed") return [...RED, 255];
    if (mode === "badge") return inC(x, y, 0.5, 0.5, 0.49) ? [...RED, 255] : [0, 0, 0, 0];
    return [0, 0, 0, 0];
  };
}

fs.writeFileSync(path.join(OUT, "icon.png"), png(1024, 1024, panda(1024, "iconRed")));
fs.writeFileSync(path.join(OUT, "adaptive-icon.png"), png(1024, 1024, panda(1024, "transparent")));
fs.writeFileSync(path.join(OUT, "splash.png"), png(1024, 1024, panda(1024, "badge")));
fs.writeFileSync(path.join(OUT, "favicon.png"), png(64, 64, panda(64, "iconRed")));
console.log("Wrote panda icon.png, adaptive-icon.png, splash.png, favicon.png to", OUT);
