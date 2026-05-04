-- Add occupants list, married couple flag, rules agreement timestamp, and e-signature
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS is_married_couple boolean,
  ADD COLUMN IF NOT EXISTS occupants jsonb,
  ADD COLUMN IF NOT EXISTS rules_agreed_at timestamptz,
  ADD COLUMN IF NOT EXISTS rules_signature text;
