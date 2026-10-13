INSERT INTO users (id, email, password_hash, name, role)
VALUES ('usr-1', 'medico@hospital.com', '123456', 'Dr. López', 'DOCTOR')
ON CONFLICT DO NOTHING;
