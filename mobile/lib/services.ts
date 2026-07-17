// Live-data fetch helpers, ported from the web app: weather (Open-Meteo),
// Wikipedia thumbnails, and FX rates. All free, no API key. Each degrades
// gracefully when offline.
import { fxFallback } from "./data";

// ---- Weather (Open-Meteo) ----
export interface CurrentWx {
  t: number;
  code: number;
  rh: number;
  wind: number;
}
const wxCache: Record<string, CurrentWx | null> = {};

export async function fetchWx(lat: number, lng: number): Promise<CurrentWx | null> {
  const key = lat + "," + lng;
  if (wxCache[key] !== undefined) return wxCache[key];
  try {
    const r = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=" +
        lat +
        "&longitude=" +
        lng +
        "&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m"
    );
    if (!r.ok) throw new Error("bad status");
    const j = await r.json();
    const d: CurrentWx | null = j && j.current
      ? {
          t: Math.round(j.current.temperature_2m),
          code: j.current.weather_code,
          rh: j.current.relative_humidity_2m,
          wind: Math.round(j.current.wind_speed_10m),
        }
      : null;
    wxCache[key] = d;
    return d;
  } catch {
    wxCache[key] = null;
    return null;
  }
}

// ---- Wikipedia thumbnail ----
const wikiCache: Record<string, string | null> = {};

export async function loadWiki(title: string): Promise<string | null> {
  if (wikiCache[title] !== undefined) return wikiCache[title];
  try {
    const r = await fetch(
      "https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(title)
    );
    if (!r.ok) throw new Error("bad status");
    const j = await r.json();
    const s =
      j && j.thumbnail && j.thumbnail.source
        ? j.thumbnail.source.replace(/\/\d+px-/, "/640px-")
        : null;
    wikiCache[title] = s;
    return s;
  } catch {
    wikiCache[title] = null;
    return null;
  }
}

// A deterministic fallback image (used when Wikipedia has nothing).
export function fallbackImage(title: string, city: string, lock: number, w = 640, h = 430): string {
  return (
    "https://loremflickr.com/" +
    w +
    "/" +
    h +
    "/" +
    encodeURIComponent(title + "," + city) +
    "?lock=" +
    lock
  );
}

// ---- FX rates (GBP base) ----
export interface FxRates {
  CNY: number;
  HKD: number;
  TWD: number;
  live: boolean;
}
let fxRates: FxRates | null = null;

export async function loadFx(): Promise<FxRates> {
  if (fxRates) return fxRates;
  try {
    const r = await fetch("https://open.er-api.com/v6/latest/GBP");
    if (!r.ok) throw new Error("bad status");
    const j = await r.json();
    fxRates = j && j.rates
      ? { CNY: j.rates.CNY, HKD: j.rates.HKD, TWD: j.rates.TWD, live: true }
      : { ...fxFallback, live: false };
  } catch {
    fxRates = { ...fxFallback, live: false };
  }
  return fxRates;
}
