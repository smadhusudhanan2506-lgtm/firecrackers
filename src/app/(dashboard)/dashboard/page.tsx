"use client";

import { useState } from "react";
import { useSystem } from "@/context/RealtimeProvider";
import { getApiUrl } from "@/lib/api";
import AdminHeadcountPanel from "@/components/dashboard/AdminHeadcountPanel";
import {
  Flame,
  MapPin,
  Radio,
  Route,
  AlertTriangle,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
} from "lucide-react";

export default function DashboardPage() {
  const {
    isEmergency,
    activeFireEvents,
    sensors,
    zones,
    refreshData,
    simulateLocalFire,
    resolveLocalEmergency,
  } = useSystem();
  const [simulating, setSimulating] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [showConfirmSim, setShowConfirmSim] = useState(false);
  const [showConfirmResolve, setShowConfirmResolve] = useState(false);

  const mixingArea = zones.find((z) => z.id === "mixing-area");
  const smokeSensor = sensors.find((s) => s.sensor_id === "SMOKE-MIX-01");

  const handleSimulate = async () => {
    setShowConfirmSim(false);
    setSimulating(true);
    // Instant UI update
    simulateLocalFire();

    try {
      await fetch(getApiUrl("/api/simulate"), { method: "POST" });
      await new Promise((r) => setTimeout(r, 400));
      await refreshData();
    } catch (err) {
      console.error("Simulation API sync note:", err);
    } finally {
      setSimulating(false);
    }
  };

  const handleResolve = async () => {
    setShowConfirmResolve(false);
    setResolving(true);
    // Instant UI update
    resolveLocalEmergency();

    try {
      await fetch(getApiUrl("/api/fire-events/resolve"), { method: "POST" });
      await new Promise((r) => setTimeout(r, 400));
      await refreshData();
    } catch (err) {
      console.error("Resolve API sync note:", err);
    } finally {
      setResolving(false);
    }
  };

  const sensorLastSeen = smokeSensor?.last_seen
    ? getTimeDiff(smokeSensor.last_seen)
    : "Just now";

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time safety monitoring overview & personnel headcount
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isEmergency ? (
            <button
              onClick={() => setShowConfirmResolve(true)}
              disabled={resolving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition-all shadow-lg shadow-green-600/20 disabled:opacity-50 cursor-pointer"
            >
              {resolving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              <span>Resolve Emergency</span>
            </button>
          ) : (
            <button
              onClick={() => setShowConfirmSim(true)}
              disabled={simulating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white text-sm font-semibold transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 cursor-pointer"
            >
              {simulating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              <span>Simulate Fire</span>
            </button>
          )}
        </div>
      </div>

      {/* Status cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fire Status */}
        <StatusCard
          icon={Flame}
          label="Fire Status"
          value={isEmergency ? "FIRE DETECTED" : "NO FIRE DETECTED"}
          status={isEmergency ? "danger" : "safe"}
          sublabel={
            isEmergency
              ? `Detected ${getTimeDiff(activeFireEvents[0]?.detected_at || new Date().toISOString())}`
              : "All zones clear"
          }
        />

        {/* Monitored Area */}
        <StatusCard
          icon={MapPin}
          label="Monitored Area"
          value="Mixing Area"
          status={mixingArea?.status === "danger" ? "danger" : "safe"}
          sublabel={
            mixingArea?.status === "danger"
              ? "⚠ DANGER — Do Not Enter"
              : "Status: Safe"
          }
        />

        {/* Sensor Status */}
        <StatusCard
          icon={Radio}
          label="Sensor Status"
          value={
            smokeSensor?.status === "smoke_detected"
              ? "SMOKE DETECTED"
              : smokeSensor?.status === "offline"
                ? "OFFLINE"
                : "NORMAL"
          }
          status={
            smokeSensor?.status === "smoke_detected"
              ? "danger"
              : smokeSensor?.status === "offline"
                ? "caution"
                : "safe"
          }
          sublabel={`SMOKE-MIX-01 · Last seen ${sensorLastSeen}`}
        />

        {/* Evacuation */}
        <StatusCard
          icon={Route}
          label="Evacuation"
          value={isEmergency ? "EMERGENCY ROUTE" : "ROUTES AVAILABLE"}
          status={isEmergency ? "danger" : "safe"}
          sublabel={
            isEmergency
              ? "Follow safe evacuation route"
              : "All exits accessible"
          }
        />
      </div>

      {/* Emergency alert card */}
      {isEmergency && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 animate-scale-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-red-500 animate-emergency-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-400 mb-1">
                🚨 Emergency Alert
              </h3>
              <p className="text-sm text-red-300/80 leading-relaxed">
                Fire detected in Mixing Area. Do not enter the affected area.
                Follow the designated safe evacuation route and proceed to the
                assembly point according to site emergency procedures.
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <span className="px-3 py-1 rounded-lg bg-red-500/10 text-xs font-semibold text-red-400 border border-red-500/20">
                  Severity: CRITICAL
                </span>
                <span className="px-3 py-1 rounded-lg bg-red-500/10 text-xs font-semibold text-red-400 border border-red-500/20">
                  Zone: Mixing Area
                </span>
                <span className="px-3 py-1 rounded-lg bg-red-500/10 text-xs font-semibold text-red-400 border border-red-500/20">
                  Status: ACTIVE
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Headcount & Occupancy Monitor (Red, Orange, and Green areas) */}
      <AdminHeadcountPanel />

      {/* System Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quick Stats */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            System Overview
          </h3>
          <div className="space-y-3">
            <InfoRow
              icon={<Activity className="w-4 h-4 text-primary" />}
              label="Monitored Zones"
              value={`${zones.length} active`}
            />
            <InfoRow
              icon={<Radio className="w-4 h-4 text-primary" />}
              label="Connected Sensors"
              value={`${sensors.filter((s) => s.status !== "offline").length}/${sensors.length}`}
            />
            <InfoRow
              icon={<Flame className="w-4 h-4 text-primary" />}
              label="Active Events"
              value={`${activeFireEvents.length}`}
            />
            <InfoRow
              icon={<AlertTriangle className="w-4 h-4 text-primary" />}
              label="System Mode"
              value={isEmergency ? "Emergency" : "Normal"}
              highlight={isEmergency}
            />
          </div>
        </div>

        {/* Hardware Connection */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Hardware Connection
          </h3>
          <div className="space-y-3">
            <ConnectionRow
              label="ESP32 Controller"
              status={smokeSensor?.status !== "offline" ? "online" : "offline"}
            />
            <ConnectionRow
              label="Smoke Sensor (MQ-2)"
              status={smokeSensor?.status !== "offline" ? "connected" : "disconnected"}
            />
            <InfoRow
              icon={<Radio className="w-4 h-4 text-muted-foreground" />}
              label="Last Communication"
              value={sensorLastSeen}
            />
            <InfoRow
              icon={<MapPin className="w-4 h-4 text-muted-foreground" />}
              label="Sensor Location"
              value="Mixing Area"
            />
          </div>
        </div>
      </div>

      {/* Confirmation modals */}
      {showConfirmSim && (
        <ConfirmModal
          title="Simulate Fire Detection"
          message="This will simulate a smoke detection event in the Mixing Area. The system will generate a real fire event, alerts, and update the map. Continue?"
          confirmLabel="Simulate Fire"
          confirmColor="red"
          onConfirm={handleSimulate}
          onCancel={() => setShowConfirmSim(false)}
        />
      )}

      {showConfirmResolve && (
        <ConfirmModal
          title="Resolve Emergency"
          message="This will mark the current fire event as resolved, reset the Mixing Area to safe status, and clear active alerts. The event will remain in history. Continue?"
          confirmLabel="Resolve Emergency"
          confirmColor="green"
          onConfirm={handleResolve}
          onCancel={() => setShowConfirmResolve(false)}
        />
      )}
    </div>
  );
}

/* ---- Sub-components ---- */

function StatusCard({
  icon: Icon,
  label,
  value,
  status,
  sublabel,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  status: "safe" | "danger" | "caution";
  sublabel: string;
}) {
  const colors = {
    safe: {
      bg: "bg-green-500/5",
      border: "border-green-500/15",
      icon: "text-green-500",
      value: "text-green-400",
      dot: "bg-green-500",
    },
    danger: {
      bg: "bg-red-500/5",
      border: "border-red-500/15",
      icon: "text-red-500",
      value: "text-red-400",
      dot: "bg-red-500",
    },
    caution: {
      bg: "bg-amber-500/5",
      border: "border-amber-500/15",
      icon: "text-amber-500",
      value: "text-amber-400",
      dot: "bg-amber-500",
    },
  };

  const c = colors[status];

  return (
    <div
      className={`${c.bg} border ${c.border} rounded-2xl p-5 transition-all duration-500 ${
        status === "danger" ? "animate-danger-glow" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <Icon className={`w-5 h-5 ${c.icon}`} />
      </div>
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className={`w-2 h-2 rounded-full ${c.dot} ${
            status === "danger" ? "animate-emergency-pulse" : ""
          }`}
        />
        <p className={`text-sm font-bold ${c.value}`}>{value}</p>
      </div>
      <p className="text-xs text-muted-foreground">{sublabel}</p>
    </div>
  );
}

function InfoRow({
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
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-2.5">
        {icon}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span
        className={`text-sm font-medium ${highlight ? "text-red-400" : "text-foreground"}`}
      >
        {value}
      </span>
    </div>
  );
}

function ConnectionRow({
  label,
  status,
}: {
  label: string;
  status: "online" | "offline" | "connected" | "disconnected";
}) {
  const isGood = status === "online" || status === "connected";
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${isGood ? "bg-green-500" : "bg-amber-500"}`}
        />
        <span
          className={`text-xs font-semibold uppercase ${
            isGood ? "text-green-400" : "text-amber-400"
          }`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}

function ConfirmModal({
  title,
  message,
  confirmLabel,
  confirmColor,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor: "red" | "green";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const btnClass =
    confirmColor === "red"
      ? "bg-red-600 hover:bg-red-500 shadow-red-600/20"
      : "bg-green-600 hover:bg-green-500 shadow-green-600/20";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl animate-scale-in">
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {message}
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-white hover:bg-muted transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-sm font-semibold text-white ${btnClass} shadow-lg transition-all cursor-pointer`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function getTimeDiff(timestamp: string): string {
  if (!timestamp) return "just now";
  const diff = Date.now() - new Date(timestamp).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
