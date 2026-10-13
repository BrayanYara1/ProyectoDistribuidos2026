package com.gestionturnos.iam

import com.gestionturnos.iam.ui.LoginViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Test

class LoginViewModelTest {

    @Test
    fun login_withValidCredentials_returnsUserCredentials() {
        val viewModel = LoginViewModel()
        val credentials = viewModel.login("doctor@hospital.com", "123456")
        assertNotNull(credentials)
        assertEquals("doctor@hospital.com", credentials.email)
        assertEquals("DOCTOR", credentials.role)
    }

    @Test(expected = IllegalArgumentException::class)
    fun login_withEmptyEmail_throwsException() {
        val viewModel = LoginViewModel()
        viewModel.login("", "123456")
    }
}
