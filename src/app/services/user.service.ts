import { Injectable, inject } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from '@angular/fire/firestore';
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

  constructor(private authService: AuthService) { }

  getUserProfile(): Observable<User | null> {
    return this.authService.currentUser$.pipe(
      switchMap(user => {
        if (user) {
          const userDoc = doc(this.firestore, `users/${user.uid}`);
          return from(getDoc(userDoc)).pipe(
            map(docSnap => docSnap.exists() ? docSnap.data() as User : null)
          );
        } else {
          return of(null);
        }
      })
    );
  }

  getWatchedMovies(userId?: string): Observable<Movie[]> {
    const targetUserId = userId || this.authService.currentUserValue?.uid;
    if (!targetUserId) {
      return of([]);
    }
    
    const userDoc = doc(this.firestore, `users/${targetUserId}`);
    return from(getDoc(userDoc)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          const userData = docSnap.data() as User;
          return userData.watchedMovies || [];
        }
        return [];
      })
    );
  }

  addToWatched(movie: Movie): Observable<void> {
    const user = this.authService.currentUserValue;
    if (!user) {
      return of(undefined);
    }
    
    const userDoc = doc(this.firestore, `users/${user.uid}`);
    return from(getDoc(userDoc)).pipe(
      switchMap(docSnap => {
        if (docSnap.exists()) {
          const userData = docSnap.data() as User;
          const watchedMovies = userData.watchedMovies || [];
          // Check if movie already exists
          if (!watchedMovies.some(m => m.id === movie.id)) {
            return from(updateDoc(userDoc, {
              watchedMovies: arrayUnion(movie)
            }));
          }
          return of(undefined);
        } else {
          return from(setDoc(userDoc, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            watchedMovies: [movie]
          }));
        }
      })
    ) as Observable<void>;
  }

  removeFromWatched(movieId: number): Observable<void> {
    const user = this.authService.currentUserValue;
    if (!user) {
      return of(undefined);
    }
    
    const userDoc = doc(this.firestore, `users/${user.uid}`);
    return from(getDoc(userDoc)).pipe(
      switchMap(docSnap => {
        if (docSnap.exists()) {
          const userData = docSnap.data() as User;
          const watchedMovies = userData.watchedMovies || [];
          const movieToRemove = watchedMovies.find(m => m.id === movieId);
          if (movieToRemove) {
            return from(updateDoc(userDoc, {
              watchedMovies: arrayRemove(movieToRemove)
            }));
          }
        }
        return of(undefined);
      })
    ) as Observable<void>;
  }

  getUserById(userId: string): Observable<User | null> {
    const userDoc = doc(this.firestore, `users/${userId}`);
    return from(getDoc(userDoc)).pipe(
      map(docSnap => docSnap.exists() ? docSnap.data() as User : null)
    );
  }
}
