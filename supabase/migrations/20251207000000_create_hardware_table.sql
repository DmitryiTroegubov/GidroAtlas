-- Create hardware table for device sensors and control
CREATE TABLE IF NOT EXISTS hardware (
  id SERIAL PRIMARY KEY,
  humidity FLOAT NOT NULL DEFAULT 0,
  temperature FLOAT NOT NULL DEFAULT 0,
  remote_control INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE hardware ENABLE ROW LEVEL SECURITY;

-- Policy: Allow SELECT for all authenticated users
CREATE POLICY "Allow SELECT hardware for authenticated" ON hardware
  FOR SELECT TO authenticated
  USING (true);

-- Policy: Allow UPDATE for authenticated users
CREATE POLICY "Allow UPDATE hardware for authenticated" ON hardware
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Allow INSERT for authenticated users
CREATE POLICY "Allow INSERT hardware for authenticated" ON hardware
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Development fallback policies (allow anon access)
CREATE POLICY "Allow SELECT hardware for anon (dev)" ON hardware
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Allow UPDATE hardware for anon (dev)" ON hardware
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow INSERT hardware for anon (dev)" ON hardware
  FOR INSERT TO anon
  WITH CHECK (true);

-- Insert sample data
INSERT INTO hardware (id, humidity, temperature, remote_control) VALUES
  (1, 65.5, 22.3, 0)
ON CONFLICT (id) DO UPDATE
SET humidity = EXCLUDED.humidity, temperature = EXCLUDED.temperature, remote_control = EXCLUDED.remote_control;

COMMIT;
