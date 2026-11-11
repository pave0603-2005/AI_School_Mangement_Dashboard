import { useCallback, useEffect, useState } from "react";
import { ROUTES, routeById, pointAt, KM_PER_PX, SIM_MIN_PER_TICK } from "../data/routes.js";

function initBus(route, startFrac = 0) {
  const dist = route.length * startFrac;
  const passed = route.stops.filter((s) => s.at <= startFrac);
  return {
    id: route.busId,
    routeId: route.id,
    dist,
    speed: startFrac > 0 ? route.baseSpeed : 0,
    delay: 0,
    onboard: passed.length * 5,
    stopsPassed: passed.length,
    lastStop: passed.length ? passed[passed.length - 1].name : "Depot",
    status: "On route",
    jamTicks: 0,
    dwell: 0,
  };
}

function initialBuses() {
  const offsets = [0.1, 0.3, 0.52];
  return ROUTES.map((r, i) => initBus(r, offsets[i % offsets.length]));
}

function stepBus(b) {
  const r = routeById(b.routeId);

  if (b.status === "Arrived") {
    if (b.dwell > 0) return { ...b, dwell: b.dwell - 1, speed: 0 };
    return initBus(r, 0);
  }

  const frac = b.dist / r.length;
  const inZone = r.zones.some((z) => frac >= z.from && frac <= z.to);
  const jammed = b.jamTicks > 0;
  const factor = jammed ? 0.22 : inZone ? 0.5 : 1;
  const target = r.baseSpeed * factor * (0.92 + Math.random() * 0.16);
  const speed = b.speed + (target - b.speed) * 0.55;
  const dist = Math.min(r.length, b.dist + (speed / 60 * SIM_MIN_PER_TICK) / KM_PER_PX);
  const delay = b.delay + SIM_MIN_PER_TICK * Math.max(0, 1 - speed / r.baseSpeed);
  const newFrac = dist / r.length;
  const passed = r.stops.filter((s) => s.at <= newFrac);

  let next = {
    ...b,
    dist,
    speed,
    delay,
    jamTicks: Math.max(0, b.jamTicks - 1),
    status: jammed || inZone ? "Heavy traffic" : "On route",
  };

  if (passed.length > b.stopsPassed) {
    next = {
      ...next,
      stopsPassed: passed.length,
      lastStop: passed[passed.length - 1].name,
      onboard: Math.min(r.capacity, b.onboard + 3 + Math.floor(Math.random() * 4)),
      status: "Boarding",
    };
  }

  if (dist >= r.length) {
    next = { ...next, status: "Arrived", speed: 0, dwell: 6, lastStop: "School" };
  }
  return next;
}

/** Adds derived values (position, ETA, next stop...) to a raw bus state. */
export function describeBus(b) {
  const r = routeById(b.routeId);
  const frac = b.dist / r.length;
  const pos = pointAt(r, b.dist);
  const nextStop = r.stops.find((s) => s.at > frac);
  const remainingKm = ((r.length - b.dist) * KM_PER_PX);
  const etaMin = b.status === "Arrived" ? 0 : (remainingKm / Math.max(b.speed, 8)) * 60;
  const nextStopKm = nextStop ? (nextStop.at * r.length - b.dist) * KM_PER_PX : 0;
  return {
    ...b,
    route: r,
    frac,
    pos,
    nextStop: nextStop ? nextStop.name : "School",
    nextStopEta: nextStop ? (nextStopKm / Math.max(b.speed, 8)) * 60 : 0,
    remainingKm,
    etaMin,
    totalKm: r.length * KM_PER_PX,
  };
}

export default function useBusSim() {
  const [raw, setRaw] = useState(initialBuses);

  useEffect(() => {
    const t = setInterval(() => setRaw((prev) => prev.map(stepBus)), 1000);
    return () => clearInterval(t);
  }, []);

  const triggerJam = useCallback((busId) => {
    setRaw((prev) => prev.map((b) => (b.id === busId && b.status !== "Arrived" ? { ...b, jamTicks: 14 } : b)));
  }, []);

  const clearJam = useCallback((busId) => {
    setRaw((prev) => prev.map((b) => (b.id === busId ? { ...b, jamTicks: 0 } : b)));
  }, []);

  const reset = useCallback(() => setRaw(initialBuses()), []);

  return { buses: raw.map(describeBus), triggerJam, clearJam, reset };
}
