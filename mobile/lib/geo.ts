// Route geometry for the native map: great-circle flight arcs, smoothed rail
// lines and the ferry hop — mirrors the original Leaflet build.
import { STOPS, COORDS, RAIL_WP, LatLng } from "./data";

export type LL = { latitude: number; longitude: number };
const toLL = (p: LatLng): LL => ({ latitude: p[0], longitude: p[1] });

export function greatCircle(a: LatLng, b: LatLng, n = 72): LatLng[] {
  const toR = (d: number) => (d * Math.PI) / 180;
  const toD = (r: number) => (r * 180) / Math.PI;
  const [f1, l1, f2, l2] = [toR(a[0]), toR(a[1]), toR(b[0]), toR(b[1])];
  const x1 = Math.cos(f1) * Math.cos(l1), y1 = Math.cos(f1) * Math.sin(l1), z1 = Math.sin(f1);
  const x2 = Math.cos(f2) * Math.cos(l2), y2 = Math.cos(f2) * Math.sin(l2), z2 = Math.sin(f2);
  const dot = Math.min(1, Math.max(-1, x1 * x2 + y1 * y2 + z1 * z2));
  const O = Math.acos(dot);
  if (O < 1e-6) return [a, b];
  const out: LatLng[] = [];
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    const A = Math.sin((1 - f) * O) / Math.sin(O);
    const B = Math.sin(f * O) / Math.sin(O);
    const x = A * x1 + B * x2, y = A * y1 + B * y2, z = A * z1 + B * z2;
    out.push([toD(Math.atan2(z, Math.hypot(x, y))), toD(Math.atan2(y, x))]);
  }
  return out;
}

export function smooth(pts: LatLng[], seg = 16): LatLng[] {
  if (pts.length < 3) return pts;
  const out: LatLng[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let t = 0; t < seg; t++) {
      const u = t / seg, u2 = u * u, u3 = u2 * u;
      out.push([
        0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * u + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * u3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * u + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3),
      ]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

export interface Route {
  coords: LL[];
  kind: "plane" | "train" | "boat";
}

export function buildRoutes(): Route[] {
  const C = COORDS;
  const routes: Route[] = [];
  const push = (pts: LatLng[], kind: Route["kind"]) => routes.push({ coords: pts.map(toLL), kind });

  push(greatCircle(C.London, C.CDG, 30).concat(greatCircle(C.CDG, C.Beijing, 72)), "plane");
  for (let i = 0; i < STOPS.length - 1; i++) {
    const leg = STOPS[i + 1];
    if (leg.arrive.cls === "rail") push(smooth(RAIL_WP[leg.n]), "train");
    else push(greatCircle(STOPS[i].c, leg.c, 72), "plane");
  }
  push(greatCircle(C.HongKong, C.Macau, 24), "boat");
  push(
    greatCircle(C.HongKong, [20, 98], 36).concat(greatCircle([20, 98], C.CDG, 72), greatCircle(C.CDG, C.London, 30)),
    "plane"
  );
  return routes;
}

// Fewer points for the animated movers (keeps them smooth + light).
export function decimate(coords: LL[], target = 24): LL[] {
  if (coords.length <= target) return coords;
  const step = (coords.length - 1) / (target - 1);
  const out: LL[] = [];
  for (let i = 0; i < target; i++) out.push(coords[Math.round(i * step)]);
  return out;
}
