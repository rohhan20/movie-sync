import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { SessionComponent } from './session/session.component';
import { SignupComponent } from './features/signup/signup.component';
import { MovieDetailComponent } from './movie-detail/movie-detail.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'session/:id', component: SessionComponent, canActivate: [authGuard] },
  { path: 'movie/:id', component: MovieDetailComponent },
  { path: '**', redirectTo: 'home' }
];
