import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { startWith, switchMap, map } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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
    MatCardModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user$: Observable<User | null>;
  watchedMovies$: Observable<Movie[]>;
  searchControl = new FormControl();
  filteredMovies$: Observable<Movie[]>;

  constructor(
    private userService: UserService,
    private movieService: MovieService
  ) {
    this.user$ = this.userService.getUserProfile();
    this.watchedMovies$ = this.userService.getWatchedMovies();
    this.filteredMovies$ = of([]);
  }

  ngOnInit(): void {
    this.filteredMovies$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      switchMap(value => {
        if (typeof value === 'string' && value.length > 1) {
          return this.movieService.searchMovies(value);
        } else {
          return of([]);
        }
      })
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