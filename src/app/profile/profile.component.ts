import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { startWith, switchMap, map } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';

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
    MatAutocompleteModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatSelectModule,
    MatSliderModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user$: Observable<User | null>;
  watchedMovies$: Observable<Movie[]>;
  recommendations$: Observable<Movie[]>;
  searchControl = new FormControl();
  filteredMovies$: Observable<Movie[]>;
  watchedMovieIds: string[] = [];

  genres: string[] = [];
  selectedGenre = '';
  selectedYear: number | null = null;
  selectedRating: number | null = null;

  constructor(
    private userService: UserService,
    private movieService: MovieService
  ) {
    this.user$ = this.userService.getUserProfile();
    this.watchedMovies$ = this.userService.getWatchedMovies();
    this.filteredMovies$ = of([]);
    this.recommendations$ = of([]);
  }

  ngOnInit(): void {
    this.userService.getWatchedMovies().pipe(
      map(movies => movies.map(m => m.id))
    ).subscribe(ids => this.watchedMovieIds = ids);

    this.filteredMovies$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      switchMap(value => {
        if (typeof value === 'string' && value.length > 1) {
          return this.movieService.searchMovies(value, this.watchedMovieIds);
        } else {
          return of([]);
        }
      })
    );

    this.applyFilters();

    this.movieService.getAllMovies().pipe(
      map(movies => [...new Set(movies.map(m => m.genre))])
    ).subscribe(genres => this.genres = genres);
  }

  applyFilters(): void {
    this.recommendations$ = this.user$.pipe(
      switchMap(user => {
        if (user) {
          return this.movieService.getRecommendations([user.uid], this.watchedMovieIds);
        }
        return of([]);
      }),
      map(movies => movies.filter(movie => {
        const genreMatch = !this.selectedGenre || movie.genre === this.selectedGenre;
        const yearMatch = !this.selectedYear || movie.year === this.selectedYear;
        const ratingMatch = !this.selectedRating || movie.rating >= this.selectedRating;
        return genreMatch && yearMatch && ratingMatch;
      }))
    );
  }

  displayMovie(movie: Movie): string {
    return movie ? movie.title : '';
  }

  addMovieToWatched(movie: Movie): void {
    this.userService.addToWatched(movie).subscribe(() => {
      this.searchControl.setValue('');
    });
  }

  removeMovieFromWatched(movieId: string): void {
    this.userService.removeFromWatched(movieId).subscribe();
  }
}
