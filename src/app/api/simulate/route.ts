import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      const supabase = createServiceClient();

      // 1. Record reading
      await supabase.from("sensor_readings").insert({
        sensor_id: "SMOKE-MIX-01",
        smoke_detected: true,
        value: 1,
        timestamp: now,
      });

      // 2. Update sensor status
      await supabase
        .from("sensors")
        .update({ status: "smoke_detected", last_seen: now })
        .eq("sensor_id", "SMOKE-MIX-01");

      // 3. Check for existing active events
      const { data: existing } = await supabase
        .from("fire_events")
        .select("id")
        .eq("zone_id", "mixing-area")
        .eq("status", "active");

      if (!existing || existing.length === 0) {
        // Set Mixing Area to danger (RED)
        await supabase
          .from("zones")
          .update({ status: "danger", updated_at: now })
          .eq("id", "mixing-area");

        // Set ALL surrounding rooms to caution (ORANGE)
        await supabase
          .from("zones")
          .update({ status: "caution", updated_at: now })
          .in("id", [
            "pressing-rolling",
            "raw-material-storage",
            "chemical-storage",
            "drying-area",
          ]);

        // Create fire event
        const { data: fireEvent } = await supabase
          .from("fire_events")
          .insert({
            zone_id: "mixing-area",
            event_type: "smoke_detected",
            severity: "critical",
            status: "active",
            detected_at: now,
          })
          .select()
          .single();

        // Create alert
        if (fireEvent) {
          await supabase.from("alerts").insert({
            fire_event_id: fireEvent.id,
            message:
              "Fire detected in Mixing Area! All surrounding rooms and adjacent pathways are at spread risk (ORANGE). Do not enter red/orange zones. Follow green evacuation routes.",
            severity: "critical",
            acknowledged: false,
          });
        }
      }

      await supabase.from("activity_logs").insert({
        action: "fire_simulation",
        details: { zone: "mixing-area", sensor: "SMOKE-MIX-01", timestamp: now },
      });
    }

    return NextResponse.json({
      success: true,
      zone: "mixing-area",
      surroundingZones: [
        "pressing-rolling",
        "raw-material-storage",
        "chemical-storage",
        "drying-area",
      ],
      smokeDetected: true,
      timestamp: now,
      message:
        "Fire simulation activated: Mixing Area (RED), All Surrounding Rooms & Paths (ORANGE)",
    });
  } catch (error) {
    console.error("Simulation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
