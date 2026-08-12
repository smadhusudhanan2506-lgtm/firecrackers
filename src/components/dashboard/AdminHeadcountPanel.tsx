"use client";

import { useState } from "react";
import { useSystem } from "@/context/RealtimeProvider";
import {
  Users,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  UserCheck,
  UserX,
  Building2,
  BadgeAlert,
} from "lucide-react";

interface ZoneOccupancy {
  id: string;
  name: string;
  count: number;
  category: "red" | "orange" | "green";
  location: string;
  evacuationStatus: string;
}

const BASE_ZONE_OCCUPANCY: ZoneOccupancy[] = [
  // RED ZONE (Critical Fire Area)
  {
    id: "mixing-area",
    name: "Mixing Area",
    count: 4,
    category: "red",
    location: "Upper Center Block (Fire Origin)",
    evacuationStatus: "CRITICAL — IMMEDIATE EXTRACTION NEEDED",
  },
  // ORANGE ZONES (Surrounding Spread Hazard)
  {
    id: "pressing-rolling",
    name: "Pressing / Rolling Area",
    count: 4,
    category: "orange",
    location: "Upper Center Block (Below Fire)",
    evacuationStatus: "EVACUATING SOUTH — HIGH SPREAD RISK",
  },
  {
    id: "raw-material-storage",
    name: "Raw Material Storage",
    count: 3,
    category: "orange",
    location: "Upper West Block",
    evacuationStatus: "EVACUATING WEST CORRIDOR",
  },
  {
    id: "chemical-storage",
    name: "Chemical Storage",
    count: 2,
    category: "orange",
    location: "Upper West Block (Flammable)",
    evacuationStatus: "EVACUATING WEST CORRIDOR",
  },
  {
    id: "drying-area",
    name: "Drying Area",
    count: 3,
    category: "orange",
    location: "Upper East Block",
    evacuationStatus: "EVACUATING EAST CORRIDOR",
  },
  // GREEN ZONES (Safe Zones)
  {
    id: "packing-area",
    name: "Packing Area",
    count: 6,
    category: "green",
    location: "Lower West Block",
    evacuationStatus: "SAFE — DIRECTED TO SOUTH/WEST EXIT",
  },
  {
    id: "finished-goods",
    name: "Finished Goods Storage",
    count: 4,
    category: "green",
    location: "Lower West Block",
    evacuationStatus: "SAFE — DIRECTED TO SOUTH/WEST EXIT",
  },
  {
    id: "quality-check",
    name: "Quality Check Area",
    count: 5,
    category: "green",
    location: "Lower Center Block",
    evacuationStatus: "SAFE — DIRECTED TO MAIN SOUTH EXIT",
  },
  {
    id: "admin-control",
    name: "Admin / Control Room",
    count: 3,
    category: "green",
    location: "Lower Center Block",
    evacuationStatus: "SAFE — DIRECTED TO MAIN SOUTH EXIT",
  },
  {
    id: "fusing-area",
    name: "Fusing Area",
    count: 3,
    category: "green",
    location: "Lower East Block",
    evacuationStatus: "SAFE — DIRECTED TO EAST/SOUTH EXIT",
  },
  {
    id: "testing-area",
    name: "Testing Area",
    count: 3,
    category: "green",
    location: "Lower East Block",
    evacuationStatus: "SAFE — DIRECTED TO EAST/SOUTH EXIT",
  },
  {
    id: "assembly-point",
    name: "Assembly Point (Outside)",
    count: 15,
    category: "green",
    location: "Exterior Safe Muster Zone",
    evacuationStatus: "SECURE — HEADCOUNT VERIFIED",
  },
];

export default function AdminHeadcountPanel() {
  const { isEmergency, zones } = useSystem();
  const [showDetails, setShowDetails] = useState(false);

  // Dynamic headcount distribution based on active fire status
  const redZones = BASE_ZONE_OCCUPANCY.filter((z) => {
    if (!isEmergency) return false;
    const liveZone = zones.find((item) => item.id === z.id);
    return liveZone?.status === "danger" || z.category === "red";
  });

  const orangeZones = BASE_ZONE_OCCUPANCY.filter((z) => {
    if (!isEmergency) return false;
    const liveZone = zones.find((item) => item.id === z.id);
    return (
      (liveZone?.status === "caution" || z.category === "orange") &&
      !redZones.some((r) => r.id === z.id)
    );
  });

  const greenZones = BASE_ZONE_OCCUPANCY.filter((z) => {
    if (!isEmergency) return true;
    return !redZones.some((r) => r.id === z.id) && !orangeZones.some((o) => o.id === z.id);
  });

  const redCount = isEmergency ? redZones.reduce((sum, z) => sum + z.count, 0) : 0;
  const orangeCount = isEmergency ? orangeZones.reduce((sum, z) => sum + z.count, 0) : 0;
  const greenCount = isEmergency
    ? greenZones.reduce((sum, z) => sum + z.count, 0)
    : BASE_ZONE_OCCUPANCY.reduce((sum, z) => sum + z.count, 0);

  const totalPersonnel = redCount + orangeCount + greenCount;
  const safePercent = Math.round((greenCount / totalPersonnel) * 100);
  const orangePercent = Math.round((orangeCount / totalPersonnel) * 100);
  const redPercent = Math.round((redCount / totalPersonnel) * 100);

  return (
    <div className="bg-[#0f141e] border border-[#1e2738] rounded-2xl p-5 shadow-xl transition-all">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1c2536]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 shadow-sm">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">
                Admin Headcount & Occupancy Monitor
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/40 text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                Admin Role
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live personnel tracking across Red, Orange, and Green zones
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-xs text-muted-foreground">Total Personnel:</span>
            <span className="ml-1.5 text-sm font-bold text-white font-mono">
              {totalPersonnel} on-site
            </span>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#18202f] hover:bg-[#202b3f] text-xs font-semibold text-gray-300 hover:text-white border border-[#2b394e] transition-all cursor-pointer"
          >
            <span>{showDetails ? "Hide Breakdown" : "View Breakdown"}</span>
            {showDetails ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* 3 Zone Count Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 my-4">
        {/* RED AREA */}
        <div className="bg-red-950/25 border border-red-500/30 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                Red Area (Fire Zone)
              </span>
            </div>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-red-400 font-mono">
              {redCount}
            </span>
            <span className="text-xs font-semibold text-red-300/80">
              {redCount === 1 ? "person" : "people"} ({redPercent}%)
            </span>
          </div>
          <p className="text-[11px] text-red-300/70 mt-1.5 font-medium">
            {isEmergency
              ? "⚠ Critical hazard in Mixing Area — urgent extraction"
              : "0 in danger — all clear"}
          </p>
        </div>

        {/* ORANGE AREA */}
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Orange Area (Spread Risk)
              </span>
            </div>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400 font-mono">
              {orangeCount}
            </span>
            <span className="text-xs font-semibold text-amber-300/80">
              {orangeCount === 1 ? "person" : "people"} ({orangePercent}%)
            </span>
          </div>
          <p className="text-[11px] text-amber-300/70 mt-1.5 font-medium">
            {isEmergency
              ? "Raw Material, Chemical, Pressing & Drying evacuating"
              : "0 in caution — normal status"}
          </p>
        </div>

        {/* GREEN AREA */}
        <div className="bg-green-950/20 border border-green-500/30 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-xs font-bold text-green-400 uppercase tracking-wider">
                Green Area (Safe Zones)
              </span>
            </div>
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-green-400 font-mono">
              {greenCount}
            </span>
            <span className="text-xs font-semibold text-green-300/80">
              {greenCount === 1 ? "person" : "people"} ({safePercent}%)
            </span>
          </div>
          <p className="text-[11px] text-green-300/70 mt-1.5 font-medium">
            {isEmergency
              ? "Lower factory corridors & Exterior Assembly Point"
              : "All 11 zones safe and operational"}
          </p>
        </div>
      </div>

      {/* Evacuation Progress Bar */}
      <div className="mt-2 pt-3 border-t border-[#1c2536]">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5 font-medium">
          <span>Evacuation & Safety Ratio:</span>
          <span>
            🟢 Safe: <strong className="text-green-400 font-mono">{safePercent}%</strong> | 🟠 Spread Risk:{" "}
            <strong className="text-amber-400 font-mono">{orangePercent}%</strong> | 🔴 Fire Hazard:{" "}
            <strong className="text-red-400 font-mono">{redPercent}%</strong>
          </span>
        </div>
        <div className="w-full h-3 bg-[#161d2a] rounded-full overflow-hidden flex border border-[#232f42]">
          <div
            className="h-full bg-gradient-to-r from-green-600 to-green-500 transition-all duration-500"
            style={{ width: `${safePercent}%` }}
            title={`Safe Area: ${greenCount} people (${safePercent}%)`}
          />
          <div
            className="h-full bg-gradient-to-r from-amber-600 to-amber-500 transition-all duration-500"
            style={{ width: `${orangePercent}%` }}
            title={`Orange Spread Area: ${orangeCount} people (${orangePercent}%)`}
          />
          <div
            className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-500"
            style={{ width: `${redPercent}%` }}
            title={`Red Fire Area: ${redCount} people (${redPercent}%)`}
          />
        </div>
      </div>

      {/* Collapsible Zone-by-Zone Headcount Table */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-[#1c2536] animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-purple-400" />
              Room-by-Room Occupant Roster
            </h4>
            <span className="text-[11px] text-muted-foreground">
              Real-time site headcount
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#1e2738]">
            <table className="w-full text-left text-xs text-muted-foreground">
              <thead className="bg-[#121824] text-white text-[11px] uppercase font-bold border-b border-[#1e2738]">
                <tr>
                  <th className="py-2.5 px-3.5">Zone / Room</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3 text-center">Occupants</th>
                  <th className="py-2.5 px-3">Zone Status</th>
                  <th className="py-2.5 px-3">Evacuation Direction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18202d] bg-[#0c1017]">
                {BASE_ZONE_OCCUPANCY.map((z) => {
                  const currentCategory = isEmergency
                    ? z.category
                    : "green";

                  return (
                    <tr
                      key={z.id}
                      className={`hover:bg-[#131a26] transition-colors ${
                        currentCategory === "red"
                          ? "bg-red-950/15 text-red-300"
                          : currentCategory === "orange"
                            ? "bg-amber-950/10 text-amber-300"
                            : ""
                      }`}
                    >
                      <td className="py-2.5 px-3.5 font-semibold text-white">
                        {z.name}
                      </td>
                      <td className="py-2.5 px-3 text-gray-400">{z.location}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md font-mono font-bold text-xs ${
                            currentCategory === "red"
                              ? "bg-red-500/20 text-red-400 border border-red-500/40"
                              : currentCategory === "orange"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                                : "bg-green-500/20 text-green-400 border border-green-500/40"
                          }`}
                        >
                          👤 {z.count}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            currentCategory === "red"
                              ? "bg-red-500/15 text-red-400 border border-red-500/30"
                              : currentCategory === "orange"
                                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                : "bg-green-500/15 text-green-400 border border-green-500/30"
                          }`}
                        >
                          {currentCategory === "red"
                            ? "🔴 DANGER (FIRE)"
                            : currentCategory === "orange"
                              ? "🟠 SPREAD HAZARD"
                              : "🟢 SAFE"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[11px] font-medium text-gray-300">
                        {isEmergency ? z.evacuationStatus : "Standard readiness"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
