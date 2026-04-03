CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('salon_owner', 'couple_admin', 'staff', 'guest');
CREATE TYPE event_status AS ENUM ('planned', 'active', 'completed', 'cancelled');
CREATE TYPE media_type AS ENUM ('photo', 'video');
CREATE TYPE payment_status AS ENUM ('pending', 'approved', 'rejected', 'refunded');
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'paused', 'canceled', 'past_due');
CREATE TYPE qr_status AS ENUM ('active', 'revoked', 'expired');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email CITEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone_e164 VARCHAR(20),
    role user_role NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(180) NOT NULL,
    city VARCHAR(100) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    monthly_plan_code VARCHAR(40) NOT NULL,
    qr_status qr_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE couples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_user_id UUID NOT NULL REFERENCES users(id),
    groom_name VARCHAR(120) NOT NULL,
    bride_name VARCHAR(120) NOT NULL,
    display_name VARCHAR(260) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE venue_couple_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES venues(id),
    couple_id UUID NOT NULL REFERENCES couples(id),
    relation_status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES venues(id),
    couple_id UUID NOT NULL REFERENCES couples(id),
    title VARCHAR(220) NOT NULL,
    event_type VARCHAR(20) NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    pax_planned INTEGER NOT NULL,
    package_name VARCHAR(50),
    status event_status NOT NULL,
    payment_status payment_status NOT NULL DEFAULT 'pending',
    contact_name VARCHAR(120),
    contact_phone_e164 VARCHAR(20),
    contact_email CITEXT,
    notes TEXT,
    photographer_needed BOOLEAN NOT NULL DEFAULT FALSE,
    created_by_user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_event_time CHECK (ends_at > starts_at),
    CONSTRAINT chk_event_pax CHECK (pax_planned BETWEEN 1 AND 5000)
);

CREATE TABLE venue_qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES venues(id),
    code_value VARCHAR(120) NOT NULL UNIQUE,
    status qr_status NOT NULL DEFAULT 'active',
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    revoked_reason VARCHAR(255),
    created_by_user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE guest_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES venues(id),
    event_id UUID REFERENCES events(id),
    qr_code_id UUID NOT NULL REFERENCES venue_qr_codes(id),
    guest_display_name VARCHAR(120),
    is_anonymous BOOLEAN NOT NULL DEFAULT TRUE,
    device_fingerprint_hash VARCHAR(128),
    ip_hash VARCHAR(128),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES venues(id),
    event_id UUID NOT NULL REFERENCES events(id),
    uploaded_by_guest_session_id UUID REFERENCES guest_sessions(id),
    uploaded_by_user_id UUID REFERENCES users(id),
    media_type media_type NOT NULL,
    storage_provider VARCHAR(30) NOT NULL,
    object_key VARCHAR(500) NOT NULL,
    original_filename VARCHAR(255),
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    width_px INTEGER,
    height_px INTEGER,
    duration_seconds NUMERIC(8,2),
    checksum_sha256 CHAR(64),
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    moderation_status VARCHAR(20) NOT NULL DEFAULT 'approved',
    captured_at TIMESTAMPTZ,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_media_uploader_oneof CHECK (
        uploaded_by_guest_session_id IS NOT NULL OR uploaded_by_user_id IS NOT NULL
    )
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES venues(id),
    plan_code VARCHAR(40) NOT NULL,
    status subscription_status NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES subscriptions(id),
    event_id UUID REFERENCES events(id),
    provider VARCHAR(30) NOT NULL,
    provider_txn_id VARCHAR(120) NOT NULL UNIQUE,
    amount_minor INTEGER NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'TRY',
    status payment_status NOT NULL,
    approved_at TIMESTAMPTZ,
    payload_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_payment_target_oneof CHECK (
        subscription_id IS NOT NULL OR event_id IS NOT NULL
    )
);

CREATE TABLE event_metrics_daily (
    id BIGSERIAL PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES events(id),
    metric_date DATE NOT NULL,
    guest_count INTEGER NOT NULL DEFAULT 0,
    photo_count INTEGER NOT NULL DEFAULT 0,
    video_count INTEGER NOT NULL DEFAULT 0,
    qr_scan_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_event_metrics_daily UNIQUE (event_id, metric_date)
);

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_user_id UUID REFERENCES users(id),
    actor_guest_session_id UUID REFERENCES guest_sessions(id),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    action VARCHAR(50) NOT NULL,
    metadata_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_users_role_active ON users(role, is_active);
CREATE INDEX ix_venues_owner ON venues(owner_user_id);
CREATE INDEX ix_venues_city ON venues(city);
CREATE INDEX ix_couples_user ON couples(primary_user_id);
CREATE INDEX ix_events_venue_status_start ON events(venue_id, status, starts_at DESC);
CREATE INDEX ix_events_couple ON events(couple_id, starts_at DESC);
CREATE INDEX ix_events_contact_email ON events(contact_email);
CREATE INDEX ix_venue_qr_venue_active ON venue_qr_codes(venue_id, status);
CREATE INDEX ix_guest_sessions_event_joined ON guest_sessions(event_id, joined_at DESC);
CREATE INDEX ix_guest_sessions_venue_joined ON guest_sessions(venue_id, joined_at DESC);
CREATE INDEX ix_media_event_uploaded ON media_assets(event_id, uploaded_at DESC);
CREATE INDEX ix_media_event_type ON media_assets(event_id, media_type, uploaded_at DESC);
CREATE INDEX ix_media_guest ON media_assets(uploaded_by_guest_session_id);
CREATE UNIQUE INDEX ux_media_checksum_per_event ON media_assets(event_id, checksum_sha256)
    WHERE checksum_sha256 IS NOT NULL;
CREATE INDEX ix_subscriptions_venue_status ON subscriptions(venue_id, status);
CREATE INDEX ix_subscriptions_period_end ON subscriptions(period_end);
CREATE INDEX ix_payment_event_status ON payment_transactions(event_id, status);
CREATE INDEX ix_audit_entity ON audit_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX ix_audit_actor_user ON audit_logs(actor_user_id, created_at DESC);
