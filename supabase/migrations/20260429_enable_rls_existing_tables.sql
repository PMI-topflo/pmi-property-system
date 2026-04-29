-- Enable RLS on tables that were missing it.
-- All backend access goes through supabaseAdmin (service_role), which bypasses RLS automatically.
-- Policies added for consistency with the pattern on other tables.

ALTER TABLE pmi_staff             ENABLE ROW LEVEL SECURITY;
ALTER TABLE general_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_tickets         ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_pmi_staff" ON pmi_staff
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_general_conversations" ON general_conversations
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_email_logs" ON email_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_board_tickets" ON board_tickets
  FOR ALL TO service_role USING (true) WITH CHECK (true);
