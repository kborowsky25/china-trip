// Typed trip data + helpers, layered over the auto-generated tripData.ts.
import { rawStops, rawTravellers, C, railWP } from "./tripData";
import { AVATARS } from "./avatars";

export type LatLng = [number, number];

export interface FlightLeg {
  from: string;
  to: string;
  dep: string;
  arr: string;
  date?: string;
  arrPlus?: string;
  code?: string;
  via?: string;
  dur?: string;
}

export interface Traveller {
  id: string;
  name: string;
  av?: string;
  sameAs?: string;
  out?: FlightLeg[];
  ret?: FlightLeg[];
  price?: string;
  bag?: { hand: string; checked: string };
  note?: string;
}

export interface SeeItem {
  name: string;
  title: string;
  note: string;
  q?: string;
}

export interface BookedHotel {
  name: string;
  price: number;
  addr: string;
  cinTxt: string;
  coutTxt: string;
  room: string;
  url: string;
  maps: string;
}

export interface Arrive {
  mode: string;
  ico: string;
  cls: "flight" | "rail";
  dur: string;
  book: string;
}

export interface Stop {
  n: number;
  name: string;
  mapcity: string;
  days: number;
  dates: string;
  c: LatLng;
  cin: string;
  cout: string;
  hero: string;
  ppl: number;
  clim: { hi: number; lo: number; note: string };
  budget: { b: number; m: number; c: number };
  desc: string;
  arrive: Arrive;
  booked?: BookedHotel;
  see: SeeItem[];
}

export const STOPS = rawStops as unknown as Stop[];
export const TRAVELLERS = rawTravellers as unknown as Traveller[];
export const COORDS = C as unknown as Record<string, LatLng>;
export const RAIL_WP = railWP as unknown as Record<string, LatLng[]>;

// Attach avatars (kept separate from tripData to avoid bloating that file).
export function avatarFor(id: string): string | undefined {
  return AVATARS[id];
}

// Chinese names (for the decode-into-English entry animation)
export const CN_NAMES: Record<string, string> = {
  Beijing: "北京",
  Chengdu: "成都",
  Chongqing: "重庆",
  Zhangjiajie: "张家界",
  Shanghai: "上海",
  Taipei: "台北",
  "Hong Kong": "香港",
  "Hong Kong + Macau": "香港",
};

// ---- Trip meta (from the hero) ----
export const TRIP = {
  title: "Xenia in China",
  route:
    "London → Beijing → Chengdu → Chongqing → Zhangjiajie → Shanghai → Taipei → Hong Kong → London",
  days: 24,
  stops: 7,
  departsLabel: "Aug 16",
  departsFrom: "Departs LGW",
  departISO: "2026-08-16T17:00:00+01:00",
};

// ---- Flights ----
export function travLegs(t: Traveller): { out: FlightLeg[]; ret: FlightLeg[] } {
  const base = t.sameAs ? TRAVELLERS.find((x) => x.id === t.sameAs) ?? t : t;
  return { out: base.out ?? [], ret: base.ret ?? [] };
}

export function fr24(code: string): string {
  return (
    "https://www.flightradar24.com/data/flights/" +
    code.replace(/\s+/g, "").toLowerCase()
  );
}

// ---- Links ----
export function mapsQ(q: string): string {
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
}

const HOTEL_FLT: Record<string, string> = {
  budget: "price%3DGBP-0-50-1%3Breview_score%3D80",
  mid: "price%3DGBP-50-100-1%3Breview_score%3D80",
  best: "price%3DGBP-90-180-1%3Breview_score%3D90",
};
export function hotelLink(
  city: string,
  cin: string,
  cout: string,
  tier: "budget" | "mid" | "best"
): string {
  return (
    "https://www.booking.com/searchresults.html?ss=" +
    encodeURIComponent(city) +
    "&checkin=" +
    cin +
    "&checkout=" +
    cout +
    "&order=bayesian_review_score&nflt=" +
    HOTEL_FLT[tier]
  );
}

// ---- Budget ----
export const TRANSPORT_EST = 480; // intercity trains + flights + ferry, GBP
export const ACC_SHARE = 0.4; // share of the daily estimate that is accommodation
export const fxFallback = { CNY: 9.1, HKD: 9.9, TWD: 40 };
export type Tier = "b" | "m" | "c";
export const tierName: Record<Tier, string> = {
  b: "Budget",
  m: "Mid-range",
  c: "Comfort",
};

export interface BudgetRow {
  name: string;
  days: number;
  daily: number;
  acc: number;
  booked: boolean;
  ppl: number;
  accTot: number | null;
  sub: number;
}

export function budgetRows(tier: Tier): BudgetRow[] {
  return STOPS.map((s) => {
    const est = s.budget[tier];
    const accEst = Math.round(est * ACC_SHARE);
    const daily = est - accEst;
    const booked = !!(s.booked && s.booked.price);
    const acc = booked ? Math.round(s.booked!.price / s.ppl) : accEst * s.days;
    return {
      name: s.name,
      days: s.days,
      daily,
      acc,
      booked,
      ppl: s.ppl,
      accTot: booked ? s.booked!.price : null,
      sub: daily * s.days + acc,
    };
  });
}

export function budgetTotal(tier: Tier): number {
  return budgetRows(tier).reduce((a, r) => a + r.sub, 0) + TRANSPORT_EST;
}

// ---- Weather codes (Open-Meteo) ----
export function wcode(c: number): { i: string; t: string } {
  if (c === 0) return { i: "☀️", t: "Clear" };
  if (c <= 3) return { i: "⛅", t: "Partly cloudy" };
  if (c <= 48) return { i: "🌫️", t: "Fog" };
  if (c <= 57) return { i: "🌦️", t: "Drizzle" };
  if (c <= 67) return { i: "🌧️", t: "Rain" };
  if (c <= 77) return { i: "❄️", t: "Snow" };
  if (c <= 82) return { i: "🌦️", t: "Showers" };
  if (c <= 86) return { i: "🌨️", t: "Snow showers" };
  return { i: "⛈️", t: "Thunderstorm" };
}

// ---- Highlight parser: splits desc containing <span class='hl'>…</span> ----
export interface Segment {
  text: string;
  hl: boolean;
}
export function parseHighlights(html: string): Segment[] {
  const segs: Segment[] = [];
  const re = /<span class=['"]hl['"]>(.*?)<\/span>/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    if (m.index > last) segs.push({ text: html.slice(last, m.index), hl: false });
    segs.push({ text: m[1], hl: true });
    last = m.index + m[0].length;
  }
  if (last < html.length) segs.push({ text: html.slice(last), hl: false });
  return segs.map((s) => ({ ...s, text: decodeEntities(s.text) }));
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'");
}
