import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, getDoc } from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Movie } from '../models/movie.model';
import { MovieService } from './movie.service';
import { Session } from '../models/session.model';
import { collectionData } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private firestore: Firestore = inject(Firestore);
  private sessionsCollection = collection(this.firestore, 'sessions');

  constructor(private movieService: MovieService) { }

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
    // This is a simplified recommendation logic. In a real app, this would be more complex.
    return this.movieService.getAllMovies().pipe(
      map(movies => {
        // Get a list of all movies watched by all members in the session.
        // This would require fetching each user's watched list, which is out of scope for this example.
        // For now, we will just recommend movies that none of the users have watched.
        const watchedMovieIds = session.members.reduce((acc, memberId) => {
          // In a real app, you would fetch the watched movies for each member.
          // For now, we'll just use an empty array.
          return acc;
        }, [] as string[]);

        const recommendations = movies.filter(movie => !watchedMovieIds.includes(movie.id)).slice(0, 5);
        const sessionDoc = doc(this.sessionsCollection, session.id);
        updateDoc(sessionDoc, { recommendations });
        return { ...session, recommendations };
      })
    );
  }
}
