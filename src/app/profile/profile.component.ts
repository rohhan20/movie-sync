import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { Movie } from '../models/movie.model';
import { UserService } from '../services/user.service';
import { MovieService } from '../services/movie.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatSelectModule,
    MatSliderModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user$: Observable<User | null>;
  watchedMovies$: Observable<Movie[]>;
  recommendations$: Observable<Movie[]>;
  watchedMovieIds: number[] = [];

  genres: { id: number, name: string }[] = [];
  selectedGenre: number | null = null;
  selectedYear: number | null = null;
  selectedRating: number | null = null;

  constructor(
    private userService: UserService,
    private movieService: MovieService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.user$ = this.userService.getUserProfile();
    this.watchedMovies$ = this.userService.getWatchedMovies();
    this.recommendations$ = of([]);
  }

  ngOnInit(): void {
    this.userService.getWatchedMovies().pipe(
      map(movies => movies.map(m => m.id))
    ).subscribe(ids => this.watchedMovieIds = ids);

    this.applyFilters();

    this.movieService.getGenres().subscribe(genres => this.genres = genres);
  }

  applyFilters(): void {
    const filters = {
      genre: this.selectedGenre,
      year: this.selectedYear,
      rating: this.selectedRating
    };

    this.recommendations$ = this.user$.pipe(
      switchMap(user => {
        if (user) {
          return this.movieService.getRecommendations([user.uid], filters, this.watchedMovieIds);
        }
        return of([]);
      })
    );
  }

  removeMovieFromWatched(movieId: number): void {
    this.userService.removeFromWatched(movieId).subscribe({
      next: () => {
        this.snackBar.open('Movie removed from watched list', 'Close', { duration: 3000 });
      },
      error: (error) => {
        this.snackBar.open('Failed to remove movie', 'Close', { duration: 5000 });
      }
    });
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
}
