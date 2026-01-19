-- ==========================================
-- GidroAtlas Database Reconstruction Script
-- ==========================================

-- 1. Tables Creation
-- ------------------------------------------

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  login TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'guest' CHECK (role IN ('guest', 'expert')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Water Objects table
CREATE TABLE IF NOT EXISTS water_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('lake', 'canal', 'reservoir')),
  water_type TEXT NOT NULL CHECK (water_type IN ('fresh', 'non-fresh')),
  fauna BOOLEAN DEFAULT FALSE,
  passport_date DATE NOT NULL,
  technical_condition INTEGER NOT NULL CHECK (technical_condition BETWEEN 1 AND 5),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  pdf_url TEXT,
  priority INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hardware table
CREATE TABLE IF NOT EXISTS hardware (
  id SERIAL PRIMARY KEY,
  humidity FLOAT NOT NULL DEFAULT 0,
  temperature FLOAT NOT NULL DEFAULT 0,
  remote_control INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Triggers and Functions
-- ------------------------------------------

-- Priority calculation function
CREATE OR REPLACE FUNCTION calculate_water_object_priority()
RETURNS TRIGGER AS $$
DECLARE
  age_years INTEGER;
BEGIN
  IF NEW.passport_date IS NOT NULL THEN
    age_years := FLOOR(EXTRACT(EPOCH FROM (NOW() - NEW.passport_date)) / (365.25 * 24 * 3600));
    IF age_years < 0 THEN age_years := 0; END IF;
  ELSE
    age_years := 0;
  END IF;

  -- Formula: (6 - technical_condition) * 3 + age_in_years
  NEW.priority := (6 - NEW.technical_condition) * 3 + age_years;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Priority triggers
DROP TRIGGER IF EXISTS calculate_priority_on_insert ON water_objects;
CREATE TRIGGER calculate_priority_on_insert
  BEFORE INSERT ON water_objects
  FOR EACH ROW EXECUTE FUNCTION calculate_water_object_priority();

DROP TRIGGER IF EXISTS calculate_priority_on_update ON water_objects;
CREATE TRIGGER calculate_priority_on_update
  BEFORE UPDATE ON water_objects
  FOR EACH ROW EXECUTE FUNCTION calculate_water_object_priority();

-- 3. Row Level Security (RLS)
-- ------------------------------------------

ALTER TABLE water_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hardware ENABLE ROW LEVEL SECURITY;

-- Water Objects Policies
CREATE POLICY "Allow public read water objects" ON water_objects FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated users can insert water objects" ON water_objects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Experts can update water objects" ON water_objects FOR UPDATE TO authenticated 
  USING (current_setting('request.jwt.claims.role', true) = 'expert')
  WITH CHECK (current_setting('request.jwt.claims.role', true) = 'expert');
CREATE POLICY "Experts can delete water objects" ON water_objects FOR DELETE TO authenticated 
  USING (current_setting('request.jwt.claims.role', true) = 'expert');

-- Development fallback policies for Water Objects
CREATE POLICY "Allow anonymous insert into water_objects (dev)" ON water_objects FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous delete water objects (dev)" ON water_objects FOR DELETE TO anon USING (true);

-- Users Policies
CREATE POLICY "Allow anonymous insert into users (dev)" ON users FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous delete users (dev)" ON users FOR DELETE TO anon USING (true);
-- Note: You might want to add more restrictive policies for users in production.

-- Hardware Policies
CREATE POLICY "Allow SELECT hardware for all" ON hardware FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow UPDATE hardware for all" ON hardware FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow INSERT hardware for all" ON hardware FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 4. Seed Data
-- ------------------------------------------

INSERT INTO water_objects (name, region, resource_type, water_type, fauna, passport_date, technical_condition, latitude, longitude)
VALUES
  ('Озеро Балхаш', 'Карагандинская область', 'lake', 'non-fresh', true, '2023-01-15', 3, 46.85180556, 74.36111111),
  ('Озеро Каспий', 'Мангистауская область', 'lake', 'non-fresh', true, '2023-03-20', 4, 43.20000000, 51.50000000),
  ('Канал Головной', 'Кызылординская область', 'canal', 'fresh', false, '2023-02-10', 2, 45.65000000, 61.90000000),
  ('Водохранилище Чардара', 'Түркістан облысы', 'reservoir', 'fresh', true, '2023-04-05', 4, 46.43000000, 68.25000000),
  ('Озеро Тенгиз', 'Ақмола облысы', 'lake', 'non-fresh', false, '2023-05-12', 3, 50.67000000, 69.43000000)
ON CONFLICT DO NOTHING;

INSERT INTO hardware (id, humidity, temperature, remote_control) 
VALUES (1, 65.5, 22.3, 0)
ON CONFLICT (id) DO UPDATE
SET humidity = EXCLUDED.humidity, temperature = EXCLUDED.temperature, remote_control = EXCLUDED.remote_control;

-- Test Accounts
INSERT INTO users (login, password_hash, role)
VALUES 
  ('guest', 'guest123', 'guest'),
  ('expert', 'expert123', 'expert')
ON CONFLICT (login) DO NOTHING;
