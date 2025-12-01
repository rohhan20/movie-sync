import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Movie } from '../../models/movie.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.css']
})
export class MovieCardComponent {
  @Input() movie!: Movie;
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);

  addToWatched(movie: Movie): void {
    this.userService.addToWatched(movie).subscribe(() => {
      this.snackBar.open(`${movie.title} has been added to your watched list.`, 'Close', {
        duration: 3000,
        verticalPosition: 'top',
      });
    });
  }
}
