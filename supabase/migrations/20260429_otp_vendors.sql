-- OTP verifications table (used for 2FA)
CREATE TABLE IF NOT EXISTS otp_verifications (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier   text        NOT NULL,           -- email or phone
  persona      text        NOT NULL,
  otp_code     text        NOT NULL,
  method       text        NOT NULL,           -- sms | whatsapp | email | magic_link
  expires_at   timestamptz NOT NULL,
  verified_at  timestamptz,
  attempts     integer     NOT NULL DEFAULT 0,
  ip_address   text,
  role_data    jsonb,                          -- serialized MatchedRole for post-verification routing
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS otp_verif_identifier_idx ON otp_verifications (identifier, created_at DESC);

-- Vendors table (for vendor registration workflow)
CREATE TABLE IF NOT EXISTS vendors (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name    text        NOT NULL,
  contact_name    text,
  email           text,
  phone           text,
  service_type    text,
  license_number  text,
  status          text        NOT NULL DEFAULT 'pending',  -- pending | active | rejected
  associations    text[],                                  -- array of association_codes
  coi_on_file     boolean     NOT NULL DEFAULT false,
  ach_on_file     boolean     NOT NULL DEFAULT false,
  w9_on_file      boolean     NOT NULL DEFAULT false,
  notes           text,
  approved_by     uuid,                                    -- pmi_staff.id
  approved_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vendors_status_idx ON vendors (status, created_at DESC);
CREATE INDEX IF NOT EXISTS vendors_email_idx  ON vendors (email);

-- Real estate agents table (for agent registration workflow)
CREATE TABLE IF NOT EXISTS real_estate_agents (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       text        NOT NULL,
  email           text,
  phone           text,
  license_number  text,
  license_expiry  date,
  brokerage       text,
  status          text        NOT NULL DEFAULT 'pending',  -- pending | active | rejected
  associations    text[],
  notes           text,
  approved_by     uuid,
  approved_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS agents_status_idx ON real_estate_agents (status, created_at DESC);
CREATE INDEX IF NOT EXISTS agents_email_idx  ON real_estate_agents (email);
