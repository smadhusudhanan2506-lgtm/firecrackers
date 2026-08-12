"use client";

import { useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useSystem } from "@/context/RealtimeProvider";
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldAlert,
} from "lucide-react";
import type { Alert } from "@/lib/types";

export default function AlertsPage() {
  const { activeAlerts, isEmergency } = useSystem();
  const [allAlerts, setAllAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    try {
      const supabase = createClient();
      async function fetchAlerts() {
        const { data } = await supabase
          .from("alerts")
          .select("*, fire_events(*, zones(*))")
          .order("created_at", { ascending: false });
        if (data && data.length > 0) setAllAlerts(data);
      }
      fetchAlerts();

      const channel = supabase
        .channel("alerts-page")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "alerts" },
          () => fetchAlerts()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      // Ignore
    }
  }, []);

  const activeList = isEmergency && activeAlerts.length > 0 ? activeAlerts : allAlerts.filter((a) => !a.acknowledged);
  const resolvedList = allAlerts.filter((a) => a.acknowledged);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Alerts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Active and resolved emergency alerts
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-medium text-muted-foreground">
          <Bell className="w-3.5 h-3.5" />
          <span>
            {activeList.length} Active · {resolvedList.length} Resolved
          </span>
        </div>
      </div>

      {/* Active alerts */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Active Alerts
        </h2>
        {activeList.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-green-500/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No active alerts. All systems normal.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeList.map((alert) => (
              <AlertCard key={alert.id} alert={alert} active />
            ))}
          </div>
        )}
      </div>

      {/* Resolved alerts */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Resolved Alerts
        </h2>
        {resolvedList.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No resolved alerts in history.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {resolvedList.map((alert) => (
              <AlertCard key={alert.id} alert={alert} active={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AlertCard({ alert, active }: { alert: Alert; active: boolean }) {
  const time = new Date(alert.created_at || Date.now()).toLocaleString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      className={`border rounded-2xl p-5 transition-all ${
        active
          ? "bg-red-500/5 border-red-500/20 animate-danger-glow"
          : "bg-card border-border"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            active ? "bg-red-500/10" : "bg-muted"
          }`}
        >
          {active ? (
            <ShieldAlert className="w-5 h-5 text-red-500 animate-emergency-pulse" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={`text-sm font-bold ${active ? "text-red-400" : "text-foreground"}`}
            >
              {active ? "🔴 FIRE DETECTED" : "✅ Resolved"}
            </h3>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                alert.severity === "critical"
                  ? "bg-red-500/10 text-red-400"
                  : alert.severity === "high"
                    ? "bg-orange-500/10 text-orange-400"
                    : "bg-amber-500/10 text-amber-400"
              }`}
            >
              {alert.severity}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
            {alert.message}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>Mixing Area</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{time}</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>ID: {alert.id.slice(0, 8)}</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                active
                  ? "bg-red-500/10 text-red-400"
                  : "bg-green-500/10 text-green-400"
              }`}
            >
              {active ? "Active" : "Resolved"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
