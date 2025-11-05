import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, getDoc } from '@angular/fire/firestore';
import { Observable, from, of, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Movie } from '../models/movie.model';
import { MovieService } from './movie.service';
import { Session } from '../models/session.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private firestore: Firestore = inject(Firestore);
  private sessionsCollection = collection(this.firestore, 'sessions');

  constructor(private movieService: MovieService, private userService: UserService) { }

  createSession(userId: string): Observable<string> {
    const newSessionRef = doc(this.sessionsCollection);
    const newSession: Session = {
      id: newSessionRef.id,
      members: [userId],
      recommendations: []
    };
    return from(setDoc(newSessionRef, newSession)).pipe(
      map(() => newSessionRef.id)
    );
  }

  joinSession(sessionId: string, userId: string): Observable<void> {
    const sessionDoc = doc(this.sessionsCollection, sessionId);
    return from(updateDoc(sessionDoc, {
      members: arrayUnion(userId)
    }));
  }

  leaveSession(sessionId: string, userId: string): Observable<void> {
    const sessionDoc = doc(this.sessionsCollection, sessionId);
    return from(updateDoc(sessionDoc, {
      members: arrayRemove(userId)
    }));
  }

  getSession(sessionId: string): Observable<Session | null> {
    const sessionDoc = doc(this.sessionsCollection, sessionId);
    return new Observable(subscriber => {
      const unsubscribe = onSnapshot(sessionDoc, (docSnap) => {
        if (docSnap.exists()) {
          const session = { id: docSnap.id, ...docSnap.data() } as Session;
          this.updateRecommendations(session).subscribe(updatedSession => {
            subscriber.next(updatedSession);
          });
        } else {
          subscriber.next(null);
        }
      });
      return () => unsubscribe();
    });
  }

  private updateRecommendations(session: Session): Observable<Session> {
    const memberWatchedMovies$ = session.members.map(memberId => this.userService.getWatchedMovies());

    return combineLatest(memberWatchedMovies$).pipe(
      switchMap(watchedMoviesByMember => {
        const allWatchedMovieIds = watchedMoviesByMember.flat().map(movie => movie.id);
        const uniqueWatchedMovieIds = [...new Set(allWatchedMovieIds)];

        return this.movieService.getRecommendations(session.members, {}, uniqueWatchedMovieIds);
      }),
      map(recommendations => {
        const sessionDoc = doc(this.sessionsCollection, session.id);
        updateDoc(sessionDoc, { recommendations });
        return { ...session, recommendations };
      })
    );
  }
}
