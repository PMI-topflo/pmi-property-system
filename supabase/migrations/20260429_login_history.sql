-- Login history table — records every OTP send and verify attempt
CREATE TABLE IF NOT EXISTS login_history (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  event         text        NOT NULL,           -- 'otp_sent' | 'otp_verified' | 'otp_failed'
  identifier    text        NOT NULL,           -- email or phone used
  persona       text,                           -- staff | owner | board | tenant
  association_code text,
  association_name text,
  method        text,                           -- sms | whatsapp | email
  ip_address    text,
  user_agent    text,
  success       boolean     NOT NULL DEFAULT false,
  failure_reason text,
  role_data     jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS login_history_created_idx   ON login_history (created_at DESC);
CREATE INDEX IF NOT EXISTS login_history_identifier_idx ON login_history (identifier, created_at DESC);
CREATE INDEX IF NOT EXISTS login_history_persona_idx   ON login_history (persona, created_at DESC);

ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_login_history" ON login_history
  FOR ALL TO service_role USING (true) WITH CHECK (true);
