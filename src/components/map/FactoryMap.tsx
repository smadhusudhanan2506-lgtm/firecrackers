"use client";

import { useSystem } from "@/context/RealtimeProvider";

interface FactoryMapProps {
  showEvacuation?: boolean;
}

export default function FactoryMap({ showEvacuation = true }: FactoryMapProps) {
  const { zones, isEmergency } = useSystem();

  const getZoneStatus = (zoneId: string) => {
    const zone = zones.find((z) => z.id === zoneId);
    return zone?.status || "safe";
  };

  const getZoneFill = (zoneId: string) => {
    const status = getZoneStatus(zoneId);
    switch (status) {
      case "danger":
        return "rgba(239, 68, 68, 0.32)";
      case "caution":
        return "rgba(249, 115, 22, 0.28)";
      default:
        return "rgba(34, 197, 94, 0.05)";
    }
  };

  const getZoneStroke = (zoneId: string) => {
    const status = getZoneStatus(zoneId);
    switch (status) {
      case "danger":
        return "#ef4444";
      case "caution":
        return "#f97316";
      default:
        return "#2d3748";
    }
  };

  return (
    <div className="w-full flex items-center justify-center overflow-hidden">
      <svg
        viewBox="0 0 1020 780"
        className="w-full h-auto max-h-[70vh] select-none"
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Arrow markers */}
          <marker
            id="arrowGreen"
            markerWidth="8"
            markerHeight="6"
            refX="7"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#22c55e" />
          </marker>
          <marker
            id="arrowGray"
            markerWidth="6"
            markerHeight="4"
            refX="5"
            refY="2"
            orient="auto"
          >
            <polygon points="0 0, 6 2, 0 4" fill="#4a5568" />
          </marker>

          {/* Glow filter for RED Fire Danger */}
          <filter id="dangerGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Glow filter for ORANGE Caution */}
          <filter id="cautionGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Red Crosshatch pattern for Fire */}
          <pattern
            id="blockedPattern"
            width="16"
            height="16"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="0" x2="16" y2="16" stroke="#ef4444" strokeWidth="1.5" opacity="0.45" />
            <line x1="16" y1="0" x2="0" y2="16" stroke="#ef4444" strokeWidth="1.5" opacity="0.45" />
          </pattern>

          {/* Orange diagonal stripes for Caution zone */}
          <pattern
            id="cautionPattern"
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="14" stroke="#f97316" strokeWidth="2.5" opacity="0.38" />
          </pattern>
        </defs>

        {/* Outer Canvas Background */}
        <rect width="1020" height="780" fill="#0b0e14" rx="14" />

        {/* ===== BUILDING EXTERIOR DOUBLE WALL ===== */}
        <rect
          x="40"
          y="35"
          width="940"
          height="665"
          fill="none"
          stroke="#1e293b"
          strokeWidth="6"
          rx="10"
        />
        <rect
          x="45"
          y="40"
          width="930"
          height="655"
          fill="#0e131d"
          stroke="#334155"
          strokeWidth="2"
          rx="8"
        />

        {/* ============================================================== */}
        {/* CORRIDORS & PATHWAYS BASE LAYOUT                               */}
        {/* ============================================================== */}

        {/* Top North Perimeter Corridor */}
        <rect
          x="75"
          y="45"
          width="870"
          height="25"
          fill="rgba(30, 41, 59, 0.4)"
          stroke="#1e293b"
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        {/* 1. West Vertical Corridor (Between Left Column & Center Column) */}
        <rect
          x="280"
          y="65"
          width="40"
          height="605"
          fill="rgba(30, 41, 59, 0.45)"
          stroke="#1e293b"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <text
          x="300"
          y="530"
          textAnchor="middle"
          fill="#64748b"
          fontSize="8"
          fontWeight="700"
          letterSpacing="1"
          transform="rotate(-90 300 530)"
        >
          WEST PATHWAY
        </text>

        {/* 2. East Vertical Corridor (Between Center Column & Right Column) */}
        <rect
          x="700"
          y="65"
          width="40"
          height="605"
          fill="rgba(30, 41, 59, 0.45)"
          stroke="#1e293b"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <text
          x="720"
          y="530"
          textAnchor="middle"
          fill="#64748b"
          fontSize="8"
          fontWeight="700"
          letterSpacing="1"
          transform="rotate(90 720 530)"
        >
          EAST PATHWAY
        </text>

        {/* 3. Central Main Horizontal Corridor */}
        <rect
          x="75"
          y="350"
          width="870"
          height="55"
          fill="rgba(30, 41, 59, 0.55)"
          stroke="#334155"
          strokeWidth="1.5"
          strokeDasharray="8 4"
        />
        <text
          x="510"
          y="382"
          textAnchor="middle"
          fill="#64748b"
          fontSize="10"
          fontWeight="800"
          letterSpacing="2"
        >
          MAIN CENTRAL CORRIDOR
        </text>

        {/* 4. Bottom South Perimeter Corridor */}
        <rect
          x="75"
          y="670"
          width="870"
          height="25"
          fill="rgba(30, 41, 59, 0.4)"
          stroke="#1e293b"
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        {/* Perimeter Corridors in Normal State */}
        {!isEmergency && showEvacuation && (
          <g opacity="0.45">
            <line x1="85" y1="55" x2="450" y2="55" stroke="#64748b" strokeWidth="1.5" strokeDasharray="6 4" markerEnd="url(#arrowGray)" />
            <line x1="570" y1="55" x2="935" y2="55" stroke="#64748b" strokeWidth="1.5" strokeDasharray="6 4" markerEnd="url(#arrowGray)" />
            <line x1="62" y1="65" x2="62" y2="350" stroke="#64748b" strokeWidth="1.5" strokeDasharray="6 4" markerEnd="url(#arrowGray)" />
            <line x1="62" y1="410" x2="62" y2="650" stroke="#64748b" strokeWidth="1.5" strokeDasharray="6 4" markerEnd="url(#arrowGray)" />
            <line x1="958" y1="65" x2="958" y2="350" stroke="#64748b" strokeWidth="1.5" strokeDasharray="6 4" markerEnd="url(#arrowGray)" />
            <line x1="958" y1="410" x2="958" y2="650" stroke="#64748b" strokeWidth="1.5" strokeDasharray="6 4" markerEnd="url(#arrowGray)" />
            <line x1="85" y1="682" x2="450" y2="682" stroke="#64748b" strokeWidth="1.5" strokeDasharray="6 4" markerEnd="url(#arrowGray)" />
            <line x1="570" y1="682" x2="935" y2="682" stroke="#64748b" strokeWidth="1.5" strokeDasharray="6 4" markerEnd="url(#arrowGray)" />
            <line x1="300" y1="80" x2="300" y2="340" stroke="#64748b" strokeWidth="1.5" strokeDasharray="6 4" markerEnd="url(#arrowGray)" />
            <line x1="300" y1="415" x2="300" y2="660" stroke="#64748b" strokeWidth="1.5" strokeDasharray="6 4" markerEnd="url(#arrowGray)" />
            <line x1="720" y1="80" x2="720" y2="340" stroke="#64748b" strokeWidth="1.5" strokeDasharray="6 4" markerEnd="url(#arrowGray)" />
            <line x1="720" y1="415" x2="720" y2="660" stroke="#64748b" strokeWidth="1.5" strokeDasharray="6 4" markerEnd="url(#arrowGray)" />
          </g>
        )}

        {/* ============================================================== */}
        {/* ORANGE CAUTION ZONES ON SURROUNDING PATHS                      */}
        {/* ============================================================== */}
        {isEmergency && (
          <g className="animate-emergency-pulse">
            {/* 1. North Corridor Pathway across entire top section (above fire and adjacent rooms) */}
            <rect
              x="75"
              y="45"
              width="870"
              height="26"
              fill="rgba(249, 115, 22, 0.35)"
              stroke="#f97316"
              strokeWidth="1.5"
              rx="4"
              filter="url(#cautionGlow)"
            />
            <rect
              x="75"
              y="45"
              width="870"
              height="26"
              fill="url(#cautionPattern)"
              rx="4"
            />
            <text
              x="510"
              y="62"
              textAnchor="middle"
              fill="#fed7aa"
              fontSize="9"
              fontWeight="900"
              letterSpacing="1"
            >
              ⚠ NORTH CORRIDOR COMPROMISED — FIRE SPREAD RISK — AVOID THIS PATH ⚠
            </text>

            {/* 2. West Vertical Pathway Upper Section (between Raw Material/Chemical and Mixing/Pressing) */}
            <rect
              x="280"
              y="68"
              width="40"
              height="275"
              fill="rgba(249, 115, 22, 0.35)"
              stroke="#f97316"
              strokeWidth="1.5"
              rx="4"
              filter="url(#cautionGlow)"
            />
            <rect
              x="280"
              y="68"
              width="40"
              height="275"
              fill="url(#cautionPattern)"
              rx="4"
            />
            <text
              x="300"
              y="200"
              textAnchor="middle"
              fill="#fed7aa"
              fontSize="8"
              fontWeight="900"
              letterSpacing="1"
              transform="rotate(-90 300 200)"
            >
              ⚠ AVOID PATH
            </text>

            {/* 3. East Vertical Pathway Upper Section (between Mixing/Pressing and Drying Area) */}
            <rect
              x="700"
              y="68"
              width="40"
              height="275"
              fill="rgba(249, 115, 22, 0.35)"
              stroke="#f97316"
              strokeWidth="1.5"
              rx="4"
              filter="url(#cautionGlow)"
            />
            <rect
              x="700"
              y="68"
              width="40"
              height="275"
              fill="url(#cautionPattern)"
              rx="4"
            />
            <text
              x="720"
              y="200"
              textAnchor="middle"
              fill="#fed7aa"
              fontSize="8"
              fontWeight="900"
              letterSpacing="1"
              transform="rotate(90 720 200)"
            >
              ⚠ AVOID PATH
            </text>
          </g>
        )}

        {/* ============================================================== */}
        {/* ROOMS — SURROUNDING UPPER SECTION & SAFE LOWER SECTION         */}
        {/* ============================================================== */}

        {/* 1. RAW MATERIAL STORAGE (Left of Fire) — 🟠 ORANGE CAUTION SPREAD ZONE */}
        <g className={isEmergency ? "animate-emergency-pulse" : ""}>
          <ZoneRect
            x={80}
            y={75}
            w={190}
            h={125}
            zoneId="raw-material-storage"
            fill={getZoneFill("raw-material-storage")}
            stroke={getZoneStroke("raw-material-storage")}
            strokeWidth={isEmergency ? 2.5 : 1.5}
            filter={isEmergency ? "url(#cautionGlow)" : undefined}
          />
          {isEmergency && (
            <rect x={80} y={75} width={190} height={125} fill="url(#cautionPattern)" rx="6" />
          )}
          <ZoneLabel
            x={175}
            y={125}
            text="RAW MATERIAL"
            color={isEmergency ? "#f97316" : "#f1f5f9"}
            bold={isEmergency}
          />
          <ZoneLabel
            x={175}
            y={143}
            text={isEmergency ? "⚠ SPREAD RISK (AVOID)" : "STORAGE"}
            size="small"
            color={isEmergency ? "#fed7aa" : "#94a3b8"}
          />
          {isEmergency && (
            <text x={175} y={178} textAnchor="middle" fill="#ea580c" fontSize="8.5" fontWeight="900">
              🟠 ORANGE ZONE 🟠
            </text>
          )}
        </g>

        {/* 2. CHEMICAL STORAGE (Left/Flammability Risk) — 🟠 ORANGE CAUTION SPREAD ZONE */}
        <g className={isEmergency ? "animate-emergency-pulse" : ""}>
          <ZoneRect
            x={80}
            y={210}
            w={190}
            h={130}
            zoneId="chemical-storage"
            fill={getZoneFill("chemical-storage")}
            stroke={getZoneStroke("chemical-storage")}
            strokeWidth={isEmergency ? 2.5 : 1.5}
            filter={isEmergency ? "url(#cautionGlow)" : undefined}
          />
          {isEmergency && (
            <rect x={80} y={210} width={190} height={130} fill="url(#cautionPattern)" rx="6" />
          )}
          <ZoneLabel
            x={175}
            y={260}
            text="CHEMICAL STORAGE"
            color={isEmergency ? "#f97316" : "#f1f5f9"}
            bold={isEmergency}
          />
          <ZoneLabel
            x={175}
            y={280}
            text={isEmergency ? "⚠ FLAMMABLE SPREAD RISK" : "(STORAGE)"}
            size="small"
            color={isEmergency ? "#fed7aa" : "#94a3b8"}
          />
          {isEmergency && (
            <text x={175} y={315} textAnchor="middle" fill="#ea580c" fontSize="8.5" fontWeight="900">
              🟠 ORANGE ZONE 🟠
            </text>
          )}
        </g>

        {/* 3. MIXING AREA — 🔴 RED ACTIVE FIRE DANGER ZONE (CENTER OF INCIDENT) */}
        <g className={isEmergency ? "animate-emergency-pulse" : ""}>
          <ZoneRect
            x={330}
            y={75}
            w={360}
            h={130}
            zoneId="mixing-area"
            fill={getZoneFill("mixing-area")}
            stroke={getZoneStroke("mixing-area")}
            strokeWidth={isEmergency ? 3.5 : 1.5}
            filter={isEmergency ? "url(#dangerGlow)" : undefined}
          />
          {isEmergency && (
            <rect
              x={330}
              y={75}
              width={360}
              height={130}
              fill="url(#blockedPattern)"
              rx="6"
            />
          )}
          <ZoneLabel
            x={510}
            y={122}
            text="MIXING AREA"
            color={isEmergency ? "#ef4444" : "#f1f5f9"}
            bold
          />
          <ZoneLabel
            x={510}
            y={142}
            text={isEmergency ? "🔥 ACTIVE FIRE — DO NOT ENTER" : "(AUTHORIZED PERSONS ONLY)"}
            size="small"
            color={isEmergency ? "#fca5a5" : "#94a3b8"}
          />
          {/* Sensor badge */}
          <circle
            cx={352}
            cy={95}
            r={9}
            fill={isEmergency ? "#ef4444" : "#22c55e"}
            opacity={0.9}
          />
          <text x={352} y={99} textAnchor="middle" fill="white" fontSize="9" fontWeight="800">
            S
          </text>
          <text x={370} y={98} fill={isEmergency ? "#fca5a5" : "#6ee7b7"} fontSize="8" fontWeight="600">
            SMOKE-MIX-01
          </text>
          {isEmergency && (
            <text
              x={510}
              y={180}
              textAnchor="middle"
              fill="#ef4444"
              fontSize="11"
              fontWeight="900"
              letterSpacing="1.5"
            >
              🔴 CRITICAL FIRE ZONE 🔴
            </text>
          )}
        </g>

        {/* 4. PRESSING / ROLLING AREA (Below Fire) — 🟠 ORANGE CAUTION SPREAD ZONE */}
        <g className={isEmergency ? "animate-emergency-pulse" : ""}>
          <ZoneRect
            x={330}
            y={215}
            w={360}
            h={125}
            zoneId="pressing-rolling"
            fill={getZoneFill("pressing-rolling")}
            stroke={getZoneStroke("pressing-rolling")}
            strokeWidth={isEmergency ? 2.5 : 1.5}
            filter={isEmergency ? "url(#cautionGlow)" : undefined}
          />
          {isEmergency && (
            <rect
              x={330}
              y={215}
              width={360}
              height={125}
              fill="url(#cautionPattern)"
              rx="6"
            />
          )}
          <ZoneLabel
            x={510}
            y={258}
            text="PRESSING / ROLLING AREA"
            color={isEmergency ? "#f97316" : "#f1f5f9"}
            bold={isEmergency}
          />
          <ZoneLabel
            x={510}
            y={278}
            text={
              isEmergency
                ? "⚠ HIGH FIRE SPREAD RISK — AVOID AREA"
                : "(AUTHORIZED PERSONS ONLY)"
            }
            size="small"
            color={isEmergency ? "#fed7aa" : "#94a3b8"}
          />
          {isEmergency && (
            <text
              x={510}
              y={315}
              textAnchor="middle"
              fill="#ea580c"
              fontSize="10"
              fontWeight="900"
              letterSpacing="1"
            >
              🟠 SPREAD HAZARD (ORANGE ZONE) 🟠
            </text>
          )}
        </g>

        {/* 5. DRYING AREA (Right of Fire) — 🟠 ORANGE CAUTION SPREAD ZONE */}
        <g className={isEmergency ? "animate-emergency-pulse" : ""}>
          <ZoneRect
            x={750}
            y={75}
            w={195}
            h={265}
            zoneId="drying-area"
            fill={getZoneFill("drying-area")}
            stroke={getZoneStroke("drying-area")}
            strokeWidth={isEmergency ? 2.5 : 1.5}
            filter={isEmergency ? "url(#cautionGlow)" : undefined}
          />
          {isEmergency && (
            <rect x={750} y={75} width={195} height={265} fill="url(#cautionPattern)" rx="6" />
          )}
          <ZoneLabel
            x={847}
            y={185}
            text="DRYING AREA"
            color={isEmergency ? "#f97316" : "#f1f5f9"}
            bold={isEmergency}
          />
          <ZoneLabel
            x={847}
            y={205}
            text={isEmergency ? "⚠ SPREAD RISK (AVOID)" : "(WELL VENTILATED)"}
            size="small"
            color={isEmergency ? "#fed7aa" : "#94a3b8"}
          />
          {isEmergency && (
            <text x={847} y={240} textAnchor="middle" fill="#ea580c" fontSize="8.5" fontWeight="900">
              🟠 ORANGE ZONE 🟠
            </text>
          )}
        </g>

        {/* ============================================================== */}
        {/* LOWER SECTION — SAFE ZONES (GREEN)                             */}
        {/* ============================================================== */}

        {/* 6. Packing Area */}
        <ZoneRect
          x={80}
          y={415}
          w={190}
          h={115}
          zoneId="packing-area"
          fill={getZoneFill("packing-area")}
          stroke={getZoneStroke("packing-area")}
        />
        <ZoneLabel x={175} y={476} text="PACKING AREA" />

        {/* 7. Finished Goods Storage */}
        <ZoneRect
          x={80}
          y={540}
          w={190}
          h={125}
          zoneId="finished-goods"
          fill={getZoneFill("finished-goods")}
          stroke={getZoneStroke("finished-goods")}
        />
        <ZoneLabel x={175} y={596} text="FINISHED GOODS" />
        <ZoneLabel x={175} y={614} text="STORAGE" size="small" />

        {/* 8. Quality Check Area */}
        <ZoneRect
          x={330}
          y={415}
          w={175}
          h={250}
          zoneId="quality-check"
          fill={getZoneFill("quality-check")}
          stroke={getZoneStroke("quality-check")}
        />
        <ZoneLabel x={417} y={535} text="QUALITY CHECK" />
        <ZoneLabel x={417} y={553} text="AREA" size="small" />

        {/* 9. Admin / Control Room */}
        <ZoneRect
          x={515}
          y={415}
          w={175}
          h={250}
          zoneId="admin-control"
          fill={getZoneFill("admin-control")}
          stroke={getZoneStroke("admin-control")}
        />
        <ZoneLabel x={602} y={535} text="ADMIN / CONTROL" />
        <ZoneLabel x={602} y={553} text="ROOM" size="small" />

        {/* 10. Fusing Area */}
        <ZoneRect
          x={750}
          y={415}
          w={195}
          h={115}
          zoneId="fusing-area"
          fill={getZoneFill("fusing-area")}
          stroke={getZoneStroke("fusing-area")}
        />
        <ZoneLabel x={847} y={466} text="FUSING AREA" />
        <ZoneLabel
          x={847}
          y={484}
          text="(SEPARATE SECTION)"
          size="small"
          color="#94a3b8"
        />

        {/* 11. Testing Area */}
        <ZoneRect
          x={750}
          y={540}
          w={195}
          h={125}
          zoneId="testing-area"
          fill={getZoneFill("testing-area")}
          stroke={getZoneStroke("testing-area")}
        />
        <ZoneLabel x={847} y={596} text="TESTING AREA" />
        <ZoneLabel
          x={847}
          y={614}
          text="(OPEN YARD)"
          size="small"
          color="#94a3b8"
        />

        {/* ============================================================== */}
        {/* DOORWAYS & ACCESS POINTS                                       */}
        {/* ============================================================== */}
        <path d="M 270 170 Q 285 170 285 185" fill="none" stroke="#64748b" strokeWidth="1.5" />
        <path d="M 270 315 Q 285 315 285 330" fill="none" stroke="#64748b" strokeWidth="1.5" />
        <path d="M 270 490 Q 285 490 285 505" fill="none" stroke="#64748b" strokeWidth="1.5" />
        <path d="M 270 625 Q 285 625 285 640" fill="none" stroke="#64748b" strokeWidth="1.5" />
        <path d="M 750 320 Q 735 320 735 305" fill="none" stroke="#64748b" strokeWidth="1.5" />
        <path d="M 750 490 Q 735 490 735 505" fill="none" stroke="#64748b" strokeWidth="1.5" />
        <path d="M 750 625 Q 735 625 735 640" fill="none" stroke="#64748b" strokeWidth="1.5" />

        {/* ============================================================== */}
        {/* EMERGENCY EXITS                                                */}
        {/* ============================================================== */}
        {/* Top North Emergency Exit (Compromised / Blocked during fire) */}
        <EmergencyExit
          x={510}
          y={25}
          label={isEmergency ? "NORTH EXIT BLOCKED" : "EMERGENCY EXIT"}
          avoid={isEmergency}
        />
        {/* Left Emergency Exit (West Exit) */}
        <EmergencyExit x={32} y={377} label="EMERGENCY EXIT" vertical />
        {/* Right Emergency Exit (East Exit) */}
        <EmergencyExit x={988} y={377} label="EMERGENCY EXIT" vertical />
        {/* Bottom Left Exit */}
        <EmergencyExit x={175} y={710} label="EMERGENCY EXIT" />
        {/* Bottom Right Exit */}
        <EmergencyExit x={847} y={710} label="EMERGENCY EXIT" />
        {/* Main South Exit (to Assembly Point) */}
        <EmergencyExit x={510} y={710} label="MAIN SOUTH EXIT" />

        {/* ===== ASSEMBLY POINT (Outside Building) ===== */}
        <rect
          x={375}
          y={735}
          width={270}
          height={34}
          fill="rgba(34, 197, 94, 0.14)"
          stroke="#22c55e"
          strokeWidth="1.5"
          rx="6"
          strokeDasharray="5 3"
        />
        <text
          x={510}
          y={756}
          textAnchor="middle"
          fill="#22c55e"
          fontSize="11"
          fontWeight="900"
          letterSpacing="1"
        >
          📍 ASSEMBLY POINT (OUTSIDE BUILDING)
        </text>

        {/* ============================================================== */}
        {/* DYNAMIC EMERGENCY SAFE EVACUATION ROUTE (Active on Fire)        */}
        {/* ============================================================== */}
        {isEmergency && showEvacuation && (
          <g>
            {/* Safe Central Horizontal Escape Routes leading away from hazard */}
            <polyline
              points="300,377 80,377 38,377"
              fill="none"
              stroke="#22c55e"
              strokeWidth="4"
              strokeDasharray="12 6"
              markerEnd="url(#arrowGreen)"
              className="animate-route-dash"
            />
            <polyline
              points="720,377 940,377 982,377"
              fill="none"
              stroke="#22c55e"
              strokeWidth="4"
              strokeDasharray="12 6"
              markerEnd="url(#arrowGreen)"
              className="animate-route-dash"
            />

            {/* Lower West Pathway leading down to South Exit */}
            <polyline
              points="300,377 300,670 510,670 510,735"
              fill="none"
              stroke="#22c55e"
              strokeWidth="4"
              strokeDasharray="12 6"
              markerEnd="url(#arrowGreen)"
              className="animate-route-dash"
            />

            {/* Lower East Pathway leading down to South Exit */}
            <polyline
              points="720,377 720,670 510,670 510,735"
              fill="none"
              stroke="#22c55e"
              strokeWidth="4"
              strokeDasharray="12 6"
              markerEnd="url(#arrowGreen)"
              className="animate-route-dash"
            />

            {/* Directional Route Badges */}
            <rect x={155} y={363} width={100} height={18} fill="#14532d" rx="4" stroke="#22c55e" strokeWidth="1" />
            <text x={205} y={375} textAnchor="middle" fill="#86efac" fontSize="8.5" fontWeight="800">
              ← SAFE WEST EXIT
            </text>

            <rect x={765} y={363} width={100} height={18} fill="#14532d" rx="4" stroke="#22c55e" strokeWidth="1" />
            <text x={815} y={375} textAnchor="middle" fill="#86efac" fontSize="8.5" fontWeight="800">
              SAFE EAST EXIT →
            </text>

            <rect x={425} y={678} width={170} height={20} fill="#14532d" rx="4" stroke="#22c55e" strokeWidth="1" />
            <text x={510} y={691} textAnchor="middle" fill="#86efac" fontSize="8.5" fontWeight="900">
              ↓ SAFE EXIT TO ASSEMBLY POINT
            </text>

            {/* Upper Hazard Barrier Line */}
            <line x1="80" y1="348" x2="940" y2="348" stroke="#ef4444" strokeWidth="2" strokeDasharray="6 4" opacity="0.8" />
            <rect x={360} y={338} width={300} height={20} fill="rgba(239, 68, 68, 0.95)" rx="4" />
            <text x={510} y={352} textAnchor="middle" fill="white" fontSize="9" fontWeight="900" letterSpacing="0.5">
              ⛔ UPPER HAZARD BOUNDARY — DO NOT ENTER ⛔
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

/* ---- SVG Helpers ---- */

function ZoneRect({
  x,
  y,
  w,
  h,
  zoneId,
  fill,
  stroke,
  strokeWidth = 1.5,
  filter,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  zoneId: string;
  fill: string;
  stroke: string;
  strokeWidth?: number;
  filter?: string;
}) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      rx="6"
      className="zone-rect"
      data-zone={zoneId}
      filter={filter}
    />
  );
}

function ZoneLabel({
  x,
  y,
  text,
  size = "normal",
  color = "#f1f5f9",
  bold = false,
}: {
  x: number;
  y: number;
  text: string;
  size?: "normal" | "small";
  color?: string;
  bold?: boolean;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fill={color}
      fontSize={size === "small" ? "8.5" : "11"}
      fontWeight={bold ? "900" : size === "small" ? "500" : "700"}
      letterSpacing={size === "small" ? "0" : "0.5"}
    >
      {text}
    </text>
  );
}

function EmergencyExit({
  x,
  y,
  label,
  vertical = false,
  avoid = false,
}: {
  x: number;
  y: number;
  label: string;
  vertical?: boolean;
  avoid?: boolean;
}) {
  const bgColor = avoid ? "rgba(239, 68, 68, 0.2)" : "rgba(34, 197, 94, 0.15)";
  const strokeColor = avoid ? "#ef4444" : "#22c55e";
  const textColor = avoid ? "#fca5a5" : "#4ade80";

  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x={vertical ? -8 : -50}
        y={vertical ? -45 : -10}
        width={vertical ? 16 : 100}
        height={vertical ? 90 : 20}
        fill={bgColor}
        stroke={strokeColor}
        strokeWidth={1.2}
        rx="4"
      />
      <text
        x={0}
        y={vertical ? 0 : 3}
        textAnchor="middle"
        dominantBaseline="central"
        fill={textColor}
        fontSize="7"
        fontWeight="800"
        letterSpacing="0.5"
        transform={vertical ? "rotate(-90)" : undefined}
      >
        {avoid ? "⛔ " : "🚪 "}
        {label}
      </text>
    </g>
  );
}
