import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../../services/movie.service';
import { UserService } from '../../services/user.service';
import { Movie } from '../../models/movie.model';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSliderModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  searchQuery = '';
  searchResults$: Observable<Movie[]> = of([]);
  watchedMovieIds: number[] = [];

  genres: { id: number, name: string }[] = [];
  selectedGenre: number | null = null;
  selectedYear: number | null = null;
  selectedRating: number | null = null;

  constructor(
    private movieService: MovieService, 
    private userService: UserService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userService.getWatchedMovies().pipe(
      map(movies => movies.map(m => m.id))
    ).subscribe(ids => this.watchedMovieIds = ids);

    this.movieService.getGenres().subscribe(genres => this.genres = genres);
  }

  search(): void {
    const filters = {
      genre: this.selectedGenre,
      year: this.selectedYear,
      rating: this.selectedRating
    };
    this.searchResults$ = this.movieService.searchMovies(this.searchQuery, filters, this.watchedMovieIds);
  }

  addToWatched(movie: Movie): void {
    this.userService.addToWatched(movie).subscribe({
      next: () => {
        this.snackBar.open(`Added "${movie.title}" to your watched list!`, 'Close', { duration: 3000 });
        // Remove from search results
        this.searchResults$ = this.searchResults$.pipe(
          map(movies => movies.filter(m => m.id !== movie.id))
        );
      },
      error: (error) => {
        this.snackBar.open('Failed to add movie to watched list', 'Close', { duration: 5000 });
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
