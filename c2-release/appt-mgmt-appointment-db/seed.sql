INSERT INTO specialties (name) VALUES ('General'), ('Cardiología'), ('Pediatría') ON CONFLICT DO NOTHING;

INSERT INTO appointments (id, patient_id, doctor_id, specialty, appointment_date, status)
VALUES ('appt-001', 'p-1', 'doc-10', 'General', NOW(), 'CONFIRMADO')
ON CONFLICT DO NOTHING;
