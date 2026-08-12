export type ZoneStatus = 'safe' | 'danger' | 'caution'
export type SensorStatus = 'normal' | 'smoke_detected' | 'offline'
export type EventStatus = 'active' | 'resolved'
export type Severity = 'low' | 'medium' | 'high' | 'critical'
export type UserRole = 'admin' | 'operator' | 'viewer'

export interface Profile {
  id: string
  name: string
  email: string
  role: UserRole
  created_at: string
}

export interface Zone {
  id: string
  name: string
  status: ZoneStatus
  map_position: {
    x: number
    y: number
    width: number
    height: number
  }
  created_at: string
  updated_at: string
}

export interface Sensor {
  id: string
  sensor_id: string
  type: string
  zone_id: string
  status: SensorStatus
  last_seen: string
  created_at: string
}

export interface SensorReading {
  id: string
  sensor_id: string
  smoke_detected: boolean
  value: number
  timestamp: string
}

export interface FireEvent {
  id: string
  zone_id: string
  event_type: string
  severity: Severity
  status: EventStatus
  detected_at: string
  resolved_at: string | null
  zones?: Zone
}

export interface Alert {
  id: string
  fire_event_id: string
  message: string
  severity: Severity
  acknowledged: boolean
  created_at: string
  fire_events?: FireEvent
}

export interface ActivityLog {
  id: string
  user_id: string | null
  action: string
  details: Record<string, unknown>
  created_at: string
}
