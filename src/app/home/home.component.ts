import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';
import { SearchComponent } from '../features/search/search.component';
import { take } from 'rxjs/operators';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule,
    RouterLink,
    SearchComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  currentUser$: Observable<User | null> = inject(AuthService).currentUser$;

  joinCode: string = '';

  constructor(
    private router: Router, 
    private sessionService: SessionService, 
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  createSession(): void {
    this.authService.currentUser$.pipe(take(1)).subscribe(user => {
      if (user) {
        this.sessionService.createSession(user.uid).subscribe({
          next: (sessionId) => {
            this.snackBar.open('Session created successfully!', 'Close', { duration: 3000 });
            this.router.navigate(['/session', sessionId]);
          },
          error: (error) => {
            this.snackBar.open('Failed to create session', 'Close', { duration: 5000 });
          }
        });
      } else {
        this.snackBar.open('Please log in to create a session', 'Close', { duration: 5000 });
        this.router.navigate(['/login']);
      }
    });
  }

  joinSession(): void {
    if (this.joinCode.trim()) {
      this.router.navigate(['/session', this.joinCode.trim()]);
    } else {
      this.snackBar.open('Please enter a session code', 'Close', { duration: 3000 });
    }
  }
}
