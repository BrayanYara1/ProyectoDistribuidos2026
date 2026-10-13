package com.gestionturnos.appointment.domain.model

data class AppointmentModel(
    val id: String,
    val doctorName: String,
    val specialty: String,
    val dateTime: String,
    val status: String
)
