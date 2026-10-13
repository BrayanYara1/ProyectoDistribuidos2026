package com.gestionturnos.iam.usecase

import com.gestionturnos.iam.domain.model.UserCredentials

class LoginUseCase {
    fun execute(email: String, password: String): UserCredentials {
        if (email.isBlank() || password.isBlank()) {
            throw IllegalArgumentException("Email y contraseña obligatorios")
        }
        return UserCredentials(
            email = email,
            token = "jwt_mocked_token_2026",
            role = "DOCTOR"
        )
    }
}
