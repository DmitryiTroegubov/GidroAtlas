-- Enable SELECT policies for water_objects (allow anyone to read)
-- This allows the frontend to fetch objects from the database

-- Check if policy already exists before creating
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'water_objects' AND policyname = 'Allow public read water objects'
  ) THEN
    CREATE POLICY "Allow public read water objects"
      ON water_objects FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

-- Enable INSERT policy for authenticated users to create new objects
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'water_objects' AND policyname = 'Allow authenticated insert water objects'
  ) THEN
    CREATE POLICY "Allow authenticated insert water objects"
      ON water_objects FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Verify seed data exists, insert if missing
INSERT INTO water_objects (name, region, resource_type, water_type, fauna, passport_date, technical_condition, latitude, longitude, priority)
VALUES
  ('Озеро Балхаш', 'Карагандинская область', 'lake', 'non-fresh', true, '2023-01-15', 3, 46.85180556, 74.36111111, 8),
  ('Озеро Каспий', 'Мангистауская область', 'lake', 'non-fresh', true, '2023-03-20', 4, 43.20000000, 51.50000000, 9),
  ('Канал Головной', 'Кызылординская область', 'canal', 'fresh', false, '2023-02-10', 2, 45.65000000, 61.90000000, 7),
  ('Водохранилище Чардара', 'Түркістан облысы', 'reservoir', 'fresh', true, '2023-04-05', 4, 46.43000000, 68.25000000, 8),
  ('Озеро Тенгиз', 'Ақмола облысы', 'lake', 'non-fresh', false, '2023-05-12', 3, 50.67000000, 69.43000000, 6)
ON CONFLICT DO NOTHING;

COMMIT;
