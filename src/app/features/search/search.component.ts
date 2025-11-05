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

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSliderModule
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  searchQuery = '';
  searchResults$: Observable<Movie[]> = of([]);
  watchedMovieIds: string[] = [];

  genres: string[] = [];
  selectedGenre = '';
  selectedYear: number | null = null;
  selectedRating: number | null = null;

  constructor(private movieService: MovieService, private userService: UserService) { }

  ngOnInit(): void {
    this.userService.getWatchedMovies().pipe(
      map(movies => movies.map(m => m.id))
    ).subscribe(ids => this.watchedMovieIds = ids);

    this.movieService.getAllMovies().pipe(
      map(movies => [...new Set(movies.map(m => m.genre))])
    ).subscribe(genres => this.genres = genres);
  }

  search(): void {
    this.searchResults$ = this.movieService.searchMovies(this.searchQuery, this.watchedMovieIds).pipe(
      map(movies => movies.filter(movie => {
        const genreMatch = !this.selectedGenre || movie.genre === this.selectedGenre;
        const yearMatch = !this.selectedYear || movie.year === this.selectedYear;
        const ratingMatch = !this.selectedRating || movie.rating >= this.selectedRating;
        return genreMatch && yearMatch && ratingMatch;
      }))
    );
  }

  addToWatched(movie: Movie): void {
    this.userService.addToWatched(movie).subscribe(() => {
      console.log(`Added ${movie.title} to watched list.`);
    });
  }
}
