import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthServiceService, User, UpdateUserRequest, UpdateUserBackendResponse } from '../../services/auth-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./profile-page.component.css']
})
export class ProfilePageComponent implements OnInit {
  currentUser: User | null = null;
  profileForm: FormGroup;
  isEditing: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthServiceService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      gender: ['', Validators.required],
      country_code: ['', [Validators.required, Validators.pattern(/^\d+$/)]], // Only digits
      date_of_birth: ['', Validators.required] // Will handle as 'YYYY-MM-DD' string
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.currentUser = this.authService.getUser();
    if (this.currentUser) {
      // Patch form with current user data
      this.profileForm.patchValue({
        first_name: this.currentUser.first_name,
        last_name: this.currentUser.last_name,
        email: this.currentUser.email,
        gender: this.currentUser.gender,
        country_code: this.currentUser.country_code,
        // Format date of birth for input[type="date"] if necessary
        date_of_birth: this.currentUser.date_of_birth ?
          new Date(this.currentUser.date_of_birth).toISOString().split('T')[0] : ''
      });
      this.profileForm.disable(); // Start in view mode
    } else {
      // If user is not found, redirect to login (or handle error)
      this.router.navigate(['/login']);
    }
  }

  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.profileForm.enable();
    } else {
      this.profileForm.disable();
      this.loadUserProfile(); // Re-load to reset form if cancelled
    }
    this.clearMessages();
  }

  onSubmit(): void {
    this.clearMessages();
    if (this.profileForm.invalid) {
      this.errorMessage = 'Please correct the highlighted errors.';
      this.profileForm.markAllAsTouched();
      return;
    }

    if (!this.currentUser || !this.currentUser.id) {
      this.errorMessage = 'User ID not found for profile update.';
      return;
    }

    const updatedData: UpdateUserRequest = this.profileForm.value;

    this.authService.updateProfile(this.currentUser.id, updatedData).subscribe({
      next: (response: UpdateUserBackendResponse) => {
        this.successMessage = response.message;
        // The service already stores the updated user in localStorage
        this.loadUserProfile(); // Re-load to update UI with new data and disable form
        this.isEditing = false;
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        console.error('Profile update failed:', err);
        this.errorMessage = err.error?.message || 'Failed to update profile. Please try again.';
        setTimeout(() => this.errorMessage = null, 5000);
      }
    });
  }

  clearMessages(): void {
    this.successMessage = null;
    this.errorMessage = null;
  }

  // Helper for form validation
  hasError(controlName: string, errorType: string): boolean | undefined {
    const control = this.profileForm.get(controlName);
    return control?.touched && control?.hasError(errorType);
  }
}
