ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS board_decision text,
  ADD COLUMN IF NOT EXISTS board_decided_at timestamptz,
  ADD COLUMN IF NOT EXISTS board_notes text;
