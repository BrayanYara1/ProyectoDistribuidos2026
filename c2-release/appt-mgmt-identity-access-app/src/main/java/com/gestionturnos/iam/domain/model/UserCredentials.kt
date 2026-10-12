package com.gestionturnos.iam.domain.model

data class UserCredentials(
    val email: String,
    val token: String,
    val role: String
)
