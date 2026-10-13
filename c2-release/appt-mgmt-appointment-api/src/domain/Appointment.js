class Appointment {
  constructor({ id, patientId, doctorId, specialty, date, status = 'SOLICITADO' }) {
    if (!patientId || !doctorId || !date) {
      throw new Error('Datos requeridos de cita incompletos');
    }
    this.id = id || `appt-${Date.now()}`;
    this.patientId = patientId;
    this.doctorId = doctorId;
    this.specialty = specialty || 'General';
    this.date = date;
    this.status = status;
    this.createdAt = new Date().toISOString();
  }
}

module.exports = Appointment;
