import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sensorId, zoneId, smokeDetected, timestamp } = body;

    if (!sensorId || !zoneId || typeof smokeDetected !== "boolean") {
      return NextResponse.json(
        { error: "Missing required fields: sensorId, zoneId, smokeDetected" },
        { status: 400 }
      );
    }

    const now = timestamp || new Date().toISOString();

    if (isSupabaseConfigured()) {
      const supabase = createServiceClient();

      // 1. Record reading
      await supabase.from("sensor_readings").insert({
        sensor_id: sensorId,
        smoke_detected: smokeDetected,
        value: smokeDetected ? 1 : 0,
        timestamp: now,
      });

      // 2. Update sensor status
      await supabase
        .from("sensors")
        .update({
          status: smokeDetected ? "smoke_detected" : "normal",
          last_seen: now,
        })
        .eq("sensor_id", sensorId);

      if (smokeDetected) {
        const { data: existingEvents } = await supabase
          .from("fire_events")
          .select("id")
          .eq("zone_id", zoneId)
          .eq("status", "active");

        if (!existingEvents || existingEvents.length === 0) {
          // Set Mixing Area to danger (RED)
          await supabase
            .from("zones")
            .update({ status: "danger", updated_at: now })
            .eq("id", zoneId);

          // Set ALL Surrounding Rooms to caution (ORANGE)
          await supabase
            .from("zones")
            .update({ status: "caution", updated_at: now })
            .in("id", [
              "pressing-rolling",
              "raw-material-storage",
              "chemical-storage",
              "drying-area",
            ]);

          const { data: fireEvent } = await supabase
            .from("fire_events")
            .insert({
              zone_id: zoneId,
              event_type: "smoke_detected",
              severity: "critical",
              status: "active",
              detected_at: now,
            })
            .select()
            .single();

          if (fireEvent) {
            await supabase.from("alerts").insert({
              fire_event_id: fireEvent.id,
              message:
                "Fire detected in Mixing Area (RED)! All surrounding rooms (Raw Material, Chemical, Pressing, Drying) and adjacent pathways are in ORANGE (Spread Hazard). Evacuate via safe green corridors.",
              severity: "critical",
              acknowledged: false,
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      sensorId,
      zoneId,
      smokeDetected,
      timestamp: now,
      message: smokeDetected
        ? "Smoke detected — fire event created, all surrounding rooms in orange"
        : "Reading recorded — status normal",
    });
  } catch (error) {
    console.error("API error in /api/sensors/readings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
