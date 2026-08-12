require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for Vercel frontend and hardware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "apikey"],
}));

app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey && !supabaseUrl.includes("placeholder")) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log("✅ Supabase client connected successfully");
} else {
  console.log("⚠️ Supabase credentials not found or using placeholder. Running in fallback mode.");
}

// -------------------------------------------------------------
// 1. Root & Health Check Endpoint
// -------------------------------------------------------------
app.get("/", (req, res) => {
  res.json({
    service: "SafetyNet Backend API",
    status: "online",
    timestamp: new Date().toISOString(),
    endpoints: [
      "POST /api/sensors/readings (ESP32 sensor payload)",
      "GET  /api/sensors/status",
      "GET  /api/zones/status",
      "POST /api/simulate (Trigger fire simulation)",
      "POST /api/fire-events/resolve (Reset emergency)",
      "GET  /api/health"
    ]
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// -------------------------------------------------------------
// 2. Hardware ESP32 Endpoint: Receive Sensor Readings
// -------------------------------------------------------------
app.post("/api/sensors/readings", async (req, res) => {
  try {
    const { sensorId, zoneId, smokeDetected, timestamp } = req.body;

    if (!sensorId || !zoneId || typeof smokeDetected !== "boolean") {
      return res.status(400).json({
        error: "Missing required fields: sensorId, zoneId, smokeDetected"
      });
    }

    const now = timestamp || new Date().toISOString();

    if (supabase) {
      // 1. Record reading in database
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
          // Set Mixing Area to RED (danger)
          await supabase
            .from("zones")
            .update({ status: "danger", updated_at: now })
            .eq("id", zoneId);

          // Set ALL Surrounding Rooms to ORANGE (caution)
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
                "Fire detected in Mixing Area (RED)! All surrounding rooms and adjacent pathways are at high spread risk (ORANGE). Evacuate immediately via safe green corridors.",
              severity: "critical",
              acknowledged: false,
            });
          }
        }
      }
    }

    return res.json({
      success: true,
      sensorId,
      zoneId,
      smokeDetected,
      timestamp: now,
      message: smokeDetected
        ? "Smoke detected — fire event created, surrounding rooms in orange"
        : "Reading recorded — status normal",
    });
  } catch (error) {
    console.error("Error in /api/sensors/readings:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// -------------------------------------------------------------
// 3. Sensor Status Endpoint
// -------------------------------------------------------------
app.get("/api/sensors/status", async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from("sensors").select("*, zones(*)");
      if (error) throw error;
      return res.json({ success: true, sensors: data });
    }
    return res.json({
      success: true,
      sensors: [{
        id: "sensor-smoke-mix-01",
        sensor_id: "SMOKE-MIX-01",
        type: "smoke",
        zone_id: "mixing-area",
        status: "normal",
        last_seen: new Date().toISOString()
      }]
    });
  } catch (error) {
    console.error("Error in /api/sensors/status:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// -------------------------------------------------------------
// 4. Zone Status Endpoint
// -------------------------------------------------------------
app.get("/api/zones/status", async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from("zones").select("*");
      if (error) throw error;
      return res.json({ success: true, zones: data });
    }
    return res.json({ success: true, message: "Local fallback mode" });
  } catch (error) {
    console.error("Error in /api/zones/status:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// -------------------------------------------------------------
// 5. Fire Simulation Endpoint
// -------------------------------------------------------------
app.post("/api/simulate", async (req, res) => {
  try {
    const now = new Date().toISOString();

    if (supabase) {
      // 1. Record reading
      await supabase.from("sensor_readings").insert({
        sensor_id: "SMOKE-MIX-01",
        smoke_detected: true,
        value: 1,
        timestamp: now,
      });

      // 2. Update sensor
      await supabase
        .from("sensors")
        .update({ status: "smoke_detected", last_seen: now })
        .eq("sensor_id", "SMOKE-MIX-01");

      // 3. Update zones: Mixing Area (RED), Surrounding Rooms (ORANGE)
      await supabase
        .from("zones")
        .update({ status: "danger", updated_at: now })
        .eq("id", "mixing-area");

      await supabase
        .from("zones")
        .update({ status: "caution", updated_at: now })
        .in("id", [
          "pressing-rolling",
          "raw-material-storage",
          "chemical-storage",
          "drying-area",
        ]);

      // 4. Create fire event
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

      if (fireEvent) {
        await supabase.from("alerts").insert({
          fire_event_id: fireEvent.id,
          message:
            "Fire detected in Mixing Area (RED)! All surrounding rooms and pathways are in ORANGE (Spread Hazard). Evacuate along green routes.",
          severity: "critical",
          acknowledged: false,
        });
      }
    }

    return res.json({
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
      message: "Fire simulation activated: Mixing Area (RED), Surrounding Areas (ORANGE)",
    });
  } catch (error) {
    console.error("Simulation error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// -------------------------------------------------------------
// 6. Resolve Emergency Endpoint
// -------------------------------------------------------------
app.post("/api/fire-events/resolve", async (req, res) => {
  try {
    const now = new Date().toISOString();

    if (supabase) {
      // 1. Resolve active fire events
      await supabase
        .from("fire_events")
        .update({ status: "resolved", resolved_at: now })
        .eq("status", "active");

      // 2. Acknowledge alerts
      await supabase
        .from("alerts")
        .update({ acknowledged: true })
        .eq("acknowledged", false);

      // 3. Reset all danger & caution zones to safe
      await supabase
        .from("zones")
        .update({ status: "safe", updated_at: now })
        .in("status", ["danger", "caution"]);

      // 4. Reset sensor
      await supabase
        .from("sensors")
        .update({ status: "normal", last_seen: now })
        .eq("status", "smoke_detected");
    }

    return res.json({
      success: true,
      message: "Emergency resolved successfully. All zones reset to SAFE.",
      resolved_at: now,
    });
  } catch (error) {
    console.error("Error in resolve:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 SafetyNet Backend Server running on port ${PORT}`);
});
