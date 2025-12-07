-- Create a function to calculate priority based on technical_condition and passport_date
CREATE OR REPLACE FUNCTION calculate_water_object_priority()
RETURNS TRIGGER AS $$
DECLARE
  age_years INTEGER;
BEGIN
  -- Calculate age in years from passport_date to now
  IF NEW.passport_date IS NOT NULL THEN
    age_years := FLOOR(EXTRACT(EPOCH FROM (NOW() - NEW.passport_date)) / (365.25 * 24 * 3600));
    -- Ensure age is not negative
    IF age_years < 0 THEN
      age_years := 0;
    END IF;
  ELSE
    age_years := 0;
  END IF;

  -- Calculate priority using the formula: (6 - technical_condition) * 3 + age_in_years
  NEW.priority := (6 - NEW.technical_condition) * 3 + age_years;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists (to avoid conflicts)
DROP TRIGGER IF EXISTS calculate_priority_on_insert ON public.water_objects;
DROP TRIGGER IF EXISTS calculate_priority_on_update ON public.water_objects;

-- Create trigger for INSERT
CREATE TRIGGER calculate_priority_on_insert
BEFORE INSERT ON public.water_objects
FOR EACH ROW
EXECUTE FUNCTION calculate_water_object_priority();

-- Create trigger for UPDATE
CREATE TRIGGER calculate_priority_on_update
BEFORE UPDATE ON public.water_objects
FOR EACH ROW
EXECUTE FUNCTION calculate_water_object_priority();

-- Update existing rows with null priority (recalculate for seed data)
UPDATE public.water_objects
SET priority = (6 - technical_condition) * 3 + 
  FLOOR(EXTRACT(EPOCH FROM (NOW() - passport_date)) / (365.25 * 24 * 3600))
WHERE priority IS NULL OR passport_date IS NOT NULL;

COMMIT;
