LeadDesk Mini
A full-stack lead-capture product with a public landing page and an
auth-protected admin dashboard. Visitors submit leads through a validated form;
admins sign in to search, review, and advance leads through a status pipeline
(New → Contacted → Closed).

Built with React, TypeScript, Vite, Tailwind CSS, Bolt Database (Postgres + Auth +
Edge Functions).

Features
Public side

Marketing landing page with a lead-capture form: name, email, budget range, message.
Client-side validation gives instant feedback before submission.
A deployed edge function performs independent server-side validation and writes to Postgres — the client cannot bypass it.
Success confirmation screen after a valid submission.
Admin side (/admin)

Email/password sign-in and sign-up (real Bolt Database Auth — no hardcoded credentials).
Protected route: unauthenticated visitors are redirected to login.
Lead list with live search across name, email, and message.
Status filter tabs (All / New / Contacted / Closed) with live counts.
One-click status toggle that cycles each lead through the pipeline.
Data Model
Single table, leads, in the public schema of the Bolt Database Postgres database.

Column	Type	Constraints
id	uuid	Primary key, default gen_random_uuid()
name	text	NOT NULL, length 1–100
email	text	NOT NULL, matches email regex
budget_range	text	NOT NULL, one of: under-5k, 5k-25k, 25k-100k, 100k+
message	text	NOT NULL, length 10–2000
status	text	NOT NULL, default new, one of: new, contacted, closed
created_at	timestamptz	NOT NULL, default now()
Indexes: created_at DESC (admin list ordering) and status (filtering).

Design notes

No user_id column — leads are inbound submissions, not user-owned records. The owner relationship is administrative: any authenticated admin manages all leads.
Email is not unique — the same person may submit multiple inquiries.
Budget and status are enum-style text columns enforced by CHECK constraints at the database level, so even direct inserts cannot set invalid values.
Row-Level Security (RLS)
RLS is enabled on leads and locked to four explicit policies:

Policy	Role	Permission	Notes
public_insert_leads	anon, authenticated	INSERT	Public visitors submit via the anon key. WITH CHECK re-validates all field constraints and forces status = 'new' — a public submitter cannot pre-set a different status.
admin_select_leads	authenticated	SELECT	Only signed-in admins can view leads. An anon-key request returns an empty list.
admin_update_leads	authenticated	UPDATE	Only signed-in admins can change a lead. WITH CHECK keeps status and field values valid.
(no public DELETE)	—	DELETE	Deletes are not exposed; data is append-only from the public side.
This separation is what makes the public form and the admin dashboard coexist
on one table safely.

Auth Approach
LeadDesk uses Bolt Database Auth with email/password — there are no hardcoded
credentials, custom auth tables, or magic links.

How sessions work

An admin enters email + password on /login (or creates an account on /signup).
Supabase's signInWithPassword validates against the auth.users table and returns a JWT access token plus a refresh token.
The Bolt Database JS client persists the session (in browser local storage) and auto-refreshes the token before it expires — no manual token handling.
On every authenticated request (reading/updating leads), the client sends the JWT in the Authorization header. Postgres evaluates the RLS policies against auth.uid() derived from that token.
onAuthStateChange keeps the React app's session state in sync; sign-out clears the session and the protected route redirects to login.
Why this is safe for a client to touch

Passwords are hashed by Bolt Database Auth — never stored in plaintext or in the app.
The frontend only ever holds the anon key (public, read-only by design); the service-role key lives only in the edge function's server environment.
Email confirmation is off so a new admin can sign up and reach the dashboard immediately; this is appropriate for a small-team internal tool.
Every protected action is enforced twice: once by RLS at the database, and once by the React protected route in the UI.
Server-Side Validation
The submit-lead edge function (Deno, deployed to Bolt Database) is the single
write path for public submissions. It validates every field independently of
the database and the client:

name: trimmed, length 1–100
email: trimmed, lowercased, regex-validated
budget_range: must be one of the four allowed values
message: trimmed, length 10–2000
status: forced to new (public submitters cannot choose it)
On failure it returns 422 with a per-field errors object, which the form
maps back onto the matching fields. On success it returns 201 with the
created lead. The database CHECK constraints are a second layer of defense
in case the function is ever bypassed.

Local Development

npm install
npm run dev       # start the dev server
npm run build     # production build (output in dist/)
npm run typecheck # TypeScript check
Environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are
pre-populated in .env.

Deployment
The app deploys to Bolt's free hosting tier (.bolt.host subdomain):

Click Publish in the top-right of the Bolt editor.
Bolt runs the production build and deploys to a free .bolt.host URL.
Open the URL in a fresh browser (no local state) to confirm.
A public/_redirects file is included so all client-side routes (/admin,
/login, /signup) resolve to index.html on the host — direct visits to
/admin load the SPA correctly instead of 404ing.

The Bolt Database backend (database, auth, edge function) is already provisioned and
runs independently of the frontend host, so it serves the deployed app exactly
as it serves the local dev server.

Verifying from a fresh browser
Open the deployed URL — the landing page loads.
Fill in the lead form and submit → success confirmation appears.
Go to /admin → redirected to login (no session).
Click "Create one" → sign up with any email + password (6+ chars).
Dashboard loads with the submitted lead visible.
Click the status badge → cycles New → Contacted → Closed.
Project Structure

src/
  components/
    LeadForm.tsx         # Public form with client-side validation
    ProtectedRoute.tsx   # Redirects unauthenticated users to /login
  context/
    AuthContext.tsx      # Bolt Database session state, signIn/signUp/signOut
  lib/
    supabase.ts          # Bolt Database client singleton
    validation.ts        # Shared field validation + budget labels
  pages/
    LandingPage.tsx      # Public marketing page + lead form
    AuthPage.tsx         # Login / signup (shared component)
    AdminPage.tsx        # Lead dashboard: search, filter, status toggle
  types/
    database.ts          # Lead, LeadStatus, BudgetRange types
supabase/
  functions/
    submit-lead/index.ts # Edge function: server-side validation + insert
    _shared/cors.ts      # Shared CORS headers
  migrations/
    create_leads_table.sql  # Table + RLS policies (reference copy)
public/
  _redirects             # SPA route fallback for the host
That's the complete README file at the project root. It documents the data model (the leads table with all columns, constraints, and indexes), the four RLS policies that secure public inserts versus admin access, the JWT-based Bolt Database auth flow, server-side validation rules, deployment steps, and the verification walkthrough.