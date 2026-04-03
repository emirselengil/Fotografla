INSERT INTO users (id, email, password_hash, full_name, phone_e164, role)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'salon@fotografla.local', crypt('12345', gen_salt('bf')), 'Eskisehir Dugun Salonu Yetkilisi', '+905551112233', 'salon_owner'),
    ('22222222-2222-2222-2222-222222222222', 'cift@fotografla.local', crypt('12345', gen_salt('bf')), 'Emir Selengil', '+905559998877', 'couple_admin');

INSERT INTO venues (id, owner_user_id, name, city, slug, monthly_plan_code, qr_status)
VALUES
    ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Eskisehir Dugun Salonu', 'Eskisehir', 'eskisehir-dugun-salonu', 'SALON_PRO', 'active');

INSERT INTO couples (id, primary_user_id, groom_name, bride_name, display_name)
VALUES
    ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Emir Selengil', 'Saliha Goray', 'Emir Selengil & Saliha Goray');

INSERT INTO venue_couple_links (id, venue_id, couple_id, relation_status)
VALUES
    ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'active');

INSERT INTO events (
    id,
    venue_id,
    couple_id,
    title,
    event_type,
    starts_at,
    ends_at,
    pax_planned,
    package_name,
    status,
    payment_status,
    contact_name,
    contact_phone_e164,
    contact_email,
    notes,
    photographer_needed,
    created_by_user_id
) VALUES (
    '66666666-6666-6666-6666-666666666666',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    'Emir Selengil & Saliha Goray',
    'dugun',
    NOW() - INTERVAL '1 hour',
    NOW() + INTERVAL '3 hours',
    187,
    'Salon Pro',
    'active',
    'approved',
    'Emir Selengil',
    '+905559998877',
    'emir@example.com',
    'Baseline aktif etkinlik kaydi',
    TRUE,
    '11111111-1111-1111-1111-111111111111'
);

INSERT INTO venue_qr_codes (
    id,
    venue_id,
    code_value,
    status,
    valid_from,
    valid_until,
    created_by_user_id
) VALUES (
    '77777777-7777-7777-7777-777777777777',
    '33333333-3333-3333-3333-333333333333',
    'eskisehir-dugun-salonu',
    'active',
    NOW() - INTERVAL '30 days',
    NULL,
    '11111111-1111-1111-1111-111111111111'
);
