package com.gestionturnos.appointment.usecase

import com.gestionturnos.appointment.domain.model.AppointmentModel

class GetAppointmentsUseCase {
    fun execute(): List<AppointmentModel> {
        return listOf(
            AppointmentModel("1", "Dr. Carlos Ruiz", "Cardiology", "2026-04-10 09:00", "CONFIRMED"),
            AppointmentModel("2", "Dra. Maria Gomez", "Pediatrics", "2026-04-12 11:30", "REQUESTED")
        )
    }
}
