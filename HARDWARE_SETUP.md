# 🔌 SafetyNet — ESP32 Hardware Integration Guide

Complete guide for connecting your **ESP32**, **MQ-2 Smoke Sensor**, **Buzzer**, **Red LED**, and **Green LED** to the live SafetyNet cloud system.

---

## 📦 1. Required Components

| Component | Description | Quantity |
|---|---|:---:|
| **ESP32 Dev Module** | Microcontroller with built-in Wi-Fi | 1 |
| **MQ-2 / MQ-135 Sensor** | Smoke & Flammable Gas Sensor | 1 |
| **Buzzer** | Active / Piezo Buzzer (5V / 3.3V) | 1 |
| **Red LED** | Danger / Fire Alarm Indicator | 1 |
| **Green LED** | Safe / Normal Status Indicator | 1 |
| **Resistors (220Ω - 330Ω)** | Current limiting for LEDs | 2 |
| **Female-to-Male (F-M) Wires** | For connecting MQ-2 & Buzzer | ~6 |
| **Male-to-Male (M-M) Wires** | For Breadboard connections | ~6 |
| **Breadboard & Micro USB Cable** | For assembly and powering ESP32 | 1 each |

---

## 📍 2. Pinout & Jumper Wire Connections

### 🟢 A. MQ-2 Smoke Sensor Connection (Use F-M Wires):
| MQ-2 Pin | Wire Type | ESP32 Pin | Note |
|---|:---:|---|---|
| **VCC** | F-M Wire | **VIN** (5V) or **3V3** | Power supply |
| **GND** | F-M Wire | **GND** | Ground |
| **A0** (Analog Out) | F-M Wire | **GPIO 34** | Analog ADC reading (0 - 4095) |

---

### 🔊 B. Buzzer Connection (Use F-M / M-M Wires):
| Buzzer Pin | Wire Type | ESP32 Pin | Note |
|---|:---:|---|---|
| **Positive (+ / Long leg)** | F-M / M-M Wire | **GPIO 25** | Trigger pin for alarm |
| **Negative (- / Short leg)** | F-M / M-M Wire | **GND** | Ground |

---

### 🔴 C. Red LED (Fire Alert Indicator):
| Red LED Pin | Wire Type | Connection | Note |
|---|:---:|---|---|
| **Anode (+ / Long leg)** | M-M Wire | **220Ω Resistor ➡️ GPIO 26** | Lights up when fire is detected |
| **Cathode (- / Short leg)** | M-M Wire | **GND** | Ground |

---

### 🟢 D. Green LED (Normal Safe Indicator):
| Green LED Pin | Wire Type | Connection | Note |
|---|:---:|---|---|
| **Anode (+ / Long leg)** | M-M Wire | **220Ω Resistor ➡️ GPIO 27** | Lights up when system is safe |
| **Cathode (- / Short leg)** | M-M Wire | **GND** | Ground |

---

## 🗺️ 3. Complete Circuit Diagram

```
       ┌───────────────────────────────┐
       │             ESP32             │
       │                               │
       │   [VIN] ──────────────────────┼──────── VCC (MQ-2 Sensor)
       │   [GND] ──────────────────────┼──────── GND (MQ-2, Buzzer, LEDs)
       │                               │
       │   [GPIO 34] ──────────────────┼──────── A0  (MQ-2 Analog Output)
       │   [GPIO 25] ──────────────────┼──────── (+) (Buzzer Alarm)
       │   [GPIO 26] ──[220Ω]──────────┼──────── (+) (RED LED — Fire)
       │   [GPIO 27] ──[220Ω]──────────┼──────── (+) (GREEN LED — Safe)
       └───────────────────────────────┘
```

---

## 💻 4. Step-by-Step Arduino IDE Setup

### Step 1: Open Arduino IDE
1. In Arduino IDE, go to **Tools** -> **Board** -> **ESP32 Arduino** -> Select **ESP32 Dev Module** (or your board variant).
2. Go to **Tools** -> **Port** -> Select the COM Port of your plugged-in ESP32.

### Step 2: Open the Code
Open the file:
📂 **[`hardware/esp32_safetynet.ino`](file:///c:/Users/HP/Desktop/firecracker/hardware/esp32_safetynet.ino)**

### Step 3: Enter Your Wi-Fi Name & Password
In lines 28-29, change:
```cpp
const char* ssid     = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";
```

### Step 4: Verify Backend Server URL
The code is already pre-configured to your Render backend:
```cpp
const char* serverUrl = "https://firecrackers-backend.onrender.com/api/sensors/readings";
```

### Step 5: Click Upload (➡️)
1. Click the **Upload** button in Arduino IDE.
2. If your ESP32 board requires it, hold down the **BOOT** button on the ESP32 while it says `"Connecting......"` until uploading begins.
3. Open **Serial Monitor** at **`115200` baud rate** to view real-time logs!

---

## ⚡ 5. How the Live System Operates

1. **🟢 Safe State (No Smoke)**:
   * **Green LED** is ON 🟢.
   * **Red LED** is OFF, **Buzzer** is SILENT.
   * ESP32 sends telemetry to the cloud every 3 seconds.
   * Dashboard shows `SYSTEM NORMAL` and `ALL ZONES SAFE`.

2. **🔴 Fire Triggered (Lighter gas / Smoke near MQ-2)**:
   * **Green LED** turns OFF.
   * **Red LED** starts flashing 🔴.
   * **Buzzer** sounds rapid alarm beeps 🔊!
   * ESP32 immediately posts `smokeDetected: true` to the backend.
   * **Every screen worldwide (laptops, phones, tablets) instantly flashes RED in the Mixing Area, ORANGE in surrounding rooms, and displays animated GREEN evacuation pathways!**
