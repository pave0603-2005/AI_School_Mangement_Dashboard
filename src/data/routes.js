export const MAP_W = 900;
export const MAP_H = 560;
export const SCHOOL = { x: 450, y: 280 };
export const KM_PER_PX = 0.02;
export const SIM_MIN_PER_TICK = 0.5;

const RAW = [
  {
    id: "R1",
    busId: "BUS-1",
    name: "North Ridge Route",
    color: "#6366f1",
    driver: "Mohan Lal",
    plate: "MH 12 AB 1021",
    capacity: 40,
    baseSpeed: 42,
    points: [[50, 60], [200, 55], [260, 120], [330, 150], [400, 150], [420, 215], [450, 280]],
    stops: [
      { name: "Maple Court", at: 0.12 },
      { name: "Lakeview Park", at: 0.35 },
      { name: "Central Market", at: 0.6 },
      { name: "Green Avenue", at: 0.82 },
    ],
    zones: [{ from: 0.44, to: 0.56 }],
  },
  {
    id: "R2",
    busId: "BUS-2",
    name: "East Harbor Route",
    color: "#f97316",
    driver: "Dinesh Pawar",
    plate: "MH 12 CD 3345",
    capacity: 36,
    baseSpeed: 38,
    points: [[860, 90], [780, 80], [720, 150], [690, 210], [610, 235], [540, 220], [500, 260], [450, 280]],
    stops: [
      { name: "Harbor Gate", at: 0.1 },
      { name: "Station Road", at: 0.38 },
      { name: "Oak Residency", at: 0.64 },
      { name: "City Library", at: 0.86 },
    ],
    zones: [{ from: 0.28, to: 0.45 }],
  },
  {
    id: "R3",
    busId: "BUS-3",
    name: "South Valley Route",
    color: "#10b981",
    driver: "Iqbal Sheikh",
    plate: "MH 12 EF 7788",
    capacity: 44,
    baseSpeed: 40,
    points: [[70, 500], [160, 470], [220, 420], [310, 400], [350, 340], [420, 330], [450, 280]],
    stops: [
      { name: "Riverside Colony", at: 0.14 },
      { name: "Temple Square", at: 0.4 },
      { name: "Hilltop Society", at: 0.66 },
      { name: "Cedar Lane", at: 0.88 },
    ],
    zones: [{ from: 0.6, to: 0.74 }],
  },
];

function prepare(route) {
  const cum = [0];
  for (let i = 1; i < route.points.length; i++) {
    const [x1, y1] = route.points[i - 1];
    const [x2, y2] = route.points[i];
    cum.push(cum[i - 1] + Math.hypot(x2 - x1, y2 - y1));
  }
  return { ...route, cum, length: cum[cum.length - 1] };
}

export const ROUTES = RAW.map(prepare);

export function routeById(id) {
  return ROUTES.find((r) => r.id === id) || ROUTES[0];
}

export function pointAt(route, d) {
  const dist = Math.max(0, Math.min(route.length, d));
  for (let i = 1; i < route.cum.length; i++) {
    if (dist <= route.cum[i]) {
      const seg = route.cum[i] - route.cum[i - 1] || 1;
      const t = (dist - route.cum[i - 1]) / seg;
      const [x1, y1] = route.points[i - 1];
      const [x2, y2] = route.points[i];
      return { x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t };
    }
  }
  const last = route.points[route.points.length - 1];
  return { x: last[0], y: last[1] };
}

/** Returns an SVG points string for the part of the route between two fractions. */
export function sliceRoute(route, f1, f2) {
  const pts = [];
  const steps = 14;
  for (let i = 0; i <= steps; i++) {
    const p = pointAt(route, route.length * (f1 + ((f2 - f1) * i) / steps));
    pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
  }
  return pts.join(" ");
}

export function pathString(route) {
  return route.points.map((p) => p.join(",")).join(" ");
}
