-- DEVELOPMENT: Temporarily allow INSERT into water_objects for the anon role
-- WARNING: This policy is permissive and intended for local/dev testing only.
-- Remove or replace with proper authenticated policies before deploying to production.

CREATE POLICY "Allow anonymous insert into water_objects (dev)"
  ON water_objects FOR INSERT
  TO anon
  WITH CHECK (true);

-- You can later drop this policy with:
-- DROP POLICY "Allow anonymous insert into water_objects (dev)" ON water_objects;

COMMIT;
