import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const supabase = createServiceClient();
      const { data, error } = await supabase
        .from("sensors")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error && data && data.length > 0) {
        return NextResponse.json({ sensors: data });
      }
    }

    // Default fallback
    return NextResponse.json({
      sensors: [
        {
          id: "sensor-smoke-mix-01",
          sensor_id: "SMOKE-MIX-01",
          type: "smoke",
          zone_id: "mixing-area",
          status: "normal",
          last_seen: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      ],
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
