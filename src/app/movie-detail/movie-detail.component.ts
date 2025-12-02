import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MovieService } from '../services/movie.service';
import { UserService } from '../services/user.service';
import { Movie } from '../models/movie.model';
import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.css']
})
export class MovieDetailComponent implements OnInit {
  movie$: Observable<Movie | null> = of(null);
  genres$: Observable<{ id: number, name: string }[]> = of([]);
  movieGenres: string[] = [];
  isInWatchedList = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Try to get movie from route state first (passed from navigation)
    const navigation = this.router.getCurrentNavigation();
    const movieFromState = navigation?.extras?.state?.['movie'] as Movie;

    this.movie$ = this.route.paramMap.pipe(
      switchMap(params => {
        const movieId = params.get('id');
        if (movieFromState && movieFromState.id.toString() === movieId) {
          // Use movie from navigation state
          return of(movieFromState);
        } else if (movieId) {
          // Fetch movie by ID from API
          return this.movieService.getMovieById(parseInt(movieId, 10));
        }
        return of(null);
      })
    );

    // Get genres
    this.movieService.getGenres().subscribe(genres => {
      this.genres$ = of(genres);
      // Update movie genres when movie loads
      this.movie$.subscribe(movie => {
        if (movie && genres) {
          this.movieGenres = movie.genre_ids
            .map(id => genres.find(g => g.id === id)?.name)
            .filter(name => name !== undefined) as string[];
        }
      });
    });

    // Check if movie is in watched list
    this.movie$.pipe(
      switchMap(movie => {
        if (movie) {
          return this.userService.getWatchedMovies().pipe(
            map(watchedMovies => watchedMovies.some(m => m.id === movie.id))
          );
        }
        return of(false);
      })
    ).subscribe(isWatched => {
      this.isInWatchedList = isWatched;
    });
  }

  addToWatched(movie: Movie): void {
    this.userService.addToWatched(movie).subscribe({
      next: () => {
        this.snackBar.open(`Added "${movie.title}" to your watched list!`, 'Close', { duration: 3000 });
        this.isInWatchedList = true;
      },
      error: () => {
        this.snackBar.open('Failed to add movie to watched list', 'Close', { duration: 5000 });
      }
    });
  }

  removeFromWatched(movieId: number): void {
    this.userService.removeFromWatched(movieId).subscribe({
      next: () => {
        this.snackBar.open('Movie removed from watched list', 'Close', { duration: 3000 });
        this.isInWatchedList = false;
      },
      error: () => {
        this.snackBar.open('Failed to remove movie', 'Close', { duration: 5000 });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'https://via.placeholder.com/500x750?text=No+Image';
    }
  }
}

