import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../../services/movie.service';
import { UserService } from '../../services/user.service';
import { Movie } from '../../models/movie.model';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  searchQuery = '';
  searchResults$: Observable<Movie[]> = of([]);

  constructor(private movieService: MovieService, private userService: UserService) { }

  search(): void {
    if (this.searchQuery.trim()) {
      this.searchResults$ = this.movieService.searchMovies(this.searchQuery);
    } else {
      this.searchResults$ = of([]);
    }
  }

  addToWatched(movie: Movie): void {
    this.userService.addToWatched(movie).subscribe(success => {
      if (success) {
        console.log(`Added ${movie.title} to watched list.`);
        // Optionally, provide user feedback
      } else {
        console.log(`${movie.title} is already in the watched list.`);
        // Optionally, provide user feedback
      }
    });
  }
}
