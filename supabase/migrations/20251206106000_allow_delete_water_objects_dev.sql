-- DEVELOPMENT: Temporarily allow DELETE on water_objects table for the anon role
-- WARNING: This policy is permissive and intended for local/dev testing only.
-- Remove or replace with proper authenticated/admin policies before deploying to production.

CREATE POLICY "Allow anonymous delete water objects (dev)"
  ON public.water_objects FOR DELETE
  TO anon
  USING (true);

-- You can later drop this policy with:
-- DROP POLICY "Allow anonymous delete water objects (dev)" ON public.water_objects;

COMMIT;
