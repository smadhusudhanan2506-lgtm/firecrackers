"use client";

import FactoryMap from "@/components/map/FactoryMap";
import { useSystem } from "@/context/RealtimeProvider";
import {
  Route,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Shield,
} from "lucide-react";

export default function EvacuationPage() {
  const { isEmergency, zones, activeFireEvents } = useSystem();
  const dangerZone = isEmergency
    ? zones.find((z) => z.id === activeFireEvents[0]?.zone_id)
    : null;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white">Evacuation Routes</h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
          Emergency evacuation guidance, hazard spread avoidance, and safe assembly guidance
        </p>
      </div>

      {/* Current status Banner */}
      <div
        className={`border rounded-2xl p-4 sm:p-5 transition-all ${
          isEmergency
            ? "bg-red-500/10 border-red-500/30"
            : "bg-[#121722] border-[#1e2738]"
        }`}
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              isEmergency ? "bg-red-500/20" : "bg-green-500/15"
            }`}
          >
            {isEmergency ? (
              <AlertTriangle className="w-5 h-5 text-red-500 animate-emergency-pulse" />
            ) : (
              <Shield className="w-5 h-5 text-green-500" />
            )}
          </div>
          <div>
            <h2
              className={`text-base font-bold ${
                isEmergency ? "text-red-400" : "text-green-400"
              }`}
            >
              {isEmergency
                ? "🚨 EMERGENCY EVACUATION ACTIVE — AVOID RED & ORANGE ZONES"
                : "🟢 All Clear — No Evacuation Required"}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {isEmergency
                ? `Active fire detected in ${dangerZone?.name || "Mixing Area"}. Avoid the RED Fire zone, ORANGE spread risk zone, and the North pathway. Follow safe green pathways to West, East, or South exits.`
                : "All zones are safe. Emergency exit corridors and exterior assembly point are displayed below for standard readiness."}
            </p>
          </div>
        </div>
      </div>

      {/* Evacuation Route Steps (during emergency) */}
      {isEmergency && (
        <div className="bg-[#121722] border border-[#1e2738] rounded-2xl p-4 sm:p-5">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Recommended Evacuation Route
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <RouteStep
              step={1}
              title="Leave current area"
              desc="Move calmly toward the West or East vertical corridors"
              status="action"
            />
            <RouteStep
              step={2}
              title="AVOID: Red & Orange Zones"
              desc="Do NOT enter Mixing Area, Pressing Area or North corridor"
              status="danger"
            />
            <RouteStep
              step={3}
              title="Follow green directional pathways"
              desc="Head along West/East vertical pathways to West, East or South exits"
              status="safe"
            />
            <RouteStep
              step={4}
              title="Report to Assembly Point"
              desc="Gather at the outside Assembly Point south of the building"
              status="safe"
            />
          </div>
        </div>
      )}

      {/* Factory Map Display */}
      <div className="bg-[#121722] border border-[#1e2738] rounded-2xl p-3 sm:p-5 shadow-xl">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Factory Blueprint & Dynamic Evacuation Path
        </h3>
        <FactoryMap showEvacuation={true} />
      </div>

      {/* Emergency Exits & Assembly Point Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <ExitCard
          name="North Exit"
          location="Top perimeter (Above Fire)"
          accessible={!isEmergency}
        />
        <ExitCard name="West Exit" location="Left perimeter pathway" accessible={true} />
        <ExitCard name="East Exit" location="Right perimeter pathway" accessible={true} />
        <ExitCard name="Main South Exits" location="Direct to Assembly Point" accessible={true} />
      </div>

      {/* Assembly Point Card */}
      <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
        <MapPin className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider">
            Designated Assembly Point (Outside Building)
          </h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Located directly outside the South perimeter exit. After exiting the building via the safe green routes, all personnel must immediately report to the safety officer at the assembly point for headcount verification.
          </p>
        </div>
      </div>
    </div>
  );
}

function RouteStep({
  step,
  title,
  desc,
  status,
}: {
  step: number;
  title: string;
  desc: string;
  status: "action" | "danger" | "safe";
}) {
  const colors = {
    action: "border-blue-500/25 bg-blue-500/10",
    danger: "border-red-500/25 bg-red-500/10",
    safe: "border-green-500/25 bg-green-500/10",
  };
  const textColors = {
    action: "text-blue-400",
    danger: "text-red-400",
    safe: "text-green-400",
  };

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${colors[status]}`}>
      <div
        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${textColors[status]} bg-background/70`}
      >
        {step}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs sm:text-sm font-bold ${textColors[status]} truncate`}>
          {title}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <ArrowRight className={`w-3.5 h-3.5 ${textColors[status]} shrink-0 mt-1`} />
    </div>
  );
}

function ExitCard({
  name,
  location,
  accessible,
}: {
  name: string;
  location: string;
  accessible: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#1e2738] bg-[#121722]">
      <div className="flex items-center gap-2.5">
        <span className="text-base">🚪</span>
        <div>
          <p className="text-xs sm:text-sm font-bold text-white">{name}</p>
          <p className="text-[10px] text-muted-foreground">{location}</p>
        </div>
      </div>
      {accessible ? (
        <span className="flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20">
          <CheckCircle2 className="w-3 h-3" /> SAFE EXIT
        </span>
      ) : (
        <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
          <AlertTriangle className="w-3 h-3" /> COMPROMISED / AVOID
        </span>
      )}
    </div>
  );
}
