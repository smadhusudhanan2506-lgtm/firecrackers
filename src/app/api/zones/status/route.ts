import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const supabase = createServiceClient();
      const { data, error } = await supabase
        .from("zones")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error && data && data.length > 0) {
        return NextResponse.json({ zones: data });
      }
    }

    return NextResponse.json({
      zones: [
        { id: "mixing-area", name: "Mixing Area", status: "safe" },
        { id: "raw-material-storage", name: "Raw Material Storage", status: "safe" },
        { id: "chemical-storage", name: "Chemical Storage", status: "safe" },
        { id: "pressing-rolling", name: "Pressing / Rolling Area", status: "safe" },
        { id: "drying-area", name: "Drying Area", status: "safe" },
        { id: "packing-area", name: "Packing Area", status: "safe" },
        { id: "finished-goods", name: "Finished Goods Storage", status: "safe" },
        { id: "quality-check", name: "Quality Check Area", status: "safe" },
        { id: "admin-control", name: "Admin / Control Room", status: "safe" },
        { id: "fusing-area", name: "Fusing Area", status: "safe" },
        { id: "testing-area", name: "Testing Area", status: "safe" },
      ],
    });
  } catch (error) {
    console.error("API error in /api/zones/status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
