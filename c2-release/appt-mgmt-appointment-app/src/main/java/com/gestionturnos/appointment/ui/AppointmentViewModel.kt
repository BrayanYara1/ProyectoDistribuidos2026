package com.gestionturnos.appointment.ui

import com.gestionturnos.appointment.domain.model.AppointmentModel
import com.gestionturnos.appointment.usecase.GetAppointmentsUseCase

class AppointmentViewModel(
    private val getAppointmentsUseCase: GetAppointmentsUseCase = GetAppointmentsUseCase()
) {
    fun loadAppointments(): List<AppointmentModel> {
        return getAppointmentsUseCase.execute()
    }
}
