// Extracts the base64 `AV` avatar object from the original HTML and writes
// mobile/lib/avatars.ts. Run: node scripts/extract-avatars.mjs
import fs from "node:fs";
import path from "node:path";

const SRC = "/Users/kikiboro/Downloads/china-trip-2026.html";
const OUT = path.join(process.cwd(), "mobile/lib/avatars.ts");

const html = fs.readFileSync(SRC, "utf8");

// Find `const AV={ ... };` (single-line object literal).
const start = html.indexOf("const AV={");
if (start === -1) throw new Error("AV object not found");
// Walk to the matching closing brace.
let i = html.indexOf("{", start);
let depth = 0;
let end = -1;
let inStr = false;
let quote = "";
for (; i < html.length; i++) {
  const c = html[i];
  if (inStr) {
    if (c === quote) inStr = false;
    continue;
  }
  if (c === "'" || c === '"') {
    inStr = true;
    quote = c;
    continue;
  }
  if (c === "{") depth++;
  else if (c === "}") {
    depth--;
    if (depth === 0) {
      end = i;
      break;
    }
  }
}
if (end === -1) throw new Error("Could not find end of AV object");

const objSrc = html.slice(html.indexOf("{", start), end + 1);

// key:'value' pairs. base64 contains no single quotes.
const re = /(\w+)\s*:\s*'([^']*)'/g;
const entries = {};
let m;
while ((m = re.exec(objSrc)) !== null) {
  entries[m[1]] = m[2];
}

const keys = Object.keys(entries);
if (keys.length === 0) throw new Error("No avatar entries parsed");

let out = "// AUTO-GENERATED from china-trip-2026.html by scripts/extract-avatars.mjs\n";
out += "// Base64 data-URI avatars for each traveller.\n\n";
out += "export const AVATARS: Record<string, string> = {\n";
for (const k of keys) {
  out += `  ${k}: ${JSON.stringify(entries[k])},\n`;
}
out += "};\n";

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, out);

console.log(`Wrote ${OUT}`);
console.log(
  `Avatars: ${keys.map((k) => `${k} (${Math.round(entries[k].length / 1024)}KB)`).join(", ")}`
);
