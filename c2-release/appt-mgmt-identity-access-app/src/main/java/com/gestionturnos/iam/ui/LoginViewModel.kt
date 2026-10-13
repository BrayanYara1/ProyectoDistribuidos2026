package com.gestionturnos.iam.ui

import com.gestionturnos.iam.domain.model.UserCredentials
import com.gestionturnos.iam.usecase.LoginUseCase

class LoginViewModel(
    private val loginUseCase: LoginUseCase = LoginUseCase()
) {
    fun login(email: String, password: String): UserCredentials {
        return loginUseCase.execute(email, password)
    }
}
