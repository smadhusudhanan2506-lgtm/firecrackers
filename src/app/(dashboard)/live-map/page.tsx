"use client";

import FactoryMap from "@/components/map/FactoryMap";
import MapLegend from "@/components/map/MapLegend";
import { useSystem } from "@/context/RealtimeProvider";
import { Map, AlertTriangle, Shield } from "lucide-react";

export default function LiveMapPage() {
  const { isEmergency, activeFireEvents, zones } = useSystem();
  const dangerZone = isEmergency
    ? zones.find((z) => z.id === activeFireEvents[0]?.zone_id)
    : null;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Map className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">Live Safety Map</h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              Real-time factory blueprint, sensor status & safe evacuation routes
            </p>
          </div>
        </div>

        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold w-fit ${
            isEmergency
              ? "bg-red-500/15 text-red-400 border border-red-500/30 animate-danger-glow"
              : "bg-green-500/15 text-green-400 border border-green-500/30"
          }`}
        >
          {isEmergency ? (
            <>
              <AlertTriangle className="w-4 h-4" />
              <span>EMERGENCY ACTIVE</span>
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              <span>ALL ZONES SAFE</span>
            </>
          )}
        </div>
      </div>

      {/* Emergency Alert Callout */}
      {isEmergency && dangerZone && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 md:p-5 animate-scale-in">
          <div className="flex items-start sm:items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 animate-emergency-pulse shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <p className="text-sm font-bold text-red-400">
                🚨 FIRE DETECTED — {dangerZone.name.toUpperCase()}
              </p>
              <p className="text-xs text-red-300/85 mt-0.5">
                Do not enter the red zone. Follow the green animated evacuation routes toward the nearest exit and proceed to the assembly point.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Map Canvas */}
      <div className="bg-[#121722] border border-[#1e2738] rounded-2xl p-3 sm:p-5 shadow-xl">
        <FactoryMap showEvacuation={true} />
      </div>

      {/* Map Legend */}
      <MapLegend />

      {/* Safety Compliance Note */}
      {isEmergency && (
        <div className="bg-[#121722] border border-[#1e2738] rounded-2xl p-4">
          <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Emergency Procedure
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Fire detected in Mixing Area. Do not enter the affected area. Follow
            the designated safe evacuation route and proceed to the assembly
            point outside the building. This system is a monitoring prototype —
            always follow your facility&apos;s standard operating safety procedures.
          </p>
        </div>
      )}
    </div>
  );
}
