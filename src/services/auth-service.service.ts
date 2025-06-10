import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { JwtHelperService } from '@auth0/angular-jwt'; // Make sure you have this installed: npm install @auth0/angular-jwt

interface RegistrationResponse {
  message: string;
  user: any; // Consider making this 'User' interface if it matches
  accessToken: string;
}

interface LoginResponse {
  message: string;
  user: any; // Consider making this 'User' interface if it matches
  accessToken: string;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  gender?: string;
  country_code?: number;
  date_of_birth?: Date;

}

// NEW: Interface for backend response after profile update
export interface UpdateUserBackendResponse {
  message: string;
  user: User; // Backend should return the updated user object
}

export interface User {
  id: string; // Changed to string, as IDs from backend are often strings (UUIDs)
  first_name: string;
  last_name: string;
  email: string;
  password?: string; // Password should typically not be stored or exposed on frontend
  gender: string;
  country_code: number;
  date_of_birth: Date; // Or string if you store it as ISO date string
  role_id: number;
  role_name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {
  private apiUrl = `http://localhost:5000/api/auth/v1`;
  private jwtHelper = new JwtHelperService(); // Initialize JwtHelperService


  private getAuthHeaders(): HttpHeaders { // Moved this helper here for consistency
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  constructor(private http: HttpClient, private router: Router) { }

  getUser(): User | null {
    const userString = localStorage.getItem('user');
    // Ensure the parsed user ID is a string for consistency with your backend/interfaces
    return userString ? JSON.parse(userString) as User : null;
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // NEW: Method to get the current user's ID
  getUserId(): string | null {
    const user = this.getUser();
    return user ? user.id : null; // Directly return the 'id' from the stored User object
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    // Check if token exists and is not expired
    return !!token && !this.isTokenExpired(token); // Pass token to isTokenExpired
  }

  public isTokenExpired(token: string): boolean { // Accept token as argument
    if (!token) return true;

    try {
      // Use jwtHelper to decode and check expiry
      return this.jwtHelper.isTokenExpired(token);
    } catch (error) {
      console.error('Token parsing failed:', error);
      return true; // Assume expired if parsing fails
    }
  }

  private storeToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  private storeUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  register(userData: any): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap((response: RegistrationResponse) => {
          this.storeToken(response.accessToken);
          // Assuming response.user has an 'id' property of type string
          this.storeUser(response.user as User);
        }),
      );
  }

  login(credentials: any): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          this.storeToken(response.accessToken);
          // Assuming response.user has an 'id' property of type string
          this.storeUser(response.user as User);
        }),
      );
  }

  logout(): void {
    this.http
      .post(
        `${this.apiUrl}/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.getToken()}`, // Attach the token for the backend to invalidate
          },
        },
      )
      .subscribe({
        next: (response) => {
          console.log('Logged out successfully', response);
        },
        error: (error) => {
          console.error('Logout error', error);
        },
        complete: () => {
          // Remove token and user data from localStorage after the logout is successful
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          this.router.navigate(['/']); // Navigate to Home page after logout
        },
      });
  }

  updateProfile(userId: string, userData: UpdateUserRequest): Observable<UpdateUserBackendResponse> {
    // Assuming your backend has a PUT endpoint like /api/auth/v1/users/:userId
    return this.http.put<UpdateUserBackendResponse>(`http://localhost:5000/api/users/update/${userId}`, userData, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(response => {
        // If the backend returns the updated user, update localStorage
        if (response.user) {
          this.storeUser(response.user);
        }
      })
    );
  }
}
