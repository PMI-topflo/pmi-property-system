-- Add docs_lease_url to applications so we can store the Supabase Storage
-- path of the lease/purchase agreement uploaded at the start of the form.
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS docs_lease_url text;
