// China Trip sync backend — Fastify + SQLite. Stores per-stop shared notes and
// reels for the whole group. No auth (small private trip); a fixed trip id
// namespaces the data. Single-instance SQLite, same shape as the Nora server.
import Fastify from "fastify";
import cors from "@fastify/cors";
import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const PORT = Number(process.env.PORT || 4000);
const HOST = process.env.HOST || "0.0.0.0";
const DB_PATH = process.env.CT_DB_PATH || "./china-trip.db";

mkdirSync(dirname(DB_PATH) || ".", { recursive: true });
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    trip TEXT NOT NULL,
    stop INTEGER NOT NULL,
    text TEXT NOT NULL DEFAULT '',
    updatedAt INTEGER NOT NULL DEFAULT 0,
    by TEXT NOT NULL DEFAULT '',
    PRIMARY KEY (trip, stop)
  );
  CREATE TABLE IF NOT EXISTS reels (
    id TEXT PRIMARY KEY,
    trip TEXT NOT NULL,
    stop INTEGER NOT NULL,
    url TEXT NOT NULL,
    label TEXT NOT NULL DEFAULT '',
    by TEXT NOT NULL DEFAULT '',
    at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS reels_by_stop ON reels (trip, stop, at);
  CREATE TABLE IF NOT EXISTS places (
    id TEXT PRIMARY KEY,
    trip TEXT NOT NULL,
    stop INTEGER NOT NULL,
    kind TEXT NOT NULL DEFAULT 'hotel',
    name TEXT NOT NULL,
    url TEXT NOT NULL DEFAULT '',
    note TEXT NOT NULL DEFAULT '',
    addr TEXT NOT NULL DEFAULT '',
    cin TEXT NOT NULL DEFAULT '',
    cout TEXT NOT NULL DEFAULT '',
    room TEXT NOT NULL DEFAULT '',
    by TEXT NOT NULL DEFAULT '',
    at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS places_by_stop ON places (trip, stop, at);
`);
// migrate older place rows to the richer schema
for (const col of ["addr", "cin", "cout", "room"]) {
  try {
    db.exec(`ALTER TABLE places ADD COLUMN ${col} TEXT NOT NULL DEFAULT ''`);
  } catch {
    // column already exists
  }
}

const q = {
  getNote: db.prepare("SELECT text, updatedAt, by FROM notes WHERE trip = ? AND stop = ?"),
  upsertNote: db.prepare(`
    INSERT INTO notes (trip, stop, text, updatedAt, by) VALUES (@trip, @stop, @text, @updatedAt, @by)
    ON CONFLICT(trip, stop) DO UPDATE SET text = @text, updatedAt = @updatedAt, by = @by
    WHERE @updatedAt >= notes.updatedAt
  `),
  listReels: db.prepare("SELECT id, url, label, by, at FROM reels WHERE trip = ? AND stop = ? ORDER BY at ASC"),
  insertReel: db.prepare("INSERT INTO reels (id, trip, stop, url, label, by, at) VALUES (?, ?, ?, ?, ?, ?, ?)"),
  deleteReel: db.prepare("DELETE FROM reels WHERE trip = ? AND stop = ? AND id = ?"),
  listPlaces: db.prepare("SELECT id, kind, name, url, note, addr, cin, cout, room, by, at FROM places WHERE trip = ? AND stop = ? ORDER BY at ASC"),
  insertPlace: db.prepare("INSERT INTO places (id, trip, stop, kind, name, url, note, addr, cin, cout, room, by, at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"),
  deletePlace: db.prepare("DELETE FROM places WHERE trip = ? AND stop = ? AND id = ?"),
};

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

app.get("/health", async () => ({ ok: true, service: "china-trip-sync" }));

// ---- Notes ----
app.get<{ Params: { trip: string; stop: string } }>(
  "/trip/:trip/notes/:stop",
  async (req) => {
    const { trip, stop } = req.params;
    const row = q.getNote.get(trip, Number(stop)) as
      | { text: string; updatedAt: number; by: string }
      | undefined;
    return row ?? { text: "", updatedAt: 0, by: "" };
  }
);

app.put<{
  Params: { trip: string; stop: string };
  Body: { text?: string; updatedAt?: number; by?: string };
}>("/trip/:trip/notes/:stop", async (req) => {
  const { trip, stop } = req.params;
  const text = String(req.body?.text ?? "");
  const updatedAt = Number(req.body?.updatedAt ?? Date.now());
  const by = String(req.body?.by ?? "");
  q.upsertNote.run({ trip, stop: Number(stop), text, updatedAt, by });
  const row = q.getNote.get(trip, Number(stop));
  return row ?? { text, updatedAt, by };
});

// ---- Reels ----
app.get<{ Params: { trip: string; stop: string } }>(
  "/trip/:trip/reels/:stop",
  async (req) => {
    const { trip, stop } = req.params;
    return q.listReels.all(trip, Number(stop));
  }
);

app.post<{
  Params: { trip: string; stop: string };
  Body: { url?: string; label?: string; by?: string };
}>("/trip/:trip/reels/:stop", async (req, reply) => {
  const { trip, stop } = req.params;
  const url = String(req.body?.url ?? "").trim();
  if (!url) {
    reply.code(400);
    return { error: "url required" };
  }
  q.insertReel.run(
    randomUUID(),
    trip,
    Number(stop),
    url,
    String(req.body?.label ?? ""),
    String(req.body?.by ?? ""),
    Date.now()
  );
  return q.listReels.all(trip, Number(stop));
});

app.delete<{ Params: { trip: string; stop: string; id: string } }>(
  "/trip/:trip/reels/:stop/:id",
  async (req) => {
    const { trip, stop, id } = req.params;
    q.deleteReel.run(trip, Number(stop), id);
    return q.listReels.all(trip, Number(stop));
  }
);

// ---- Places (user-added hotels / spots) ----
app.get<{ Params: { trip: string; stop: string } }>(
  "/trip/:trip/places/:stop",
  async (req) => {
    const { trip, stop } = req.params;
    return q.listPlaces.all(trip, Number(stop));
  }
);

app.post<{
  Params: { trip: string; stop: string };
  Body: {
    kind?: string;
    name?: string;
    url?: string;
    note?: string;
    addr?: string;
    cin?: string;
    cout?: string;
    room?: string;
    by?: string;
  };
}>("/trip/:trip/places/:stop", async (req, reply) => {
  const { trip, stop } = req.params;
  const b = req.body ?? {};
  const name = String(b.name ?? "").trim();
  if (!name) {
    reply.code(400);
    return { error: "name required" };
  }
  q.insertPlace.run(
    randomUUID(),
    trip,
    Number(stop),
    String(b.kind ?? "hotel"),
    name,
    String(b.url ?? ""),
    String(b.note ?? ""),
    String(b.addr ?? ""),
    String(b.cin ?? ""),
    String(b.cout ?? ""),
    String(b.room ?? ""),
    String(b.by ?? ""),
    Date.now()
  );
  return q.listPlaces.all(trip, Number(stop));
});

app.delete<{ Params: { trip: string; stop: string; id: string } }>(
  "/trip/:trip/places/:stop/:id",
  async (req) => {
    const { trip, stop, id } = req.params;
    q.deletePlace.run(trip, Number(stop), id);
    return q.listPlaces.all(trip, Number(stop));
  }
);

app
  .listen({ port: PORT, host: HOST })
  .then(() => app.log.info(`china-trip-sync listening on ${HOST}:${PORT}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
