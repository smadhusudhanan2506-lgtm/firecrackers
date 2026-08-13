"use client";

import { useState } from "react";
import { useSystem } from "@/context/RealtimeProvider";
import AdminHeadcountPanel from "@/components/dashboard/AdminHeadcountPanel";
import FactoryMap from "@/components/map/FactoryMap";
import MapLegend from "@/components/map/MapLegend";
import { getApiUrl } from "@/lib/api";
import {
  Flame,
  Radio,
  Route,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Activity,
  AlertTriangle,
  Zap,
  Loader2,
  Map as MapIcon,
  Cpu,
} from "lucide-react";

export default function DashboardPage() {
  const {
    isEmergency,
    activeFireEvents,
    sensors,
    zones,
    refreshData,
  } = useSystem();

  const [simulating, setSimulating] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [showConfirmSim, setShowConfirmSim] = useState(false);
  const [showConfirmResolve, setShowConfirmResolve] = useState(false);

  const smokeSensor = sensors.find((s) => s.type === "smoke");
  const mixingArea = zones.find((z) => z.id === "mixing-area");

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await fetch(getApiUrl("/api/simulate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zoneId: "mixing-area", smokeValue: 650 }),
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setSimulating(false);
      setShowConfirmSim(false);
    }
  };

  const handleResolve = async () => {
    setResolving(true);
    try {
      const res = await fetch(getApiUrl("/api/fire-events/resolve"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zoneId: "mixing-area" }),
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (err) {
      console.error("Resolve error:", err);
    } finally {
      setResolving(false);
      setShowConfirmResolve(false);
    }
  };

  const getTimeDiff = (timestamp: string) => {
    const diff = Math.floor(
      (new Date().getTime() - new Date(timestamp).getTime()) / 1000
    );
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const sensorLastSeen = smokeSensor?.last_seen
    ? getTimeDiff(smokeSensor.last_seen)
    : "Just now";

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-[1550px] mx-auto">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1c2538]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
            SafetyNet Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 font-medium">
            Real-time industrial fire detection, personnel safety & live evacuation monitoring
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isEmergency ? (
            <button
              onClick={() => setShowConfirmResolve(true)}
              disabled={resolving}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-green-600/30 disabled:opacity-50 cursor-pointer"
            >
              {resolving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
              <span>Resolve Emergency</span>
            </button>
          ) : (
            <button
              onClick={() => setShowConfirmSim(true)}
              disabled={simulating}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-red-600/25 disabled:opacity-50 cursor-pointer"
            >
              {simulating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-5 h-5" />
              )}
              <span>Simulate Fire</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Key Status Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Fire Status */}
        <StatusCard
          icon={Flame}
          label="Fire Status"
          value={isEmergency ? "FIRE DETECTED" : "NO FIRE DETECTED"}
          status={isEmergency ? "danger" : "safe"}
          sublabel={
            isEmergency
              ? `Detected ${getTimeDiff(activeFireEvents[0]?.detected_at || new Date().toISOString())}`
              : "All zones clear & monitored"
          }
        />

        {/* Monitored Area */}
        <StatusCard
          icon={MapPin}
          label="Monitored Zone"
          value="Mixing Area"
          status={mixingArea?.status === "danger" ? "danger" : "safe"}
          sublabel={
            mixingArea?.status === "danger"
              ? "⚠ DANGER — Do Not Enter"
              : "Status: Safe & Operational"
          }
        />

        {/* Sensor Status */}
        <StatusCard
          icon={Radio}
          label="Hardware Sensor"
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
          sublabel={`SMOKE-MIX-01 · Active ${sensorLastSeen}`}
        />

        {/* Evacuation */}
        <StatusCard
          icon={Route}
          label="Evacuation Routes"
          value={isEmergency ? "ACTIVE EVACUATION" : "ROUTES AVAILABLE"}
          status={isEmergency ? "danger" : "safe"}
          sublabel={
            isEmergency
              ? "Follow animated green paths to exits"
              : "All 3 emergency exits clear"
          }
        />
      </div>

      {/* 3. Emergency Alert Card (Appears during Fire) */}
      {isEmergency && (
        <div className="bg-red-950/20 border-2 border-red-500/40 rounded-2xl p-6 sm:p-7 shadow-2xl animate-scale-in">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0 shadow-lg">
              <ShieldAlert className="w-8 h-8 text-red-500 animate-emergency-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-extrabold text-red-400 mb-1 tracking-wide">
                🚨 CRITICAL EMERGENCY ALERT — FIRE DETECTED
              </h3>
              <p className="text-sm text-red-200/90 leading-relaxed font-medium">
                Smoke & Fire confirmed in the <strong>Mixing Area</strong>. Immediate evacuation underway. 
                Do not enter North pathways or orange spread risk zones. Follow designated green routes to the 
                Exterior Assembly Point.
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <span className="px-3.5 py-1.5 rounded-lg bg-red-500/15 text-xs font-bold text-red-400 border border-red-500/30">
                  Severity: CRITICAL HAZARD
                </span>
                <span className="px-3.5 py-1.5 rounded-lg bg-red-500/15 text-xs font-bold text-red-400 border border-red-500/30">
                  Origin: Mixing Area (Upper Center)
                </span>
                <span className="px-3.5 py-1.5 rounded-lg bg-red-500/15 text-xs font-bold text-red-400 border border-red-500/30">
                  Status: LIVE ALARM TRIGGERED
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Admin Headcount & Occupancy Monitor (Spacious & Distinct) */}
      <AdminHeadcountPanel />

      {/* 5. Live Factory Blueprint & Safety Map (Directly on Dashboard with clean spacing) */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <MapIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide">
                Live Factory Blueprint & Dynamic Safety Map
              </h2>
              <p className="text-xs sm:text-sm text-gray-400">
                Visual zone status: 🔴 Red (Fire) | 🟠 Orange (Spread Hazard) | 🟢 Green (Safe Routes)
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-lg bg-[#151c2a] border border-[#243046] text-xs font-semibold text-gray-300 w-fit">
            Interactive Blueprint
          </span>
        </div>

        {/* Map Blueprint Container */}
        <div className="bg-[#0b0f17] border border-[#1e2738] rounded-2xl p-4 sm:p-6 shadow-2xl overflow-hidden">
          <FactoryMap />
        </div>

        {/* Safety Legend */}
        <MapLegend />
      </div>

      {/* 6. System & Hardware Connection Overview (Spacious 2-column cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {/* System Overview */}
        <div className="bg-[#0f141e] border border-[#1e2738] rounded-2xl p-6 sm:p-7 shadow-xl">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#1c2436] mb-5">
            <Activity className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
              System Health & Overview
            </h3>
          </div>
          <div className="space-y-4">
            <InfoRow
              icon={<Activity className="w-4 h-4 text-blue-400" />}
              label="Total Monitored Zones"
              value={`${zones.length} active zones`}
            />
            <InfoRow
              icon={<Radio className="w-4 h-4 text-green-400" />}
              label="Connected Smoke Sensors"
              value={`${sensors.filter((s) => s.status !== "offline").length}/${sensors.length} online`}
            />
            <InfoRow
              icon={<Flame className="w-4 h-4 text-red-400" />}
              label="Active Emergency Incidents"
              value={`${activeFireEvents.length} active`}
            />
            <InfoRow
              icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
              label="Current Factory Safety Mode"
              value={isEmergency ? "EMERGENCY STATE" : "NORMAL OPERATION"}
              highlight={isEmergency}
            />
          </div>
        </div>

        {/* Hardware ESP32 Connection */}
        <div className="bg-[#0f141e] border border-[#1e2738] rounded-2xl p-6 sm:p-7 shadow-xl">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#1c2436] mb-5">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Physical Hardware Status
            </h3>
          </div>
          <div className="space-y-4">
            <ConnectionRow
              label="ESP32 IoT Controller"
              status={smokeSensor?.status !== "offline" ? "online" : "offline"}
            />
            <ConnectionRow
              label="MQ-2 Gas / Smoke Sensor"
              status={smokeSensor?.status !== "offline" ? "connected" : "disconnected"}
            />
            <InfoRow
              icon={<Radio className="w-4 h-4 text-gray-400" />}
              label="Last Telemetry Received"
              value={sensorLastSeen}
            />
            <InfoRow
              icon={<MapPin className="w-4 h-4 text-gray-400" />}
              label="Hardware Sensor Placement"
              value="Mixing Area (Upper Center)"
            />
          </div>
        </div>
      </div>

      {/* Confirmation modals */}
      {showConfirmSim && (
        <ConfirmModal
          title="Simulate Fire Detection"
          message="This will simulate a real smoke detection trigger in the Mixing Area. The system will broadcast live emergency alerts, update all maps to Red/Orange/Green zones, and trigger safe evacuation pathways. Continue?"
          confirmLabel="Trigger Fire Simulation"
          confirmColor="red"
          onConfirm={handleSimulate}
          onCancel={() => setShowConfirmSim(false)}
        />
      )}

      {showConfirmResolve && (
        <ConfirmModal
          title="Resolve Emergency"
          message="This will mark the current fire event as resolved, reset all zones to Safe (Green), and restore the facility to normal operation. Continue?"
          confirmLabel="Resolve Emergency"
          confirmColor="green"
          onConfirm={handleResolve}
          onCancel={() => setShowConfirmResolve(false)}
        />
      )}
    </div>
  );
}

// -----------------------------------------------------------------
// Sub-components
// -----------------------------------------------------------------

function StatusCard({
  icon: Icon,
  label,
  value,
  status,
  sublabel,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  status: "safe" | "caution" | "danger";
  sublabel: string;
}) {
  const statusStyles = {
    safe: {
      border: "border-green-500/30",
      bg: "bg-[#0d131d]",
      dot: "bg-green-500 shadow-green-500/50",
      text: "text-green-400",
      iconColor: "text-green-400",
      iconBg: "bg-green-500/10",
    },
    caution: {
      border: "border-amber-500/30",
      bg: "bg-[#0d131d]",
      dot: "bg-amber-500 shadow-amber-500/50 animate-pulse",
      text: "text-amber-400",
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/10",
    },
    danger: {
      border: "border-red-500/40 animate-danger-glow",
      bg: "bg-red-950/20",
      dot: "bg-red-500 shadow-red-500/50 animate-emergency-pulse",
      text: "text-red-400",
      iconColor: "text-red-400",
      iconBg: "bg-red-500/15",
    },
  };

  const current = statusStyles[status];

  return (
    <div
      className={`border ${current.border} ${current.bg} rounded-2xl p-5 sm:p-6 shadow-xl transition-all hover:border-[#2f3d54]`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          {label}
        </span>
        <div className={`p-2 rounded-xl ${current.iconBg}`}>
          <Icon className={`w-4 h-4 ${current.iconColor}`} />
        </div>
      </div>
      <div className="flex items-center gap-2.5 mb-1.5">
        <div className={`w-2.5 h-2.5 rounded-full ${current.dot} shrink-0`} />
        <p className={`text-lg sm:text-xl font-extrabold tracking-tight truncate ${current.text}`}>
          {value}
        </p>
      </div>
      <p className="text-xs text-gray-400 font-medium truncate mt-1">
        {sublabel}
      </p>
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
    <div className="flex items-center justify-between py-2 border-b border-[#18202e] last:border-0 text-xs sm:text-sm">
      <div className="flex items-center gap-3 text-gray-300 font-medium">
        {icon}
        <span>{label}</span>
      </div>
      <span
        className={`font-semibold font-mono ${
          highlight ? "text-red-400 font-bold" : "text-white"
        }`}
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
    <div className="flex items-center justify-between py-2 border-b border-[#18202e] last:border-0 text-xs sm:text-sm">
      <span className="text-gray-300 font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            isGood ? "bg-green-500 shadow-sm shadow-green-500/50" : "bg-red-500 shadow-sm shadow-red-500/50"
          }`}
        />
        <span
          className={`font-bold uppercase text-xs ${
            isGood ? "text-green-400" : "text-red-400"
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
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#101622] border border-[#243046] rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl animate-scale-in">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6">
          {message}
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-300 hover:text-white hover:bg-[#1a2332] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-all shadow-lg cursor-pointer ${
              confirmColor === "red"
                ? "bg-red-600 hover:bg-red-500 shadow-red-600/30"
                : "bg-green-600 hover:bg-green-500 shadow-green-600/30"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
