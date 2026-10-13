INSERT INTO users (id, email, password_hash, name, role)
VALUES ('usr-1', 'doctor@hospital.com', '123456', 'Dr. Lopez', 'DOCTOR')
ON CONFLICT DO NOTHING;
