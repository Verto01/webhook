
-- Up Migration

-- 1. Registered webhook destinations
CREATE TABLE endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    secret_encrypted TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Incoming events
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint_id UUID NOT NULL REFERENCES endpoints(id),
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    idempotency_key TEXT NOT NULL,
    payload_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT events_idempotency_unique
        UNIQUE (endpoint_id, idempotency_key)
);

-- 3. Delivery jobs
CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL UNIQUE REFERENCES events(id),
    endpoint_id UUID NOT NULL REFERENCES endpoints(id),
    status TEXT NOT NULL DEFAULT 'PENDING'
        CHECK (status IN (
            'PENDING', 'PROCESSING', 'DELIVERED', 'DEAD'
        )),
    attempt_count INTEGER NOT NULL DEFAULT 0
        CHECK (attempt_count >= 0),
    max_attempts INTEGER NOT NULL DEFAULT 5
        CHECK (max_attempts BETWEEN 1 AND 10),
    next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_attempt_count
        CHECK (attempt_count <= max_attempts)
);

-- 4. History of individual HTTP attempts
CREATE TABLE delivery_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id UUID NOT NULL REFERENCES deliveries(id),
    attempt_number INTEGER NOT NULL
        CHECK (attempt_number > 0),
    http_status INTEGER
        CHECK (http_status BETWEEN 100 AND 599),
    error_message TEXT,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_delivery_attempt
        UNIQUE (delivery_id, attempt_number)
);

-- Index for finding pending delivery jobs
CREATE INDEX idx_deliveries_pending ON deliveries (next_attempt_at, id) WHERE status = 'PENDING';

-- Down Migration

DROP TABLE IF EXISTS delivery_attempts;
DROP TABLE IF EXISTS deliveries;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS endpoints;
