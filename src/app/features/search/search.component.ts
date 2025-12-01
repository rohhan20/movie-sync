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
  watchedMovieIds: number[] = [];

  genres: { id: number, name: string }[] = [];
  selectedGenre: number | null = null;
  selectedYear: number | null = null;
  selectedRating: number | null = null;

  constructor(private movieService: MovieService, private userService: UserService) { }

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
    this.userService.addToWatched(movie).subscribe(() => {
      console.log(`Added ${movie.title} to watched list.`);
    });
  }
}
