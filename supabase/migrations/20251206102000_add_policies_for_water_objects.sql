-- Add RLS policies to allow authenticated inserts and restrict modifications

-- Allow authenticated users to INSERT into water_objects
CREATE POLICY "Authenticated users can insert water objects"
  ON water_objects FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to SELECT (already present), and allow authenticated users to UPDATE/DELETE only if they are experts.
-- This requires that the JWT contains a "role" claim matching 'expert'. If you don't have role in the JWT, consider mapping using users table or allowing authenticated for UPDATE during development.

-- UPDATE policy: only allow if JWT claim role = 'expert'
CREATE POLICY "Experts can update water objects"
  ON water_objects FOR UPDATE
  TO authenticated
  USING (current_setting('request.jwt.claims.role', true) = 'expert')
  WITH CHECK (current_setting('request.jwt.claims.role', true) = 'expert');

-- DELETE policy: only allow if JWT claim role = 'expert'
CREATE POLICY "Experts can delete water objects"
  ON water_objects FOR DELETE
  TO authenticated
  USING (current_setting('request.jwt.claims.role', true) = 'expert');

-- NOTE: If your auth JWT does not include a 'role' claim, the `current_setting('request.jwt.claims.role', true)` will return NULL.
-- In that case, either:
-- 1) Adjust your Supabase project's JWT custom claims to include user role, or
-- 2) Change the policies to check a users table join (e.g., EXISTS(SELECT 1 FROM users u WHERE u.login = current_setting('request.jwt.claims.user_login', true) AND u.role = 'expert'))
-- 3) Or, for quick local/dev testing, allow authenticated users to UPDATE/DELETE by setting the USING/ WITH CHECK to (true).

-- Development fallback (uncomment if needed):
-- CREATE POLICY "Authenticated can modify (dev)" ON water_objects FOR ALL TO authenticated USING (true) WITH CHECK (true);

COMMIT;
