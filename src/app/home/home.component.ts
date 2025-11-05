import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../services/auth.service';

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
    AsyncPipe
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  readonly currentUser$ = inject(AuthService).currentUser$;

  joinCode: string = '';

  constructor(private router: Router) {}

  createSession(): void {
    // Generate a random session ID for the mock implementation
    const newSessionId = Math.random().toString(36).substring(2, 8);
    this.router.navigate(['/session', newSessionId]);
  }

  joinSession(): void {
    if (this.joinCode.trim()) {
      this.router.navigate(['/session', this.joinCode.trim()]);
    }
  }
}