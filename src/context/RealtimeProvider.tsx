"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Zone, FireEvent, Alert, Sensor } from "@/lib/types";

const INITIAL_ZONES: Zone[] = [
  {
    id: "mixing-area",
    name: "Mixing Area",
    status: "safe",
    map_position: { x: 315, y: 75, width: 370, height: 130 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "pressing-rolling",
    name: "Pressing / Rolling Area",
    status: "safe",
    map_position: { x: 315, y: 215, width: 370, height: 125 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "raw-material-storage",
    name: "Raw Material Storage",
    status: "safe",
    map_position: { x: 90, y: 75, width: 195, height: 125 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "chemical-storage",
    name: "Chemical Storage",
    status: "safe",
    map_position: { x: 90, y: 210, width: 195, height: 130 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "drying-area",
    name: "Drying Area",
    status: "safe",
    map_position: { x: 715, y: 75, width: 195, height: 265 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "packing-area",
    name: "Packing Area",
    status: "safe",
    map_position: { x: 90, y: 415, width: 195, height: 115 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "finished-goods",
    name: "Finished Goods Storage",
    status: "safe",
    map_position: { x: 90, y: 540, width: 195, height: 120 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "quality-check",
    name: "Quality Check Area",
    status: "safe",
    map_position: { x: 315, y: 415, width: 180, height: 245 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "admin-control",
    name: "Admin / Control Room",
    status: "safe",
    map_position: { x: 505, y: 415, width: 180, height: 245 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fusing-area",
    name: "Fusing Area",
    status: "safe",
    map_position: { x: 715, y: 415, width: 195, height: 115 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "testing-area",
    name: "Testing Area",
    status: "safe",
    map_position: { x: 715, y: 540, width: 195, height: 120 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_SENSORS: Sensor[] = [
  {
    id: "sensor-smoke-mix-01",
    sensor_id: "SMOKE-MIX-01",
    type: "smoke",
    zone_id: "mixing-area",
    status: "normal",
    last_seen: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
];

interface SystemState {
  zones: Zone[];
  activeFireEvents: FireEvent[];
  activeAlerts: Alert[];
  sensors: Sensor[];
  isEmergency: boolean;
  loading: boolean;
  refreshData: () => Promise<void>;
  simulateLocalFire: () => void;
  resolveLocalEmergency: () => void;
}

const SystemContext = createContext<SystemState>({
  zones: INITIAL_ZONES,
  activeFireEvents: [],
  activeAlerts: [],
  sensors: INITIAL_SENSORS,
  isEmergency: false,
  loading: false,
  refreshData: async () => {},
  simulateLocalFire: () => {},
  resolveLocalEmergency: () => {},
});

export function useSystem() {
  return useContext(SystemContext);
}

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [zones, setZones] = useState<Zone[]>(INITIAL_ZONES);
  const [activeFireEvents, setActiveFireEvents] = useState<FireEvent[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>(INITIAL_SENSORS);
  const [loading, setLoading] = useState(false);

  const simulateLocalFire = useCallback(() => {
    const now = new Date().toISOString();
    setZones((prev) =>
      prev.map((z) => {
        // Red zone: Active fire
        if (z.id === "mixing-area") {
          return { ...z, status: "danger", updated_at: now };
        }
        // Orange zones: All surrounding rooms around the fire
        if (
          z.id === "pressing-rolling" ||
          z.id === "raw-material-storage" ||
          z.id === "chemical-storage" ||
          z.id === "drying-area"
        ) {
          return { ...z, status: "caution", updated_at: now };
        }
        return { ...z, status: "safe", updated_at: now };
      })
    );
    setSensors((prev) =>
      prev.map((s) =>
        s.sensor_id === "SMOKE-MIX-01"
          ? { ...s, status: "smoke_detected", last_seen: now }
          : s
      )
    );
    const newEvent: FireEvent = {
      id: `evt-${Date.now()}`,
      zone_id: "mixing-area",
      event_type: "smoke_detected",
      severity: "critical",
      status: "active",
      detected_at: now,
      resolved_at: null,
      zones: INITIAL_ZONES[0],
    };
    setActiveFireEvents([newEvent]);
    setActiveAlerts([
      {
        id: `alt-${Date.now()}`,
        fire_event_id: newEvent.id,
        message:
          "Fire in Mixing Area (RED)! All surrounding rooms (Raw Material, Chemical, Pressing, Drying) and adjacent paths are in ORANGE (Fire Spread Risk). Evacuate immediately via safe green corridors.",
        severity: "critical",
        acknowledged: false,
        created_at: now,
        fire_events: newEvent,
      },
    ]);
  }, []);

  const resolveLocalEmergency = useCallback(() => {
    const now = new Date().toISOString();
    setZones((prev) =>
      prev.map((z) => ({
        ...z,
        status: "safe",
        updated_at: now,
      }))
    );
    setSensors((prev) =>
      prev.map((s) =>
        s.sensor_id === "SMOKE-MIX-01"
          ? { ...s, status: "normal", last_seen: now }
          : s
      )
    );
    setActiveFireEvents([]);
    setActiveAlerts([]);
  }, []);

  const fetchData = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      return;
    }

    try {
      const supabase = createClient();
      const [zonesRes, eventsRes, alertsRes, sensorsRes] = await Promise.all([
        supabase.from("zones").select("*"),
        supabase
          .from("fire_events")
          .select("*, zones(*)")
          .eq("status", "active")
          .order("detected_at", { ascending: false }),
        supabase
          .from("alerts")
          .select("*, fire_events(*)")
          .eq("acknowledged", false)
          .order("created_at", { ascending: false }),
        supabase.from("sensors").select("*"),
      ]);

      if (zonesRes.data && zonesRes.data.length > 0) setZones(zonesRes.data);
      if (eventsRes.data) setActiveFireEvents(eventsRes.data);
      if (alertsRes.data) setActiveAlerts(alertsRes.data);
      if (sensorsRes.data && sensorsRes.data.length > 0)
        setSensors(sensorsRes.data);
    } catch (err) {
      console.warn("Could not fetch Supabase data, using local state fallback:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    if (!isSupabaseConfigured()) return;

    try {
      const supabase = createClient();
      const channel = supabase
        .channel("system-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "zones" },
          () => fetchData()
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "fire_events" },
          () => fetchData()
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "alerts" },
          () => fetchData()
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "sensors" },
          () => fetchData()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      // Ignore if offline
    }
  }, [fetchData]);

  const isEmergency =
    activeFireEvents.length > 0 || zones.some((z) => z.status === "danger");

  return (
    <SystemContext.Provider
      value={{
        zones,
        activeFireEvents,
        activeAlerts,
        sensors,
        isEmergency,
        loading,
        refreshData: fetchData,
        simulateLocalFire,
        resolveLocalEmergency,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
}
