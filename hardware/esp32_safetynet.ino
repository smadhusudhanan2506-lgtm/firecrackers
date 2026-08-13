/*
 ============================================================================
  SAFETYNET — INDUSTRIAL FIRE DETECTION & EMERGENCY EVACUATION SYSTEM
  Hardware: ESP32 + MQ-2 Smoke Sensor + Buzzer + Red LED + Green LED
 ============================================================================
 
 Wiring Diagram:
  ---------------------------------------------------------
  Component          Pin on Component     Pin on ESP32
  ---------------------------------------------------------
  MQ-2 Smoke Sensor  VCC                  VIN (5V) or 3V3 (F-M wire)
  MQ-2 Smoke Sensor  GND                  GND             (F-M wire)
  MQ-2 Smoke Sensor  A0 (Analog Out)      GPIO 34 (ADC1)  (F-M wire)
  
  Buzzer             Positive (+)         GPIO 25         (M-M/F-M wire)
  Buzzer             Negative (-)         GND             (M-M/F-M wire)
  
  Red LED (Fire)     Anode (+) -> 220Ω    GPIO 26         (M-M/F-M wire)
  Red LED (Fire)     Cathode (-)          GND             (M-M/F-M wire)
  
  Green LED (Safe)   Anode (+) -> 220Ω    GPIO 27         (M-M/F-M wire)
  Green LED (Safe)   Cathode (-)          GND             (M-M/F-M wire)
 ============================================================================
*/

#include <WiFi.h>
#include <HTTPClient.h>

// 1. Wi-Fi Credentials (Enter your Wi-Fi name & password)
const char* ssid     = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";

// 2. SafetyNet Backend Server URL
// Render Cloud URL (or your local IP http://192.168.x.x:3001/api/sensors/readings)
const char* serverUrl = "https://firecrackers-backend.onrender.com/api/sensors/readings";

// 3. Hardware Pin Definitions
const int SMOKE_PIN  = 34; // MQ-2 Analog Pin (ADC1)
const int BUZZER_PIN = 25; // Active Buzzer Pin
const int RED_LED    = 26; // Red LED (Fire Alert)
const int GREEN_LED  = 27; // Green LED (Normal Safe)

// 4. Smoke Detection Threshold (Adjust based on sensor calibration, usually 350-500)
const int SMOKE_THRESHOLD = 400;

// Sensor & Timer Tracking
unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL = 3000; // Send readings every 3 seconds

bool previousSmokeState = false;

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Configure Hardware Pins
  pinMode(SMOKE_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(RED_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);

  // Initial State: Green LED ON, Red OFF, Buzzer OFF
  digitalWrite(GREEN_LED, HIGH);
  digitalWrite(RED_LED, LOW);
  digitalWrite(BUZZER_PIN, LOW);

  Serial.println("\n=============================================");
  Serial.println("  SAFETYNET ESP32 FIRE CONTROLLER STARTING   ");
  Serial.println("=============================================");

  // Connect to Wi-Fi
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 25) {
    delay(500);
    Serial.print(".");
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[SUCCESS] Wi-Fi Connected!");
    Serial.print("ESP32 IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[WARNING] Wi-Fi Connection Failed. Running in standalone local mode.");
  }
}

void loop() {
  // 1. Read Analog Value from MQ-2 Smoke Sensor (Range: 0 to 4095 on ESP32)
  int smokeValue = analogRead(SMOKE_PIN);
  bool smokeDetected = (smokeValue >= SMOKE_THRESHOLD);

  // 2. Local Hardware Alert Feedback
  if (smokeDetected) {
    // 🔥 FIRE DETECTED STATE
    digitalWrite(GREEN_LED, LOW);  // Turn off Green LED
    digitalWrite(RED_LED, HIGH);   // Turn on Red LED (Fire)
    
    // Sound Pulsing Alarm on Buzzer
    digitalWrite(BUZZER_PIN, HIGH);
    delay(100);
    digitalWrite(BUZZER_PIN, LOW);
    delay(100);

    Serial.print("🚨 [FIRE ALARM] Smoke Level Detected: ");
    Serial.print(smokeValue);
    Serial.println(" | Threshold: 400");
  } else {
    // 🟢 SAFE / NORMAL STATE
    digitalWrite(GREEN_LED, HIGH); // Green LED ON (Safe)
    digitalWrite(RED_LED, LOW);    // Red LED OFF
    digitalWrite(BUZZER_PIN, LOW); // Buzzer Silent
  }

  // 3. Send Telemetry Payload to Cloud Backend Server
  unsigned long currentTime = millis();
  
  // Send immediately if state changes OR every 3 seconds
  if ((smokeDetected != previousSmokeState) || (currentTime - lastSendTime >= SEND_INTERVAL)) {
    lastSendTime = currentTime;
    previousSmokeState = smokeDetected;

    if (WiFi.status() == WL_CONNECTED) {
      sendReadingToServer(smokeValue, smokeDetected);
    }
  }

  delay(200);
}

// Function to send JSON payload over HTTP POST to SafetyNet Backend
void sendReadingToServer(int value, bool detected) {
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");

  // Construct JSON Payload
  // Sensor ID: SMOKE-MIX-01 in Mixing Area
  String jsonPayload = "{";
  jsonPayload += "\"sensorId\":\"SMOKE-MIX-01\",";
  jsonPayload += "\"smokeValue\":" + String(value) + ",";
  jsonPayload += "\"smokeDetected\":" + String(detected ? "true" : "false") + ",";
  jsonPayload += "\"zoneId\":\"mixing-area\"";
  jsonPayload += "}";

  Serial.print("Sending to SafetyNet Cloud -> ");
  Serial.println(jsonPayload);

  int httpResponseCode = http.POST(jsonPayload);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.print("Server Response Code [");
    Serial.print(httpResponseCode);
    Serial.println("]: OK");
  } else {
    Serial.print("HTTP Error: ");
    Serial.println(httpResponseCode);
  }

  http.end();
}
