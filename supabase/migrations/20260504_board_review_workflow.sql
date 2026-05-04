-- Board members per association
CREATE TABLE IF NOT EXISTS public.association_board_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  association_code text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  role text,
  sort_order integer DEFAULT 0,
  active boolean DEFAULT true,
  substitute_name text,
  substitute_email text,
  substitute_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Board config additions to association_config
ALTER TABLE public.association_config
  ADD COLUMN IF NOT EXISTS required_signatures integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS approval_letter_template text;

-- Per-application board review tokens
CREATE TABLE IF NOT EXISTS public.application_board_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id uuid NOT NULL,
  association_code text NOT NULL,
  board_member_name text NOT NULL,
  board_member_email text NOT NULL,
  token text UNIQUE NOT NULL,
  decision text,
  signature text,
  notes text,
  sent_at timestamptz DEFAULT now(),
  decided_at timestamptz
);

-- Enable RLS — all access goes through supabaseAdmin (service role) which bypasses RLS.
-- These tables must never be exposed to the anon/authenticated keys.
ALTER TABLE public.association_board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_board_reviews ENABLE ROW LEVEL SECURITY;
