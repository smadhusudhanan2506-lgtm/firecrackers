"use client";

import { useEffect, useState } from "react";
import { useSystem } from "@/context/RealtimeProvider";
import {
  AlertTriangle,
  CheckCircle2,
  Wifi,
  WifiOff,
  Clock,
  MapPin,
  Menu,
} from "lucide-react";

interface TopBarProps {
  onMenuClick?: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { isEmergency, activeFireEvents, zones } = useSystem();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOnline(navigator.onLine);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const dangerZone = isEmergency
    ? zones.find((z) => z.id === activeFireEvents[0]?.zone_id)
    : null;

  return (
    <header className="sticky top-0 z-20 w-full">
      {/* Emergency banner across top if active */}
      {isEmergency && (
        <div className="emergency-banner px-4 py-2 flex items-center justify-center gap-3 text-white text-center shadow-lg">
          <AlertTriangle className="w-4 h-4 animate-emergency-pulse shrink-0" />
          <span className="text-xs sm:text-sm font-bold tracking-wide">
            🚨 FIRE DETECTED — {dangerZone?.name?.toUpperCase() || "MIXING AREA"}
          </span>
          <span className="text-xs font-medium opacity-90 hidden md:inline">
            | Evacuate along designated green routes immediately
          </span>
          <AlertTriangle className="w-4 h-4 animate-emergency-pulse shrink-0" />
        </div>
      )}

      {/* Main TopBar navigation */}
      <div className="bg-[#10141d]/95 backdrop-blur-md border-b border-[#1c2433] px-4 md:px-6 py-2.5">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Mobile hamburger & System Status */}
          <div className="flex items-center gap-3">
            {/* Hamburger for mobile */}
            <button
              onClick={onMenuClick}
              className="md:hidden p-1.5 rounded-lg bg-[#18202d] text-white hover:bg-[#202b3c] transition-colors cursor-pointer"
              title="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* System status pill */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isEmergency
                  ? "bg-red-500/15 text-red-400 border border-red-500/30 animate-danger-glow"
                  : "bg-green-500/15 text-green-400 border border-green-500/30"
              }`}
            >
              {isEmergency ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>EMERGENCY ACTIVE</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>SYSTEM NORMAL</span>
                </>
              )}
            </div>

            {/* Hazard location indicator */}
            {isEmergency && dangerZone && (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-semibold">
                <MapPin className="w-3 h-3" />
                <span>{dangerZone.name}</span>
              </div>
            )}
          </div>

          {/* Right: Connectivity & Time */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {/* Online/Offline */}
            <div className="hidden sm:flex items-center gap-1.5">
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-green-500" />
                  <span className="font-medium text-foreground">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-red-500" />
                  <span className="font-medium text-red-400">Offline</span>
                </>
              )}
            </div>

            {/* Live Clock */}
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="hidden sm:inline">
                {currentTime.toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <span className="font-mono font-semibold text-foreground">
                {currentTime.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
