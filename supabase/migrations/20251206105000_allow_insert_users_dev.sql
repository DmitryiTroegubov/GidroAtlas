-- DEVELOPMENT: Temporarily allow INSERT into users table for the anon role
-- WARNING: This policy is permissive and intended for local/dev testing only.
-- Remove or replace with proper authenticated policies before deploying to production.

CREATE POLICY "Allow anonymous insert into users (dev)"
  ON users FOR INSERT
  TO anon
  WITH CHECK (true);

-- You can later drop this policy with:
-- DROP POLICY "Allow anonymous insert into users (dev)" ON users;

COMMIT;
