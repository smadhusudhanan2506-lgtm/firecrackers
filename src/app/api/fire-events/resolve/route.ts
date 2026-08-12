import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      const supabase = createServiceClient();

      // 1. Resolve all active fire events
      await supabase
        .from("fire_events")
        .update({ status: "resolved", resolved_at: now })
        .eq("status", "active");

      // 2. Acknowledge all active alerts
      await supabase
        .from("alerts")
        .update({ acknowledged: true })
        .eq("acknowledged", false);

      // 3. Reset all danger & caution zones to safe
      await supabase
        .from("zones")
        .update({ status: "safe", updated_at: now })
        .in("status", ["danger", "caution"]);

      // 4. Reset sensor status
      await supabase
        .from("sensors")
        .update({ status: "normal", last_seen: now })
        .eq("status", "smoke_detected");

      // 5. Log the activity
      await supabase.from("activity_logs").insert({
        action: "emergency_resolved",
        details: { resolved_at: now },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Emergency resolved successfully. All zones reset to SAFE.",
      resolved_at: now,
    });
  } catch (error) {
    console.error("API error in /api/fire-events/resolve:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
