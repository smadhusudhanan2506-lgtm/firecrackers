import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const supabase = createServiceClient();
      const { data, error } = await supabase
        .from("fire_events")
        .select("*, zones(*)")
        .order("detected_at", { ascending: false });

      if (!error && data) {
        return NextResponse.json({ events: data });
      }
    }

    return NextResponse.json({ events: [] });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { zone_id, event_type, severity } = body;

    if (!zone_id) {
      return NextResponse.json(
        { error: "Missing required field: zone_id" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      const supabase = createServiceClient();
      const { data, error } = await supabase
        .from("fire_events")
        .insert({
          zone_id,
          event_type: event_type || "smoke_detected",
          severity: severity || "critical",
          status: "active",
          detected_at: now,
        })
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ event: data });
      }
    }

    return NextResponse.json({
      event: {
        id: `evt-${Date.now()}`,
        zone_id,
        event_type: event_type || "smoke_detected",
        severity: severity || "critical",
        status: "active",
        detected_at: now,
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
