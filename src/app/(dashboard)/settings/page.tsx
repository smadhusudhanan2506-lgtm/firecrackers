"use client";

import { useSystem } from "@/context/RealtimeProvider";
import {
  Settings as SettingsIcon,
  MapPin,
  Radio,
  Shield,
  Bell,
  Database,
} from "lucide-react";

export default function SettingsPage() {
  const { zones, sensors } = useSystem();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          System configuration and preferences
        </p>
      </div>

      {/* Zone Configuration */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Zone Configuration
          </h3>
        </div>
        <div className="space-y-3">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className="flex items-center justify-between py-3 px-4 rounded-xl border border-border/50 bg-muted/20"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {zone.name}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {zone.id}
                </p>
              </div>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                  zone.status === "safe"
                    ? "bg-green-500/10 text-green-400"
                    : zone.status === "danger"
                      ? "bg-red-500/10 text-red-400"
                      : "bg-amber-500/10 text-amber-400"
                }`}
              >
                {zone.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sensor Configuration */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Radio className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Sensor Configuration
          </h3>
        </div>
        <div className="space-y-3">
          {sensors.map((sensor) => (
            <div
              key={sensor.id}
              className="flex items-center justify-between py-3 px-4 rounded-xl border border-border/50 bg-muted/20"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {sensor.sensor_id}
                </p>
                <p className="text-xs text-muted-foreground">
                  Type: {sensor.type} · Zone: {sensor.zone_id}
                </p>
              </div>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                  sensor.status === "normal"
                    ? "bg-green-500/10 text-green-400"
                    : sensor.status === "smoke_detected"
                      ? "bg-red-500/10 text-red-400"
                      : "bg-amber-500/10 text-amber-400"
                }`}
              >
                {sensor.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* System Info */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <SettingsIcon className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            System Information
          </h3>
        </div>
        <div className="space-y-2">
          <InfoRow label="Application" value="SafetyNet v1.0" icon={<Shield className="w-3.5 h-3.5" />} />
          <InfoRow label="Framework" value="Next.js 16 + React" icon={<Database className="w-3.5 h-3.5" />} />
          <InfoRow label="Database" value="Supabase PostgreSQL" icon={<Database className="w-3.5 h-3.5" />} />
          <InfoRow label="Real-time" value="Supabase Realtime" icon={<Radio className="w-3.5 h-3.5" />} />
          <InfoRow label="Notifications" value="Browser Push + In-App" icon={<Bell className="w-3.5 h-3.5" />} />
        </div>
      </div>

      {/* API Endpoints */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            API Endpoints (ESP32)
          </h3>
        </div>
        <div className="space-y-2 font-mono text-xs">
          <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-muted/30">
            <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 text-[10px] font-bold">POST</span>
            <span className="text-foreground">/api/sensors/readings</span>
          </div>
          <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-muted/30">
            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold">GET</span>
            <span className="text-foreground">/api/sensors/status</span>
          </div>
          <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-muted/30">
            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold">GET</span>
            <span className="text-foreground">/api/zones/status</span>
          </div>
          <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-muted/30">
            <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 text-[10px] font-bold">POST</span>
            <span className="text-foreground">/api/fire-events</span>
          </div>
          <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-muted/30">
            <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 text-[10px] font-bold">POST</span>
            <span className="text-foreground">/api/fire-events/resolve</span>
          </div>
          <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-muted/30">
            <span className="px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 text-[10px] font-bold">POST</span>
            <span className="text-foreground">/api/simulate</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
