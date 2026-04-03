CREATE TABLE media_upload_objects (
    object_key VARCHAR(500) PRIMARY KEY,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    content_bytes BYTEA NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_media_upload_objects_created_at ON media_upload_objects(created_at DESC);
