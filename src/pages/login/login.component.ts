import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../services/auth-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthServiceService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit() {
    this.errorMessage = null; // Clear any previous error messages

    // Check if the form is invalid (client-side validation)
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please enter a valid email and password.';
      // Mark all fields as touched to display built-in validation messages
      this.loginForm.markAllAsTouched();
      return; // Stop execution if the form is invalid
    }

    // If the form is valid, proceed with the login attempt
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {

        // console.log('Login successful:', response);
        this.router.navigate(['/']); // Navigate to the dashboard or home page
      },
      error: (error) => {

        this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
        console.error('Login error:', error);
      }
    });
  }
}
