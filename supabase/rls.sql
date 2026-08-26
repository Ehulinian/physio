-- Row Level Security for the therapist's tables.
--
-- ⚠️ RUN THIS ONLY AFTER SIGN-IN WORKS IN THE WEB APP.
--
-- Until then the app talks to Supabase anonymously, and the moment RLS is on,
-- an anonymous request matches no policy and reads nothing. The symptom is an
-- empty client list with no error — the query succeeds, it just returns zero
-- rows. That is RLS working correctly, not a bug.
--
-- Order of operations:
--   1. Run physioflow-mobile/supabase/schema.sql   (creates profiles + helpers)
--   2. Create your own account and make it a clinician (block A below)
--   3. Check you can sign in at /sign-in
--   4. Only then run block B

-- ═════════════════════════════════════════════════════════════════════════════
-- A. Promote your own account to clinician
-- ═════════════════════════════════════════════════════════════════════════════
-- Create the user first: Authentication → Add user. Then:

-- update public.profiles
-- set role = 'clinician', full_name = 'Erik Hulinian'
-- where id = (select id from auth.users where email = 'your@email.com');

-- Verify:
--   select u.email, p.role from auth.users u
--   join public.profiles p on p.id = u.id;


-- ═════════════════════════════════════════════════════════════════════════════
-- B. Enable RLS
-- ═════════════════════════════════════════════════════════════════════════════

alter table public.clients            enable row level security;
alter table public.notes              enable row level security;
alter table public.physio_assessments enable row level security;

-- clients ────────────────────────────────────────────────────────────────────
-- Clinicians see every client. A single-therapist practice does not need
-- per-therapist ownership yet; when it does, the change is a `clinician_id`
-- column on `clients` and `and clinician_id = auth.uid()` added here — the
-- application code does not change at all. That is the advantage of keeping
-- authorisation in the database.
--
-- A patient may read their OWN card: the mobile app shows their name, and
-- there is nothing sensitive in it that they do not already know.

drop policy if exists "clinicians manage clients" on public.clients;
create policy "clinicians manage clients" on public.clients
  for all
  using (public.current_role_name() = 'clinician')
  with check (public.current_role_name() = 'clinician');

drop policy if exists "patient reads own card" on public.clients;
create policy "patient reads own card" on public.clients
  for select using (id = public.current_client_id());

-- notes ──────────────────────────────────────────────────────────────────────
-- Clinician-only, deliberately. These are the therapist's working notes,
-- written in clinical shorthand and not addressed to the patient. "Query disc
-- herniation" means "consider and rule out"; read by the patient at 2am it
-- means something else entirely.
--
-- This is a product decision, not a legal one — under GDPR a patient has a
-- right to request their health record. That is a request process, which is a
-- different thing from streaming notes live into an app.

drop policy if exists "clinicians manage notes" on public.notes;
create policy "clinicians manage notes" on public.notes
  for all
  using (public.current_role_name() = 'clinician')
  with check (public.current_role_name() = 'clinician');

-- physio_assessments ─────────────────────────────────────────────────────────
-- Same reasoning. Sharing an individual assessment with a patient is a feature
-- to add on purpose (a `shared_with_patient` boolean plus one more policy),
-- not a default.

drop policy if exists "clinicians manage assessments" on public.physio_assessments;
create policy "clinicians manage assessments" on public.physio_assessments
  for all
  using (public.current_role_name() = 'clinician')
  with check (public.current_role_name() = 'clinician');


-- ═════════════════════════════════════════════════════════════════════════════
-- C. Prove it works
-- ═════════════════════════════════════════════════════════════════════════════
-- The SQL editor runs as superuser and bypasses RLS, so a plain SELECT here
-- proves nothing. Impersonate a patient instead:

-- begin;
--   set local role authenticated;
--   set local request.jwt.claims = '{"sub":"<a PATIENT auth.users.id>"}';
--
--   select count(*) from public.clients;            -- expect 1 (their own)
--   select count(*) from public.notes;              -- expect 0
--   select count(*) from public.physio_assessments; -- expect 0
--   select count(*) from public.pain_entries;       -- expect their own only
-- rollback;

-- Zero rows rather than an error is the correct result. RLS filters silently;
-- it does not announce that something was hidden.
