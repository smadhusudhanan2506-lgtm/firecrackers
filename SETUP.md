# SafetyNet — Setup & Documentation

## Smart Fire Detection & Emergency Evacuation System

> **DISCLAIMER**: SafetyNet is a college project prototype for educational and demonstration purposes only. It is NOT an industrial-certified fire safety system. Do not rely on this software for actual fire safety or emergency response.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Supabase Configuration](#2-supabase-configuration)
3. [Environment Variables](#3-environment-variables)
4. [Database Setup](#4-database-setup)
5. [Running the Application](#5-running-the-application)
6. [Simulation Mode](#6-simulation-mode)
7. [API Endpoints for ESP32](#7-api-endpoints-for-esp32)
8. [ESP32 Hardware Connection](#8-esp32-hardware-connection)
9. [Testing the Complete System](#9-testing-the-complete-system)

---

## 1. Prerequisites

- **Node.js** v18+ (tested on v24.14.0)
- **npm** v9+ (tested on v11.9.0)
- A **Supabase** account (free tier works)
- (Optional) **ESP32** + **MQ-2 Smoke Sensor** for hardware integration

---

## 2. Supabase Configuration

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **"New Project"**.
3. Name your project (e.g., `safetynet`).
4. Set a strong database password.
5. Choose a region closest to you.
6. Click **"Create new project"** and wait for provisioning.

### Get Your API Keys

1. Go to **Settings → API** in your Supabase dashboard.
2. Copy these three values:
   - **Project URL** (e.g., `https://xxxx.supabase.co`)
   - **anon/public key** (safe for browser)
   - **service_role key** (secret — server-side only)

### Enable Realtime

1. Go to **Database → Replication** in Supabase dashboard.
2. Enable replication for these tables:
   - `zones`
   - `fire_events`
   - `alerts`
   - `sensor_readings`
   - `sensors`

*(The schema SQL also enables this, but verify it in the dashboard.)*

### Create a User

1. Go to **Authentication → Users** in Supabase dashboard.
2. Click **"Add User" → "Create New User"**.
3. Enter an email and password (e.g., `admin@safetynet.io` / `admin123`).
4. This will be your login credential.

### (Optional) Set User Role to Admin

After the user is created and the `profiles` table exists:

1. Go to **Table Editor → profiles**.
2. Find your user row.
3. Change the `role` column from `operator` to `admin`.

---

## 3. Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...your-service-role-key
```

> ⚠️ **Never commit** the service role key to version control. It has full database access.

---

## 4. Database Setup

### Run the Schema SQL

1. Open your Supabase dashboard.
2. Go to **SQL Editor**.
3. Click **"New Query"**.
4. Copy the entire contents of `supabase/schema.sql` and paste it.
5. Click **"Run"**.

This will create:

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (name, role) |
| `zones` | Factory areas with status |
| `sensors` | Registered sensors |
| `sensor_readings` | Raw sensor data log |
| `fire_events` | Fire event records |
| `alerts` | Alert notifications |
| `activity_logs` | User action audit trail |

It also:
- Enables Row Level Security (RLS) on all tables
- Creates policies for read/write access
- Enables Realtime on key tables
- Seeds the Mixing Area zone and SMOKE-MIX-01 sensor
- Creates a trigger to auto-create profiles on user signup

---

## 5. Running the Application

```bash
# Install dependencies (already done if you cloned)
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You will be redirected to the **Login Page**. Enter the credentials you created in Supabase Auth.

---

## 6. Simulation Mode

SafetyNet includes a **Simulate Fire** button for demonstrating the full system without physical hardware.

### How It Works

1. Go to the **Dashboard** page.
2. Click the **"Simulate Fire"** button (red button, top right).
3. Confirm the simulation.
4. The system will:
   - Record a sensor reading (smoke detected)
   - Update the sensor status to `smoke_detected`
   - Set the Mixing Area zone to `danger`
   - Create a fire event
   - Create an alert
   - Update the UI in real-time:
     - Dashboard cards turn red
     - Top bar shows emergency banner
     - Live Map shows Mixing Area in red
     - Evacuation routes appear
     - Alert is created

### Resolving the Emergency

1. Click the **"Resolve Emergency"** button (green button).
2. Confirm the resolution.
3. The system will:
   - Mark fire events as resolved
   - Acknowledge alerts
   - Reset zones to safe
   - Reset sensor status
   - The event remains permanently in Event History

### Important

The simulation uses the **exact same backend logic** as the real ESP32 sensor. It calls the same `/api/sensors/readings` endpoint with `smokeDetected: true`. This ensures that demonstration behavior is identical to real hardware behavior.

---

## 7. API Endpoints for ESP32

### POST `/api/sensors/readings`

The primary endpoint for the ESP32 to send sensor data.

**Request:**

```json
POST /api/sensors/readings
Content-Type: application/json

{
  "sensorId": "SMOKE-MIX-01",
  "zoneId": "mixing-area",
  "smokeDetected": true,
  "timestamp": "2026-08-12T14:32:00.000Z"
}
```

**Response (success):**

```json
{
  "success": true,
  "message": "Smoke detected — fire event created"
}
```

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sensorId` | string | Yes | Unique sensor identifier |
| `zoneId` | string | Yes | Zone the sensor monitors |
| `smokeDetected` | boolean | Yes | `true` = smoke, `false` = clear |
| `timestamp` | string | No | ISO 8601 timestamp (defaults to now) |

### GET `/api/sensors/status`

Returns all sensor statuses.

### GET `/api/zones/status`

Returns all zone statuses.

### POST `/api/fire-events`

Create a fire event manually.

### POST `/api/fire-events/resolve`

Resolve all active fire events.

### POST `/api/simulate`

Trigger a fire simulation (same as ESP32 sending smoke detected).

---

## 8. ESP32 Hardware Connection

### Hardware Requirements

- **ESP32** development board (any variant with Wi-Fi)
- **MQ-2 Smoke Sensor** module
- Jumper wires
- USB cable for programming

### Wiring

| MQ-2 Pin | ESP32 Pin |
|----------|-----------|
| VCC | 3.3V or 5V |
| GND | GND |
| DO (Digital Out) | GPIO 4 (or any digital pin) |
| AO (Analog Out) | GPIO 34 (or any ADC pin) |

### Example ESP32 Arduino Code

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

// Wi-Fi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// SafetyNet server
const char* serverUrl = "http://YOUR_SERVER_IP:3000/api/sensors/readings";

// Sensor pin
const int smokePin = 4; // Digital pin for MQ-2

void setup() {
  Serial.begin(115200);
  pinMode(smokePin, INPUT);

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected! IP: " + WiFi.localIP().toString());
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    int smokeValue = digitalRead(smokePin);
    bool smokeDetected = (smokeValue == HIGH); // MQ-2 DO pin goes HIGH on smoke

    // Send reading to SafetyNet
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    String payload = "{";
    payload += "\"sensorId\":\"SMOKE-MIX-01\",";
    payload += "\"zoneId\":\"mixing-area\",";
    payload += "\"smokeDetected\":" + String(smokeDetected ? "true" : "false") + ",";
    payload += "\"timestamp\":\"" + getTimestamp() + "\"";
    payload += "}";

    int httpCode = http.POST(payload);

    if (httpCode > 0) {
      String response = http.getString();
      Serial.println("Response: " + response);
    } else {
      Serial.println("Error: " + String(httpCode));
    }

    http.end();
  }

  delay(5000); // Send reading every 5 seconds
}

String getTimestamp() {
  // Simple timestamp — for production, use NTP
  return "2026-01-01T00:00:00.000Z";
}
```

### Deploying for ESP32 Access

For the ESP32 to reach your SafetyNet server:

1. **Local network**: Run `npm run dev` and use your computer's local IP (e.g., `192.168.1.100:3000`).
2. **Production**: Deploy to Vercel or another host and use the public URL.

---

## 9. Testing the Complete System

### Step-by-Step Testing Procedure

1. **Start the server**: `npm run dev`
2. **Login**: Open browser → login with your Supabase credentials
3. **Verify Dashboard**: Check that all cards show "SAFE" / "NORMAL"
4. **Check Live Map**: Navigate to Live Safety Map — all zones should be green/neutral
5. **Simulate Fire**:
   - Click "Simulate Fire" on Dashboard
   - Confirm the dialog
   - Verify:
     - ✅ Dashboard shows "FIRE DETECTED"
     - ✅ Top bar shows red emergency banner
     - ✅ Live Map shows Mixing Area in RED
     - ✅ Evacuation routes (green dashed) appear
     - ✅ "DO NOT ENTER" message visible
     - ✅ Alerts page shows new active alert
     - ✅ Sensor page shows "SMOKE DETECTED"
6. **Check Evacuation**: Navigate to Evacuation page — step-by-step route should appear
7. **Resolve Emergency**:
   - Click "Resolve Emergency" on Dashboard
   - Confirm the dialog
   - Verify:
     - ✅ All cards return to "SAFE"
     - ✅ Emergency banner disappears
     - ✅ Map returns to normal
     - ✅ Alert moved to "Resolved"
8. **Check History**: Navigate to Event History — resolved event should be listed
9. **Multi-tab test**: Open two browser tabs, simulate in one, verify the other updates in real-time

### Testing with cURL (API)

```bash
# Simulate smoke detection (same as ESP32)
curl -X POST http://localhost:3000/api/sensors/readings \
  -H "Content-Type: application/json" \
  -d '{"sensorId":"SMOKE-MIX-01","zoneId":"mixing-area","smokeDetected":true}'

# Check sensor status
curl http://localhost:3000/api/sensors/status

# Check zone status
curl http://localhost:3000/api/zones/status

# Resolve emergency
curl -X POST http://localhost:3000/api/fire-events/resolve
```

---

## Project Structure

```
firecracker/
├── src/
│   ├── app/
│   │   ├── (dashboard)/          # Authenticated layout group
│   │   │   ├── layout.tsx        # Dashboard layout with sidebar
│   │   │   ├── dashboard/        # Main dashboard
│   │   │   ├── live-map/         # Interactive factory map
│   │   │   ├── sensors/          # Sensor monitoring
│   │   │   ├── alerts/           # Alert management
│   │   │   ├── evacuation/       # Evacuation routes
│   │   │   ├── history/          # Event history
│   │   │   ├── settings/         # System settings
│   │   │   └── users/            # User management (admin)
│   │   ├── api/                  # API routes
│   │   │   ├── sensors/readings/ # Sensor data endpoint
│   │   │   ├── sensors/status/   # Sensor status
│   │   │   ├── zones/status/     # Zone status
│   │   │   ├── fire-events/      # Fire events CRUD
│   │   │   └── simulate/         # Simulation trigger
│   │   ├── login/                # Login page
│   │   ├── globals.css           # Design system
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Root redirect
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx       # Navigation sidebar
│   │   │   └── TopBar.tsx        # Top bar with status
│   │   └── map/
│   │       ├── FactoryMap.tsx    # Interactive SVG map
│   │       └── MapLegend.tsx     # Map legend
│   ├── context/
│   │   └── RealtimeProvider.tsx  # Real-time state context
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts        # Browser Supabase client
│   │   │   └── server.ts        # Server Supabase client
│   │   └── types.ts             # TypeScript types
│   └── proxy.ts                 # Auth proxy (middleware)
├── supabase/
│   └── schema.sql               # Database schema + seed
├── .env.local                   # Environment variables
├── SETUP.md                     # This file
└── package.json
```

---

## Support

This is a college project. For issues:

1. Check the browser console for errors
2. Check the Supabase dashboard for database issues
3. Verify your `.env.local` values are correct
4. Ensure the schema SQL was run successfully
5. Check that Realtime is enabled on the required tables
