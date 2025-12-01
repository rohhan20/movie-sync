import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, of, Subscription, BehaviorSubject, combineLatest } from 'rxjs';
import { switchMap, take, map } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { Session } from '../models/session.model';
import { SessionService } from '../services/session.service';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';
import { MovieService } from '../services/movie.service';

@Component({
  selector: 'app-session',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatGridListModule,
    MatButtonModule,
    MatListModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSliderModule
  ],
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css']
})
export class SessionComponent implements OnInit, OnDestroy {
  session$: Observable<Session | null>;
  filteredSession$: Observable<Session | null>;
  currentUser: User | null = null;
  private sessionSubscription: Subscription | undefined;
  private sessionId: string | null = null;

  genres: { id: number, name: string }[] = [];
  selectedGenre: number | null = null;
  selectedYear: number | null = null;
  selectedRating: number | null = null;

  private filters$ = new BehaviorSubject<{ genre: number | null, year: number | null, rating: number | null }>({
    genre: null,
    year: null,
    rating: null
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sessionService: SessionService,
    private authService: AuthService,
    private movieService: MovieService
  ) {
    this.session$ = of(null);
    this.filteredSession$ = of(null);
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

    this.filteredSession$ = combineLatest([this.session$, this.filters$]).pipe(
      map(([session, filters]) => {
        if (!session) {
          return null;
        }
        const recommendations = session.recommendations.filter(movie => {
          const genreMatch = !filters.genre || movie.genre_ids.includes(filters.genre);
          const yearMatch = !filters.year || new Date(movie.release_date).getFullYear() === filters.year;
          const ratingMatch = !filters.rating || movie.vote_average >= filters.rating;
          return genreMatch && yearMatch && ratingMatch;
        });
        return { ...session, recommendations };
      })
    );

    this.movieService.getGenres().subscribe(genres => this.genres = genres);
  }

  ngOnDestroy(): void {
    if (this.sessionId && this.currentUser) {
      this.sessionService.leaveSession(this.sessionId, this.currentUser.uid);
    }
    if (this.sessionSubscription) {
      this.sessionSubscription.unsubscribe();
    }
  }

  applyFilters(): void {
    this.filters$.next({
      genre: this.selectedGenre,
      year: this.selectedYear,
      rating: this.selectedRating
    });
  }

  leaveSession(): void {
    this.router.navigate(['/home']);
  }
}
