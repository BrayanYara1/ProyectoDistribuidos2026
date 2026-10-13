package com.gestionturnos.appointment.usecase

import com.gestionturnos.appointment.domain.model.AppointmentModel

class GetAppointmentsUseCase {
    fun execute(): List<AppointmentModel> {
        return listOf(
            AppointmentModel("1", "Dr. Carlos Ruiz", "Cardiología", "2026-04-10 09:00", "CONFIRMADO"),
            AppointmentModel("2", "Dra. María Gómez", "Pediatría", "2026-04-12 11:30", "SOLICITADO")
        )
    }
}
