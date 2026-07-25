CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  email text NOT NULL CHECK (email = '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  budget_range text NOT NULL CHECK (budget_range IN ('under-5k','5k-25k','25k-100k','100k+')),
  message text NOT NULL CHECK (char_length(message) BETWEEN 10 AND 2000),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- No INSERT policy for anon/authenticated — the only writer is the
-- submit-lead Edge Function, which uses the service role key and
-- bypasses RLS entirely. Public/authenticated clients get zero write access.

-- Only authenticated admins can view leads
DROP POLICY IF EXISTS "admin_select_leads" ON leads;
CREATE POLICY "admin_select_leads"
ON leads FOR SELECT
TO authenticated
USING (true);

-- Only authenticated admins can update lead status
DROP POLICY IF EXISTS "admin_update_leads" ON leads;
CREATE POLICY "admin_update_leads"
ON leads FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (
  status IN ('new','contacted','closed')
  AND char_length(name) BETWEEN 1 AND 100
  AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND budget_range IN ('under-5k','5k-25k','25k-100k','100k+')
  AND char_length(message) BETWEEN 10 AND 2000
);

CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads (status);