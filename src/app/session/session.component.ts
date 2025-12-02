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
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Session } from '../models/session.model';
import { SessionService } from '../services/session.service';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';
import { Movie } from '../models/movie.model';
import { MovieService } from '../services/movie.service';
import { UserService } from '../services/user.service';

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
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css']
})
export class SessionComponent implements OnInit, OnDestroy {
  session$: Observable<Session | null>;
  filteredSession$: Observable<Session | null>;
  members$: Observable<{ id: string, name: string }[]> = of([]);
  currentUser: User | null = null;
  isLoading = true;
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
    private movieService: MovieService,
    private userService: UserService,
    private snackBar: MatSnackBar
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
          this.isLoading = true;
          this.sessionService.joinSession(this.sessionId, this.currentUser.uid).subscribe({
            next: () => {
              this.snackBar.open('Joined session successfully!', 'Close', { duration: 3000 });
            },
            error: (error) => {
              this.snackBar.open('Failed to join session', 'Close', { duration: 5000 });
            }
          });
          return this.sessionService.getSession(this.sessionId);
        }
        return of(null);
      })
    );

    // Get member names
    this.members$ = this.session$.pipe(
      switchMap(session => {
        if (!session || !session.members.length) {
          return of([]);
        }
        const memberObservables = session.members.map(memberId =>
          this.userService.getUserById(memberId).pipe(
            map(user => ({ id: memberId, name: user?.displayName || 'Unknown User' }))
          )
        );
        return combineLatest(memberObservables);
      })
    );

    this.filteredSession$ = combineLatest([this.session$, this.filters$]).pipe(
      map(([session, filters]) => {
        if (!session) {
          this.isLoading = false;
          return null;
        }
        this.isLoading = false;
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
    if (this.sessionId && this.currentUser) {
      this.sessionService.leaveSession(this.sessionId, this.currentUser.uid).subscribe({
        next: () => {
          this.snackBar.open('Left session', 'Close', { duration: 3000 });
          this.router.navigate(['/home']);
        },
        error: () => {
          this.router.navigate(['/home']);
        }
      });
    } else {
      this.router.navigate(['/home']);
    }
  }

  copySessionCode(): void {
    if (this.sessionId) {
      navigator.clipboard.writeText(this.sessionId).then(() => {
        this.snackBar.open('Session code copied to clipboard!', 'Close', { duration: 3000 });
      }).catch(() => {
        this.snackBar.open('Failed to copy session code', 'Close', { duration: 3000 });
      });
    }
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'https://via.placeholder.com/500x750?text=No+Image';
    }
  }

  viewMovieDetails(movie: Movie): void {
    this.router.navigate(['/movie', movie.id], {
      state: { movie }
    });
  }

  selectMovie(movie: Movie): void {
    if (!this.sessionId) return;

    this.sessionService.selectMovie(this.sessionId, movie).subscribe({
      next: () => {
        this.snackBar.open(`"${movie.title}" selected! Adding to all members' watched lists...`, 'Close', { duration: 3000 });
        // Add to all members' watched lists
        this.sessionService.addSelectedMovieToAllMembers(this.sessionId!).subscribe({
          next: () => {
            this.snackBar.open('Movie added to all members\' watched lists!', 'Close', { duration: 5000 });
          },
          error: () => {
            this.snackBar.open('Failed to add movie to all members\' watched lists', 'Close', { duration: 5000 });
          }
        });
      },
      error: () => {
        this.snackBar.open('Failed to select movie', 'Close', { duration: 5000 });
      }
    });
  }
}
