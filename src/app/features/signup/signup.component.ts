import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
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
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;
  errorMessage: string = '';
  private authService: AuthService = inject(AuthService);
  private readonly router: Router = inject(Router);
  private snackBar = inject(MatSnackBar);

  constructor(private fb: FormBuilder) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSignup(): void {
    if (this.signupForm.valid) {
      this.errorMessage = '';
      const { name, email, password } = this.signupForm.value;
      this.authService.signup(name, email, password).subscribe({
        next: () => {
          this.snackBar.open('Sign up successful!', 'Close', { duration: 3000 });
          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.errorMessage = error.message || 'An error occurred during sign up.';
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
