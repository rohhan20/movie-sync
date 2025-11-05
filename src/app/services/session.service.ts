import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Movie } from '../models/movie.model';
import { MovieService } from './movie.service';
import { Session } from '../models/session.model';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private sessions: { [id: string]: Session } = {};
  private sessionSubjects: { [id: string]: BehaviorSubject<Session | null> } = {};

  constructor(private movieService: MovieService) { }

  private getSessionSubject(sessionId: string): BehaviorSubject<Session | null> {
    if (!this.sessionSubjects[sessionId]) {
      this.sessionSubjects[sessionId] = new BehaviorSubject<Session | null>(this.sessions[sessionId] || null);
    }
    return this.sessionSubjects[sessionId];
  }

  createSession(userId: string): Observable<Session> {
    const sessionId = Math.random().toString(36).substring(2, 8);
    const newSession: Session = {
      id: sessionId,
      members: [userId],
      recommendations: []
    };
    this.sessions[sessionId] = newSession;
    this.getSessionSubject(sessionId).next(newSession);
    return this.updateRecommendations(sessionId);
  }

  joinSession(sessionId: string, userId: string): Observable<Session> {
    const session = this.sessions[sessionId];
    if (session && !session.members.includes(userId)) {
      session.members.push(userId);
      this.getSessionSubject(sessionId).next(session);
      return this.updateRecommendations(sessionId);
    }
    return of(session);
  }

  leaveSession(sessionId: string, userId: string): void {
    const session = this.sessions[sessionId];
    if (session) {
      session.members = session.members.filter(uid => uid !== userId);
      if (session.members.length === 0) {
        delete this.sessions[sessionId];
        this.getSessionSubject(sessionId).next(null);
        delete this.sessionSubjects[sessionId];
      } else {
        this.getSessionSubject(sessionId).next(session);
        this.updateRecommendations(sessionId).subscribe();
      }
    }
  }

  getSession(sessionId: string): Observable<Session | null> {
    return this.getSessionSubject(sessionId).asObservable();
  }

  private updateRecommendations(sessionId: string): Observable<Session> {
    const session = this.sessions[sessionId];
    return this.movieService.getRecommendations(session.members).pipe(
      map(recommendations => {
        session.recommendations = recommendations;
        this.getSessionSubject(sessionId).next(session);
        return session;
      })
    );
  }
}
