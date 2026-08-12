"use client";

import { useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  History,
  Calendar,
  Clock,
  MapPin,
  Flame,
  CheckCircle2,
} from "lucide-react";
import type { FireEvent } from "@/lib/types";

export default function HistoryPage() {
  const [events, setEvents] = useState<FireEvent[]>([
    {
      id: "evt-sample-01",
      zone_id: "mixing-area",
      event_type: "smoke_detected",
      severity: "critical",
      status: "resolved",
      detected_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      resolved_at: new Date(Date.now() - 3600000 * 3.8).toISOString(),
    },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    try {
      const supabase = createClient();
      async function fetchEvents() {
        setLoading(true);
        const { data } = await supabase
          .from("fire_events")
          .select("*, zones(*)")
          .order("detected_at", { ascending: false });
        if (data && data.length > 0) setEvents(data);
        setLoading(false);
      }
      fetchEvents();

      const channel = supabase
        .channel("history-page")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "fire_events" },
          () => fetchEvents()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      setLoading(false);
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Event History</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Complete log of all fire detection events
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-medium text-muted-foreground">
          <History className="w-3.5 h-3.5" />
          <span>{events.length} events recorded</span>
        </div>
      </div>

      {/* Events table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center">
            <History className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No events recorded yet. Events will appear here after fire
              detection simulations or real sensor alerts.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">
                    Time
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">
                    Location
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">
                    Event
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">
                    Severity
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">
                    Resolved
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => {
                  const detected = new Date(event.detected_at);
                  const resolved = event.resolved_at
                    ? new Date(event.resolved_at)
                    : null;

                  return (
                    <tr
                      key={event.id}
                      className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {detected.toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-xs font-mono text-foreground">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span>
                            {detected.toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-xs">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="text-foreground font-medium">
                            Mixing Area
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Flame className="w-3 h-3 text-red-400" />
                          <span className="text-foreground">
                            {event.event_type === "smoke_detected"
                              ? "Smoke Detected"
                              : event.event_type}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            event.severity === "critical"
                              ? "bg-red-500/10 text-red-400"
                              : event.severity === "high"
                                ? "bg-orange-500/10 text-orange-400"
                                : "bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {event.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            event.status === "active"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-green-500/10 text-green-400"
                          }`}
                        >
                          {event.status === "active" ? (
                            <Flame className="w-2.5 h-2.5" />
                          ) : (
                            <CheckCircle2 className="w-2.5 h-2.5" />
                          )}
                          {event.status === "active" ? "Active" : "Resolved"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground font-mono">
                        {resolved
                          ? resolved.toLocaleString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "2-digit",
                              month: "short",
                            })
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
