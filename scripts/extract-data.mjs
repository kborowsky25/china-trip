// Extracts trip data (coordinates, stops, travellers, rail waypoints) from the
// original HTML by re-using its own trainLink/hotelLink logic, so every long
// booking URL and field is byte-for-byte faithful. Writes mobile/lib/tripData.ts.
// Run: node scripts/extract-data.mjs
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SRC = "/Users/kikiboro/Downloads/china-trip-2026.html";
const OUT = path.join(process.cwd(), "mobile/lib/tripData.ts");
const html = fs.readFileSync(SRC, "utf8");

// Scan forward from a marker to the matching close of the first `open` char,
// respecting string literals so braces/brackets inside strings don't count.
function balancedFrom(startIdx, open, close) {
  let i = html.indexOf(open, startIdx);
  const from = i;
  let depth = 0,
    inStr = false,
    q = "";
  for (; i < html.length; i++) {
    const c = html[i];
    if (inStr) {
      if (c === q && html[i - 1] !== "\\") inStr = false;
      continue;
    }
    if (c === "'" || c === '"' || c === "`") {
      inStr = true;
      q = c;
      continue;
    }
    if (c === open) depth++;
    else if (c === close) {
      depth--;
      if (depth === 0) return html.slice(from, i + 1);
    }
  }
  throw new Error("unbalanced from " + startIdx);
}

function obj(marker, open = "{", close = "}") {
  const s = html.indexOf(marker);
  if (s === -1) throw new Error("not found: " + marker);
  return balancedFrom(s, open, close);
}

function fn(name) {
  const s = html.indexOf("function " + name);
  if (s === -1) throw new Error("fn not found: " + name);
  const body = balancedFrom(s, "{", "}");
  const bodyStart = html.indexOf("{", s);
  return html.slice(s, bodyStart) + body;
}

const C = "const C=" + obj("const C={") + ";";
const cityData = "const cityData=" + obj("const cityData={") + ";";
const NAME = "const NAME=" + obj("const NAME={") + ";";
const trainLink = fn("trainLink");
const hotelLink = fn("hotelLink");
const stops = "const stops=" + obj("const stops=[", "[", "]") + ";";
const travellers = "const travellers=" + obj("const travellers=[", "[", "]") + ";";
const railWP = "const railWP=" + obj("const railWP={") + ";";

const mod = `
function svgi(){return '';}
${trainLink}
${hotelLink}
${C}
${cityData}
${NAME}
${stops}
${travellers}
${railWP}
export { C, cityData, NAME, stops, travellers, railWP };
`;

const tmp = path.join(process.cwd(), "scripts/_data.mjs");
fs.writeFileSync(tmp, mod);
const data = await import(pathToFileURL(tmp).href + "?t=" + Date.now());
fs.unlinkSync(tmp);

const banner =
  "// AUTO-GENERATED from china-trip-2026.html by scripts/extract-data.mjs\n" +
  "// Do not edit by hand — re-run the script to regenerate.\n\n";

const body =
  `export const C = ${JSON.stringify(data.C, null, 2)} as const;\n\n` +
  `export const cityData = ${JSON.stringify(data.cityData, null, 2)} as const;\n\n` +
  `export const NAME = ${JSON.stringify(data.NAME, null, 2)} as const;\n\n` +
  `export const railWP = ${JSON.stringify(data.railWP, null, 2)} as const;\n\n` +
  `export const rawStops = ${JSON.stringify(data.stops, null, 2)};\n\n` +
  `export const rawTravellers = ${JSON.stringify(data.travellers, null, 2)};\n`;

fs.writeFileSync(OUT, banner + body);
console.log(`Wrote ${OUT}`);
console.log(
  `stops=${data.stops.length}, travellers=${data.travellers.length}, coords=${Object.keys(data.C).length}`
);
// spot-check that booking URLs survived
const b = data.stops.find((s) => s.booked);
console.log("sample booked.url starts:", b.booked.url.slice(0, 60));
console.log("sample rail book url:", data.stops[2].arrive.book.slice(0, 70));
