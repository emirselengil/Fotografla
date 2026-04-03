ALTER TABLE events ALTER COLUMN couple_id DROP NOT NULL;

ALTER TABLE events ADD COLUMN access_code VARCHAR(12);

UPDATE events
SET access_code = UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', '') FROM 1 FOR 8))
WHERE access_code IS NULL;

ALTER TABLE events ALTER COLUMN access_code SET NOT NULL;
CREATE UNIQUE INDEX ux_events_access_code ON events(access_code);
