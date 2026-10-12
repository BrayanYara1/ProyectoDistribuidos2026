package com.gestionturnos.appointment

import com.gestionturnos.appointment.ui.AppointmentViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Test

class AppointmentViewModelTest {

    @Test
    fun loadAppointments_returnsAppointmentsList() {
        val viewModel = AppointmentViewModel()
        val list = viewModel.loadAppointments()
        assertNotNull(list)
        assertEquals(2, list.size)
        assertEquals("Dr. Carlos Ruiz", list[0].doctorName)
    }
}
