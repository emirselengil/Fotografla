-- Her salonda aynı anda yalnızca bir aktif QR kodu olabilir.
CREATE UNIQUE INDEX IF NOT EXISTS ux_venue_qr_codes_one_active_per_venue
    ON venue_qr_codes (venue_id)
    WHERE status = 'active';
