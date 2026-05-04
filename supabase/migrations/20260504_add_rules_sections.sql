-- Add rules_sections to association_config so each association can store
-- the numbered topic list shown to applicants in the Rules & Regulations step.
ALTER TABLE public.association_config
  ADD COLUMN IF NOT EXISTS rules_sections jsonb;
