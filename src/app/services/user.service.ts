import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, getDoc, getDocs, setDoc, deleteDoc, collectionData } from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { Movie } from '../models/movie.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore: Firestore = inject(Firestore);
  private usersCollection = collection(this.firestore, 'users');

  constructor(private authService: AuthService) { }

  getUserProfile(): Observable<User | null> {
    return this.authService.currentUser$.pipe(
      switchMap(user => {
        if (user) {
          const userDoc = doc(this.usersCollection, user.uid);
          return from(getDoc(userDoc)).pipe(
            map(docSnap => docSnap.exists() ? docSnap.data() as User : null)
          );
        } else {
          return of(null);
        }
      })
    );
  }

  getWatchedMovies(): Observable<Movie[]> {
    return this.authService.currentUser$.pipe(
      switchMap(user => {
        if (user) {
          const watchedMoviesCollection = collection(doc(this.usersCollection, user.uid), 'watchedMovies');
          return collectionData(watchedMoviesCollection, { idField: 'id' }) as Observable<Movie[]>;
        } else {
          return of([]);
        }
      })
    );
  }

  addToWatched(movie: Movie): Observable<void> {
    const user = this.authService.currentUserValue;
    if (!user) {
      return of(undefined);
    }
    const watchedMovieDoc = doc(collection(doc(this.usersCollection, user.uid), 'watchedMovies'), movie.id);
    return from(setDoc(watchedMovieDoc, movie));
  }

  removeFromWatched(movieId: string): Observable<void> {
    const user = this.authService.currentUserValue;
    if (!user) {
      return of(undefined);
    }
    const watchedMovieDoc = doc(collection(doc(this.usersCollection, user.uid), 'watchedMovies'), movieId);
    return from(deleteDoc(watchedMovieDoc));
  }
}
