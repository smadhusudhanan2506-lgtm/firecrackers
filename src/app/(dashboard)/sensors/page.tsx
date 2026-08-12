"use client";

import { useEffect, useState } from "react";
import { useSystem } from "@/context/RealtimeProvider";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  Radio,
  Wifi,
  WifiOff,
  MapPin,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import type { SensorReading } from "@/lib/types";

export default function SensorsPage() {
  const { sensors, isEmergency } = useSystem();
  const [readings, setReadings] = useState<SensorReading[]>([
    {
      id: "rdg-initial",
      sensor_id: "SMOKE-MIX-01",
      smoke_detected: isEmergency,
      value: isEmergency ? 1 : 0,
      timestamp: new Date().toISOString(),
    },
  ]);

  const smokeSensor = sensors.find((s) => s.sensor_id === "SMOKE-MIX-01");

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    try {
      const supabase = createClient();
      async function fetchReadings() {
        const { data } = await supabase
          .from("sensor_readings")
          .select("*")
          .eq("sensor_id", "SMOKE-MIX-01")
          .order("timestamp", { ascending: false })
          .limit(20);
        if (data && data.length > 0) setReadings(data);
      }
      fetchReadings();

      const channel = supabase
        .channel("sensor-readings")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "sensor_readings",
          },
          () => fetchReadings()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      // Ignore
    }
  }, []);

  const isDetected = smokeSensor?.status === "smoke_detected" || isEmergency;
  const isOffline = smokeSensor?.status === "offline";
  const lastSeen = smokeSensor?.last_seen
    ? new Date(smokeSensor.last_seen).toLocaleString("en-IN")
    : "Just now";

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Sensors</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Connected sensor monitoring and diagnostics
        </p>
      </div>

      {/* Sensor card */}
      <div
        className={`border rounded-2xl p-6 transition-all duration-500 ${
          isDetected
            ? "bg-red-500/5 border-red-500/20 animate-danger-glow"
            : "bg-card border-border"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          {/* Sensor info */}
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                isDetected
                  ? "bg-red-500/10"
                  : isOffline
                    ? "bg-amber-500/10"
                    : "bg-green-500/10"
              }`}
            >
              <Radio
                className={`w-7 h-7 ${
                  isDetected
                    ? "text-red-500 animate-emergency-pulse"
                    : isOffline
                      ? "text-amber-500"
                      : "text-green-500"
                }`}
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Smoke Sensor</h2>
              <p className="text-sm text-muted-foreground font-mono">
                SMOKE-MIX-01
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Mixing Area
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Type: MQ-2 Smoke
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status badge */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shrink-0 ${
              isDetected
                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                : isOffline
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "bg-green-500/10 text-green-400 border border-green-500/20"
            }`}
          >
            {isDetected ? (
              <>
                <AlertTriangle className="w-4 h-4" />
                SMOKE DETECTED
              </>
            ) : isOffline ? (
              <>
                <WifiOff className="w-4 h-4" />
                OFFLINE
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                NORMAL
              </>
            )}
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/50">
          <InfoItem
            icon={<Activity className="w-4 h-4" />}
            label="Current Status"
            value={isDetected ? "Smoke Detected" : isOffline ? "Offline" : "Normal"}
            highlight={isDetected}
          />
          <InfoItem
            icon={<Clock className="w-4 h-4" />}
            label="Last Update"
            value={lastSeen}
          />
          <InfoItem
            icon={
              smokeSensor?.status !== "offline" ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-amber-500" />
              )
            }
            label="Connection"
            value={smokeSensor?.status !== "offline" ? "Connected" : "Disconnected"}
          />
          <InfoItem
            icon={<Radio className="w-4 h-4" />}
            label="Total Readings"
            value={`${readings.length}`}
          />
        </div>
      </div>

      {/* Hardware status */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Hardware Connection Status
        </h3>
        <div className="space-y-3">
          <ConnectionRow
            label="ESP32 Controller"
            status={!isOffline}
            detail="Microcontroller"
          />
          <ConnectionRow
            label="MQ-2 Smoke Sensor"
            status={!isOffline}
            detail="Analog smoke detector"
          />
          <div className="flex items-center justify-between py-2 border-t border-border/50">
            <span className="text-sm text-muted-foreground">
              Last Communication
            </span>
            <span className="text-sm font-medium text-foreground font-mono">
              {smokeSensor?.last_seen
                ? getTimeDiff(smokeSensor.last_seen)
                : "Just now"}
            </span>
          </div>
        </div>
      </div>

      {/* Recent readings */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Recent Sensor Readings
        </h3>
        {readings.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No sensor readings yet. Use the Simulate Fire button on the
            Dashboard to generate readings.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">
                    Timestamp
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">
                    Sensor ID
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">
                    Smoke
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {readings.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-xs text-muted-foreground font-mono">
                      {new Date(r.timestamp).toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5 px-3 text-xs font-mono text-foreground">
                      {r.sensor_id}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${
                          r.smoke_detected
                            ? "bg-red-500/10 text-red-400"
                            : "bg-green-500/10 text-green-400"
                        }`}
                      >
                        {r.smoke_detected ? "Detected" : "Clear"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-xs font-mono text-muted-foreground">
                      {r.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p
        className={`text-sm font-semibold ${highlight ? "text-red-400" : "text-foreground"}`}
      >
        {value}
      </p>
    </div>
  );
}

function ConnectionRow({
  label,
  status,
  detail,
}: {
  label: string;
  status: boolean;
  detail: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <div>
        <p className="text-sm text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${status ? "bg-green-500" : "bg-amber-500"}`}
        />
        <span
          className={`text-xs font-semibold uppercase ${
            status ? "text-green-400" : "text-amber-400"
          }`}
        >
          {status ? "Online" : "Offline"}
        </span>
      </div>
    </div>
  );
}

function getTimeDiff(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
