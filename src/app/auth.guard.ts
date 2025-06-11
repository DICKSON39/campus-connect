import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthServiceService, User } from '../services/auth-service.service';
import { map, catchError, switchMap } from 'rxjs/operators';

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
  ): Observable<boolean> {
    const isAuth = this.authService.isAuthenticated();
    const token = this.authService.getToken();

    // 1. Check if user is not authenticated or token is expired
    if (!isAuth || (token && this.authService.isTokenExpired(token))) {
      console.warn('AuthGuard: Not authenticated or token expired.');
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return of(false);
    }

    // 2. Get expected roles from route
    const expectedRoles: number[] = route.data['roles'];

    // 3. Get the user from observable
    return this.authService.getUser().pipe(
      map((user: User | null) => {
        if (!user) {
          console.warn('AuthGuard: No user found.');
          this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
          return false;
        }

        if (expectedRoles && expectedRoles.length > 0) {
          if (!expectedRoles.includes(user.role_id)) {
            console.warn(`AuthGuard: Role ID ${user.role_id} not authorized. Expected roles: ${expectedRoles}`);
            this.router.navigate(['/']); // Redirect to home or unauthorized page
            return false;
          }
        }

        return true;
      }),
      catchError((err) => {
        console.error('AuthGuard: Error fetching user.', err);
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return of(false);
      })
    );
  }
}
