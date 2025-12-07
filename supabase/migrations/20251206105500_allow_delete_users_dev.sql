-- DEVELOPMENT: Temporarily allow DELETE on users table for the anon role
-- WARNING: This policy is permissive and intended for local/dev testing only.
-- Remove or replace with proper authenticated/admin policies before deploying to production.

CREATE POLICY "Allow anonymous delete users (dev)"
  ON users FOR DELETE
  TO anon
  USING (true);

-- You can later drop this policy with:
-- DROP POLICY "Allow anonymous delete users (dev)" ON users;

COMMIT;
