import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable, of, Subscription } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { Session } from '../models/session.model';
import { SessionService } from '../services/session.service';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-session',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatGridListModule,
    MatButtonModule,
    MatListModule
  ],
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css']
})
export class SessionComponent implements OnInit, OnDestroy {
  session$: Observable<Session | null>;
  currentUser: User | null = null;
  private sessionSubscription: Subscription | undefined;
  private sessionId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sessionService: SessionService,
    private authService: AuthService
  ) {
    this.session$ = of(null);
    this.authService.currentUser$.pipe(take(1)).subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnInit(): void {
    this.session$ = this.route.paramMap.pipe(
      switchMap(params => {
        this.sessionId = params.get('id');
        if (this.sessionId && this.currentUser) {
          this.sessionService.joinSession(this.sessionId, this.currentUser.uid).subscribe();
          return this.sessionService.getSession(this.sessionId);
        }
        return of(null);
      })
    );
  }

  ngOnDestroy(): void {
    if (this.sessionId && this.currentUser) {
      this.sessionService.leaveSession(this.sessionId, this.currentUser.uid);
    }
    if (this.sessionSubscription) {
      this.sessionSubscription.unsubscribe();
    }
  }

  leaveSession(): void {
    this.router.navigate(['/home']);
  }
}
