-- ============================================================
-- SafetyNet — Database Schema
-- Run this SQL in your Supabase SQL Editor
-- ============================================================

-- 1. Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'operator' CHECK (role IN ('admin', 'operator', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Zones table
CREATE TABLE IF NOT EXISTS public.zones (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'safe' CHECK (status IN ('safe', 'danger', 'caution')),
  map_position JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Sensors table
CREATE TABLE IF NOT EXISTS public.sensors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'smoke',
  zone_id TEXT REFERENCES public.zones(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'normal' CHECK (status IN ('normal', 'smoke_detected', 'offline')),
  last_seen TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Sensor readings table
CREATE TABLE IF NOT EXISTS public.sensor_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id TEXT NOT NULL,
  smoke_detected BOOLEAN NOT NULL DEFAULT false,
  value REAL DEFAULT 0,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Fire events table
CREATE TABLE IF NOT EXISTS public.fire_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id TEXT REFERENCES public.zones(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL DEFAULT 'smoke_detected',
  severity TEXT NOT NULL DEFAULT 'critical' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- 6. Alerts table
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fire_event_id UUID REFERENCES public.fire_events(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'critical' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Activity logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fire_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Zones: anyone authenticated can read, service role can update
CREATE POLICY "Anyone can view zones" ON public.zones FOR SELECT USING (true);
CREATE POLICY "Service role can insert zones" ON public.zones FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update zones" ON public.zones FOR UPDATE USING (true);

-- Sensors: anyone can read
CREATE POLICY "Anyone can view sensors" ON public.sensors FOR SELECT USING (true);
CREATE POLICY "Service role can insert sensors" ON public.sensors FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update sensors" ON public.sensors FOR UPDATE USING (true);

-- Sensor readings: anyone can read, service role can insert
CREATE POLICY "Anyone can view sensor_readings" ON public.sensor_readings FOR SELECT USING (true);
CREATE POLICY "Service role can insert sensor_readings" ON public.sensor_readings FOR INSERT WITH CHECK (true);

-- Fire events: anyone can read
CREATE POLICY "Anyone can view fire_events" ON public.fire_events FOR SELECT USING (true);
CREATE POLICY "Service role can insert fire_events" ON public.fire_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update fire_events" ON public.fire_events FOR UPDATE USING (true);

-- Alerts: anyone can read
CREATE POLICY "Anyone can view alerts" ON public.alerts FOR SELECT USING (true);
CREATE POLICY "Service role can insert alerts" ON public.alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update alerts" ON public.alerts FOR UPDATE USING (true);

-- Activity logs: anyone can read
CREATE POLICY "Anyone can view activity_logs" ON public.activity_logs FOR SELECT USING (true);
CREATE POLICY "Service role can insert activity_logs" ON public.activity_logs FOR INSERT WITH CHECK (true);

-- ============================================================
-- Enable Realtime
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.zones;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fire_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_readings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sensors;

-- ============================================================
-- Auto-create profile on user signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'operator')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Auto-update updated_at for zones
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS zones_updated_at ON public.zones;
CREATE TRIGGER zones_updated_at
  BEFORE UPDATE ON public.zones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- Seed Data
-- ============================================================

-- Insert the Mixing Area zone
INSERT INTO public.zones (id, name, status, map_position)
VALUES ('mixing-area', 'Mixing Area', 'safe', '{"x": 420, "y": 40, "width": 380, "height": 180}')
ON CONFLICT (id) DO NOTHING;

-- Insert other zones for the factory layout
INSERT INTO public.zones (id, name, status, map_position) VALUES
  ('raw-material-storage', 'Raw Material Storage', 'safe', '{"x": 40, "y": 40, "width": 200, "height": 180}'),
  ('chemical-storage', 'Chemical Storage', 'safe', '{"x": 40, "y": 230, "width": 200, "height": 110}'),
  ('pressing-rolling', 'Pressing / Rolling Area', 'safe', '{"x": 300, "y": 230, "width": 380, "height": 110}'),
  ('drying-area', 'Drying Area', 'safe', '{"x": 700, "y": 40, "width": 180, "height": 300}'),
  ('packing-area', 'Packing Area', 'safe', '{"x": 40, "y": 470, "width": 200, "height": 110}'),
  ('finished-goods', 'Finished Goods Storage', 'safe', '{"x": 40, "y": 590, "width": 200, "height": 110}'),
  ('quality-check', 'Quality Check Area', 'safe', '{"x": 300, "y": 470, "width": 200, "height": 230}'),
  ('admin-control', 'Admin / Control Room', 'safe', '{"x": 510, "y": 470, "width": 200, "height": 230}'),
  ('fusing-area', 'Fusing Area', 'safe', '{"x": 760, "y": 470, "width": 180, "height": 110}'),
  ('testing-area', 'Testing Area', 'safe', '{"x": 760, "y": 590, "width": 180, "height": 110}')
ON CONFLICT (id) DO NOTHING;

-- Insert the smoke sensor
INSERT INTO public.sensors (sensor_id, type, zone_id, status, last_seen)
VALUES ('SMOKE-MIX-01', 'smoke', 'mixing-area', 'normal', now())
ON CONFLICT (sensor_id) DO NOTHING;
