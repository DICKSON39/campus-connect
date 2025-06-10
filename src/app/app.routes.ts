import { Routes } from '@angular/router';
import {LandingPageComponent} from '../pages/landing-page/landing-page.component';
import {RegisterComponent} from '../pages/register/register.component';
import {LoginComponent} from '../pages/login/login.component';
import {ProfilePageComponent} from '../pages/profile-page/profile-page.component';
import {AuthGuard} from './auth.guard';
import {AdminDashboardComponent} from '../pages/admin-dashboard/admin-dashboard.component';

export const routes: Routes = [
  {path:'',component:LandingPageComponent},
  {path:'register',component:RegisterComponent},
  {path:'login',component:LoginComponent},
  {
    path:'profile',
    component:ProfilePageComponent,
    canActivate: [AuthGuard],

  },

  {
    path: 'admin/dashboard',
    component:AdminDashboardComponent,
    canActivate: [AuthGuard],
    data: {
      roles:[1]
    },
  }
];
