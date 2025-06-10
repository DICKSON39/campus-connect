// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthServiceService, User } from '../services/auth-service.service'; // Import User interface


@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthServiceService,
    private router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean {
    const isAuth = this.authService.isAuthenticated();
    const token = this.authService.getToken();

    // Get expected roles from route data
    // Ensure route.data['roles'] is an array of numbers (if role_id is number)
    const expectedRoles: number[] = route.data['roles'];
    const user: User | null = this.authService.getUser(); // Get current user as User type

    // 1. Check if user is authenticated and token is valid
    if (!isAuth || (token && this.authService.isTokenExpired(token))) {
      console.warn('AuthGuard: User not authenticated or token expired. Redirecting to login.');
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } }); // Redirect to login
      return false;
    }

    // 2. If expectedRoles are defined, check if user has the required role
    if (expectedRoles && expectedRoles.length > 0) {
      if (!user) {
        console.warn('AuthGuard: User object not found for role check. Redirecting to login.');
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
      }

      // Check if the user's role_id is included in the expectedRoles array
      if (!expectedRoles.includes(user.role_id)) {
        console.warn(`AuthGuard: User role (ID: ${user.role_id}) not authorized for this route. Expected roles: ${expectedRoles}.`);
        this.router.navigate(['/']); // Redirect to a default unathorized page or home
        return false;
      }
    }

    // If all checks pass
    return true;
  }
}

