// Notes + Reels sync client. Talks to the Fastify backend and mirrors every
// value into AsyncStorage so the app keeps working offline (important in China)
// and shows instantly on open. Writes are optimistic: local first, network
// best-effort; the server returns the authoritative list which we then cache.
import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE || "https://china-trip-sync.fly.dev";
const TRIP = "china2026";

export interface NoteDoc {
  text: string;
  updatedAt: number;
  by: string;
}
export interface Reel {
  id: string;
  url: string;
  label?: string;
  by?: string;
  at: number;
}

const noteKey = (n: number | string) => `ct.note.${n}`;
const reelKey = (n: number | string) => `ct.reels.${n}`;

async function cacheGet<T>(k: string, d: T): Promise<T> {
  try {
    const v = await AsyncStorage.getItem(k);
    return v === null ? d : (JSON.parse(v) as T);
  } catch {
    return d;
  }
}
async function cacheSet(k: string, v: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(k, JSON.stringify(v));
  } catch {
    // ignore quota / serialization errors
  }
}

function url(path: string): string {
  return `${API_BASE}/trip/${TRIP}${path}`;
}

async function timedFetch(input: string, init?: RequestInit, ms = 6000): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(input, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

// ---- Notes ----
export async function getNote(stopId: number): Promise<NoteDoc> {
  const local = await cacheGet<NoteDoc>(noteKey(stopId), { text: "", updatedAt: 0, by: "" });
  try {
    const r = await timedFetch(url(`/notes/${stopId}`));
    if (r.ok) {
      const server = (await r.json()) as NoteDoc;
      if ((server?.updatedAt || 0) >= local.updatedAt) {
        await cacheSet(noteKey(stopId), server);
        return server;
      }
    }
  } catch {
    // offline — use local
  }
  return local;
}

export async function saveNote(stopId: number, text: string, by: string): Promise<NoteDoc> {
  const doc: NoteDoc = { text, updatedAt: Date.now(), by };
  await cacheSet(noteKey(stopId), doc);
  try {
    await timedFetch(url(`/notes/${stopId}`), {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(doc),
    });
  } catch {
    // stays cached; will push on next successful save
  }
  return doc;
}

// ---- Reels ----
export async function getReels(stopId: number): Promise<Reel[]> {
  const local = await cacheGet<Reel[]>(reelKey(stopId), []);
  try {
    const r = await timedFetch(url(`/reels/${stopId}`));
    if (r.ok) {
      const server = (await r.json()) as Reel[];
      await cacheSet(reelKey(stopId), server);
      return server;
    }
  } catch {
    // offline — use local
  }
  return local;
}

export async function addReel(
  stopId: number,
  reelUrl: string,
  label: string,
  by: string
): Promise<Reel[]> {
  const local = await cacheGet<Reel[]>(reelKey(stopId), []);
  const optimistic: Reel[] = [
    ...local,
    { id: "local-" + Date.now(), url: reelUrl, label, by, at: Date.now() },
  ];
  await cacheSet(reelKey(stopId), optimistic);
  try {
    const r = await timedFetch(url(`/reels/${stopId}`), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: reelUrl, label, by }),
    });
    if (r.ok) {
      const server = (await r.json()) as Reel[];
      await cacheSet(reelKey(stopId), server);
      return server;
    }
  } catch {
    // keep optimistic
  }
  return optimistic;
}

export async function deleteReel(stopId: number, reelId: string): Promise<Reel[]> {
  const local = await cacheGet<Reel[]>(reelKey(stopId), []);
  const optimistic = local.filter((r) => r.id !== reelId);
  await cacheSet(reelKey(stopId), optimistic);
  try {
    const r = await timedFetch(url(`/reels/${stopId}/${reelId}`), { method: "DELETE" });
    if (r.ok) {
      const server = (await r.json()) as Reel[];
      if (Array.isArray(server)) {
        await cacheSet(reelKey(stopId), server);
        return server;
      }
    }
  } catch {
    // keep optimistic
  }
  return optimistic;
}

// ---- Places (user-added hotels / spots) ----
export interface Place {
  id: string;
  kind: "hotel" | "spot";
  name: string;
  url?: string;
  note?: string;
  addr?: string;
  cin?: string;
  cout?: string;
  room?: string;
  by?: string;
  at: number;
}
export type NewPlace = Omit<Place, "id" | "at">;

const placeKey = (n: number | string) => `ct.places.${n}`;

export async function getPlaces(stopId: number): Promise<Place[]> {
  const local = await cacheGet<Place[]>(placeKey(stopId), []);
  try {
    const r = await timedFetch(url(`/places/${stopId}`));
    if (r.ok) {
      const server = (await r.json()) as Place[];
      await cacheSet(placeKey(stopId), server);
      return server;
    }
  } catch {
    // offline
  }
  return local;
}

export async function addPlace(stopId: number, place: NewPlace): Promise<Place[]> {
  const local = await cacheGet<Place[]>(placeKey(stopId), []);
  const optimistic: Place[] = [...local, { id: "local-" + Date.now(), at: Date.now(), ...place }];
  await cacheSet(placeKey(stopId), optimistic);
  try {
    const r = await timedFetch(url(`/places/${stopId}`), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(place),
    });
    if (r.ok) {
      const server = (await r.json()) as Place[];
      await cacheSet(placeKey(stopId), server);
      return server;
    }
  } catch {
    // keep optimistic
  }
  return optimistic;
}

export async function deletePlace(stopId: number, placeId: string): Promise<Place[]> {
  const local = await cacheGet<Place[]>(placeKey(stopId), []);
  const optimistic = local.filter((p) => p.id !== placeId);
  await cacheSet(placeKey(stopId), optimistic);
  try {
    const r = await timedFetch(url(`/places/${stopId}/${placeId}`), { method: "DELETE" });
    if (r.ok) {
      const server = (await r.json()) as Place[];
      if (Array.isArray(server)) {
        await cacheSet(placeKey(stopId), server);
        return server;
      }
    }
  } catch {
    // keep optimistic
  }
  return optimistic;
}

// ---- Reel platform detection (from the web app) ----
export interface ReelInfo {
  platform: "YouTube" | "Instagram" | "TikTok" | "Link";
  thumb: string | null;
}
export function reelInfo(u: string): ReelInfo {
  const yt = u.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  if (yt) return { platform: "YouTube", thumb: "https://img.youtube.com/vi/" + yt[1] + "/hqdefault.jpg" };
  if (/instagram\.com/.test(u)) return { platform: "Instagram", thumb: null };
  if (/tiktok\.com/.test(u)) return { platform: "TikTok", thumb: null };
  return { platform: "Link", thumb: null };
}
