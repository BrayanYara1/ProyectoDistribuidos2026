-- Migración 001: Estructura Inicial de Citas
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS notes TEXT;
