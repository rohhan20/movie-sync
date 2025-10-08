import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user.model';
import { Movie } from '../models/movie.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private mockUsers: User[] = [
    {
      uid: '123',
      email: 'user@example.com',
      displayName: 'Test User',
      watchedMovies: [
        { id: '4', title: 'Parasite', description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.', posterUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg' },
      ]
    }
  ];

  private currentUser: BehaviorSubject<User | null>;

  constructor(private authService: AuthService) {
    this.currentUser = new BehaviorSubject<User | null>(null);
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        const foundUser = this.mockUsers.find(u => u.uid === user.uid);
        this.currentUser.next(foundUser || null);
      } else {
        this.currentUser.next(null);
      }
    });
  }

  getUserProfile(): Observable<User | null> {
    return this.currentUser.asObservable();
  }

  getWatchedMovies(): Observable<Movie[]> {
    return this.currentUser.pipe(
      map(user => user ? user.watchedMovies : [])
    );
  }

  addToWatched(movie: Movie): Observable<boolean> {
    const user = this.currentUser.value;
    if (!user) {
      return throwError(() => new Error('User not logged in'));
    }

    const alreadyWatched = user.watchedMovies.find(m => m.id === movie.id);
    if (alreadyWatched) {
      return of(false); // Already in the list
    }

    user.watchedMovies.push(movie);
    this.currentUser.next(user);
    return of(true);
  }

  removeFromWatched(movieId: string): Observable<boolean> {
    const user = this.currentUser.value;
    if (!user) {
      return throwError(() => new Error('User not logged in'));
    }

    const movieIndex = user.watchedMovies.findIndex(m => m.id === movieId);
    if (movieIndex > -1) {
      user.watchedMovies.splice(movieIndex, 1);
      this.currentUser.next(user);
      return of(true);
    }

    return of(false); // Not found
  }
}