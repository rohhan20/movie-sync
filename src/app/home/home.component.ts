import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';
import { SearchComponent } from '../features/search/search.component';
import { take } from 'rxjs/operators';

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
    SearchComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  readonly currentUser$ = inject(AuthService).currentUser$;

  joinCode: string = '';

  constructor(private router: Router, private sessionService: SessionService, private authService: AuthService) {}

  createSession(): void {
    this.authService.currentUser$.pipe(take(1)).subscribe(user => {
      if (user) {
        this.sessionService.createSession(user.uid).subscribe(session => {
          this.router.navigate(['/session', session.id]);
        });
      } else {
        // Handle case where user is not logged in
        console.error('User not logged in, cannot create session.');
      }
    });
  }

  joinSession(): void {
    if (this.joinCode.trim()) {
      this.router.navigate(['/session', this.joinCode.trim()]);
    }
  }
}
