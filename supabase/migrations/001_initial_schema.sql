-- AgriTrace Initial Schema
-- Run this against your Supabase PostgreSQL instance

-- ─────────────────────────────────────────
-- Extensions
-- ─────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────
-- AGGREGATORS (tenants)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS aggregators (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  company_name           TEXT NOT NULL,
  nepc_reg               TEXT,
  state                  TEXT NOT NULL,
  lga                    TEXT,
  phone                  TEXT,
  subscription_tier      TEXT NOT NULL DEFAULT 'trial'
    CHECK (subscription_tier IN ('trial', 'starter', 'growth', 'enterprise')),
  subscription_status    TEXT NOT NULL DEFAULT 'active'
    CHECK (subscription_status IN ('active', 'expired', 'cancelled')),
  subscription_ends_at   TIMESTAMPTZ,
  paystack_customer_code TEXT,
  paystack_sub_code      TEXT,
  monthly_batch_count    INTEGER NOT NULL DEFAULT 0,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- FARMERS (end users, free tier via WhatsApp)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS farmers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_number  TEXT UNIQUE NOT NULL,  -- E.164 e.g. +2348012345678
  full_name        TEXT NOT NULL,
  state            TEXT NOT NULL,
  lga              TEXT NOT NULL,
  farm_size_ha     NUMERIC(8, 2),
  crop_types       TEXT[] NOT NULL DEFAULT '{}',
  lang_pref        TEXT NOT NULL DEFAULT 'ha'
    CHECK (lang_pref IN ('ha', 'en')),
  onboarded_by     UUID REFERENCES aggregators(id) ON DELETE SET NULL,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- HARVEST BATCHES (core traceability unit)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS harvest_batches (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id        UUID REFERENCES farmers(id) ON DELETE RESTRICT NOT NULL,
  aggregator_id    UUID REFERENCES aggregators(id) ON DELETE RESTRICT,
  crop_type        TEXT NOT NULL
    CHECK (crop_type IN ('sesame', 'cowpea', 'groundnut', 'castor_seed', 'dried_ginger', 'other')),
  quantity_kg      NUMERIC(10, 2) NOT NULL CHECK (quantity_kg > 0),
  quality_grade    TEXT CHECK (quality_grade IN ('A', 'B', 'C')),
  harvest_date     DATE NOT NULL,
  destination      TEXT,
  batch_ref        TEXT UNIQUE NOT NULL,   -- e.g. KAT-SES-20260415-001
  qr_payload_hash  TEXT NOT NULL,          -- SHA-256 of canonical batch data
  qr_storage_path  TEXT,                   -- Supabase Storage path
  purchase_price   NUMERIC(12, 2),         -- price paid to farmer (NGN)
  status           TEXT NOT NULL DEFAULT 'at_farm'
    CHECK (status IN ('at_farm', 'in_transit', 'at_aggregator', 'processing', 'exported', 'sold')),
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- TRANSFER EVENTS (append-only chain of custody)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transfer_events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id         UUID REFERENCES harvest_batches(id) ON DELETE RESTRICT NOT NULL,
  from_party       TEXT,                   -- NULL for initial farm origin
  to_party         TEXT NOT NULL,
  handler_type     TEXT NOT NULL
    CHECK (handler_type IN ('farmer', 'transporter', 'aggregator', 'processor', 'exporter', 'buyer')),
  location         TEXT,
  notes            TEXT,
  event_hash       TEXT NOT NULL,          -- SHA-256(batch_id||prev_hash||recorded_at||handler)
  prev_event_hash  TEXT,                   -- NULL for first transfer
  recorded_via     TEXT NOT NULL DEFAULT 'whatsapp'
    CHECK (recorded_via IN ('whatsapp', 'dashboard', 'api')),
  recorded_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prevent updates and deletes on transfer_events to preserve immutability
CREATE OR REPLACE RULE no_update_transfer_events AS
  ON UPDATE TO transfer_events DO INSTEAD NOTHING;

CREATE OR REPLACE RULE no_delete_transfer_events AS
  ON DELETE TO transfer_events DO INSTEAD NOTHING;

-- ─────────────────────────────────────────
-- MARKET PRICES (commodity price intelligence)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS market_prices (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commodity         TEXT NOT NULL
    CHECK (commodity IN ('sesame', 'cowpea', 'groundnut', 'castor_seed', 'dried_ginger')),
  market_location   TEXT NOT NULL,          -- e.g. 'Kano-Dawanau', 'Lagos-Mile12'
  price_ngn_per_kg  NUMERIC(10, 2) NOT NULL CHECK (price_ngn_per_kg > 0),
  source            TEXT NOT NULL DEFAULT 'crowdsourced'
    CHECK (source IN ('crowdsourced', 'commodity_ng', 'lcfe', 'world_bank', 'manual')),
  is_international  BOOLEAN NOT NULL DEFAULT FALSE,
  currency          TEXT NOT NULL DEFAULT 'NGN',
  submitted_by      UUID REFERENCES aggregators(id) ON DELETE SET NULL,
  recorded_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- EXPORT DOCUMENTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS export_documents (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregator_id    UUID REFERENCES aggregators(id) ON DELETE CASCADE NOT NULL,
  batch_ids        UUID[] NOT NULL,
  doc_type         TEXT NOT NULL
    CHECK (doc_type IN ('certificate_of_origin', 'phytosanitary', 'aflatoxin_compliance', 'batch_manifest')),
  generated_pdf_path TEXT,                 -- Supabase Storage path
  status           TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'generated', 'submitted', 'approved')),
  buyer_name       TEXT,
  destination_country TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- PURCHASE RECEIPTS (digital receipts for farmers)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchase_receipts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregator_id    UUID REFERENCES aggregators(id) ON DELETE CASCADE NOT NULL,
  batch_id         UUID REFERENCES harvest_batches(id) ON DELETE RESTRICT NOT NULL,
  farmer_id        UUID REFERENCES farmers(id) ON DELETE RESTRICT NOT NULL,
  amount_ngn       NUMERIC(12, 2) NOT NULL,
  quantity_kg      NUMERIC(10, 2) NOT NULL,
  price_per_kg     NUMERIC(10, 2) NOT NULL,
  receipt_ref      TEXT UNIQUE NOT NULL,
  sent_via_whatsapp BOOLEAN NOT NULL DEFAULT FALSE,
  issued_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- WHATSAPP SESSIONS (conversation FSM state)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  phone_number     TEXT PRIMARY KEY,
  flow_state       TEXT NOT NULL DEFAULT 'IDLE',
  context_data     JSONB NOT NULL DEFAULT '{}',
  farmer_id        UUID REFERENCES farmers(id) ON DELETE SET NULL,
  aggregator_id    UUID REFERENCES aggregators(id) ON DELETE SET NULL,
  last_activity    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────
ALTER TABLE aggregators       ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE harvest_batches   ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_documents  ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_prices     ENABLE ROW LEVEL SECURITY;

-- Helper: get current aggregator id from JWT
CREATE OR REPLACE FUNCTION current_aggregator_id()
RETURNS UUID AS $$
  SELECT id FROM aggregators WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Aggregators: own row only
CREATE POLICY agg_self ON aggregators
  USING (user_id = auth.uid());

-- Farmers: visible to their onboarding aggregator
CREATE POLICY farmer_by_aggregator ON farmers
  USING (onboarded_by = current_aggregator_id());

-- Harvest batches: aggregator isolation
CREATE POLICY batch_by_aggregator ON harvest_batches
  USING (aggregator_id = current_aggregator_id());

-- Transfer events: readable if batch belongs to aggregator
CREATE POLICY transfer_by_aggregator ON transfer_events
  USING (
    batch_id IN (
      SELECT id FROM harvest_batches WHERE aggregator_id = current_aggregator_id()
    )
  );

-- Export documents: aggregator isolation
CREATE POLICY doc_by_aggregator ON export_documents
  USING (aggregator_id = current_aggregator_id());

-- Purchase receipts: aggregator isolation
CREATE POLICY receipt_by_aggregator ON purchase_receipts
  USING (aggregator_id = current_aggregator_id());

-- Market prices: readable by all authenticated users
CREATE POLICY prices_readable ON market_prices
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY prices_insert ON market_prices
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────
CREATE INDEX idx_farmers_whatsapp       ON farmers(whatsapp_number);
CREATE INDEX idx_farmers_aggregator     ON farmers(onboarded_by);
CREATE INDEX idx_batches_aggregator     ON harvest_batches(aggregator_id);
CREATE INDEX idx_batches_farmer         ON harvest_batches(farmer_id);
CREATE INDEX idx_batches_status         ON harvest_batches(status);
CREATE INDEX idx_batches_crop           ON harvest_batches(crop_type);
CREATE INDEX idx_transfers_batch        ON transfer_events(batch_id);
CREATE INDEX idx_prices_commodity_time  ON market_prices(commodity, recorded_at DESC);
CREATE INDEX idx_prices_location        ON market_prices(market_location);
CREATE INDEX idx_sessions_activity      ON whatsapp_sessions(last_activity);

-- ─────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_batches_updated
  BEFORE UPDATE ON harvest_batches
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
