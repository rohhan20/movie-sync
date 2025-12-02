import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  private authService: AuthService = inject(AuthService);
  private readonly router: Router = inject(Router);
  private snackBar = inject(MatSnackBar);

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.errorMessage = '';
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
            this.router.navigate(['/home']);
          } else {
            this.errorMessage = response.error?.message || 'Login failed. Please check your credentials.';
            this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
          }
        },
        error: (error) => {
          this.errorMessage = error.message || 'An error occurred during login.';
          this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
        }
      });
    }
  }

  onGoogleSignIn(): void {
    this.errorMessage = '';
    this.authService.signInWithGoogle().subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Google sign-in successful!', 'Close', { duration: 3000 });
          this.router.navigate(['/home']);
        } else {
          this.errorMessage = response.error?.message || 'Google sign-in failed.';
          this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
        }
      },
      error: (error) => {
        this.errorMessage = error.message || 'An error occurred during Google sign-in.';
        this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
      }
    });
  }
}
